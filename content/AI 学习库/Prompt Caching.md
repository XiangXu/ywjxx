---
title: "Prompt Caching（提示缓存）"
aliases:
  - Prompt Caching
  - 提示缓存
  - Cache Control
tags:
  - AI
  - LLM
  - Claude-API
  - Cost-Optimization
  - Interview-Prep
created: 2026-10-15
---
# Prompt Caching（提示缓存）

## 1. 核心概念 Overview

### 1.1 通俗解释

想象你每天去同一家奶茶店，每次都要先把一长串会员信息、口味偏好念一遍，最后才说“今天要一杯奶茶”。

如果店员把你前面那一长串**记在小本子上**，下次你只要说“老样子，今天要一杯奶茶”，点单就快多了、也省事多了。

Prompt caching 就是这个小本子：**前面不变的那一大段只处理一次，之后直接复用。**

### 1.2 技术解释

每次 API 调用都是无状态的，客户端会重发完整的 prompt（system、tools、历史消息）。如果每次请求的**开头部分都一样**，模型每次都要重新处理（prefill）这一大段，既花钱又花时间。

**Prompt caching** 让 API 把已处理过的**前缀（prefix）**缓存起来。下次请求的开头字节完全相同时，直接读取缓存：

- **更便宜**：缓存读取约为普通输入价格的 **0.1×**（Opus 5.5 为 0.05×）。
- **更快**：跳过前缀的 prefill，**TTFT 降低**。

> [!abstract] 一句话理解
> Prompt caching 缓存的是 **prompt 前缀的计算结果**，不是模型的回答。命中的前提是：前缀**逐字节完全一致**。

> [!example] 类比
> 像 HTTP 缓存 / CDN：同一个资源只在第一次请求时回源，之后直接命中缓存。区别是这里的“缓存键”是 prompt 前缀的字节，改一个字节就不命中。

## 2. 唯一的核心规则：前缀匹配（Prefix Match）

> [!important] 核心规则
> **Prompt caching 是前缀匹配。前缀中任何位置的改动，都会让它之后的所有内容失效。**

Prompt 的渲染顺序固定为：

```
tools → system → messages
```

所以设计 prompt 时要按“稳定程度”排序：**最稳定的放最前面，最易变的放最后面**。

| 内容                    | 变化频率   | 应该放在哪里       |
| --------------------- | ------ | ------------ |
| 工具定义、核心 system prompt | 几乎不变   | 最前面，缓存断点之前   |
| 每个会话的背景资料             | 每个会话变化 | 全局前缀之后       |
| 对话历史                  | 每轮变化   | 后面           |
| 时间戳、请求 ID、当前问题        | 每次请求变化 | 最后一个断点之后，或删除 |

> [!tip] 记忆方法
> 小本子只能从第一页开始对照：只要前面有一个字不一样，后面记的全部作废。

**Key takeaway:** Prompt caching is a prefix match — order content from most stable to most volatile.

## 3. 怎么用：`cache_control`

在某个内容块上加 `cache_control`，就标记了一个**缓存断点（breakpoint）**：从开头到这个块为止的内容会被缓存。

```json
{
  "model": "claude-opus-5-5",
  "max_tokens": 1024,
  "system": [
    {
      "type": "text",
      "text": "<很长的、固定不变的 system prompt>",
      "cache_control": { "type": "ephemeral" }
    }
  ],
  "messages": [
    { "role": "user", "content": "今天的问题……" }
  ]
}
```

| 参数 | 含义 |
| --- | --- |
| `{"type": "ephemeral"}` | 默认 **5 分钟** TTL |
| `{"type": "ephemeral", "ttl": "1h"}` | **1 小时** TTL |

- 每个请求最多 **4 个**断点。
- 可以放在 system 文本块、工具定义、消息内容块（text、image、tool_use、tool_result、document）上。
- **自动缓存**：在请求顶层加 `cache_control`，系统会自动把断点放在最后一个可缓存块上，并随对话增长自动前移。多轮对话用它最省事。

### Java SDK 写法

`.system(String)` 无法携带 cache control，要用 `.systemOfTextBlockParams(...)`：

```java
import com.anthropic.models.messages.TextBlockParam;
import com.anthropic.models.messages.CacheControlEphemeral;

.systemOfTextBlockParams(List.of(
    TextBlockParam.builder()
        .text(longSystemPrompt)
        .cacheControl(CacheControlEphemeral.builder()
            .ttl(CacheControlEphemeral.Ttl.TTL_1H)  // 可选；默认 5 分钟
            .build())
        .build()))
```

验证命中：`response.usage().cacheReadInputTokens()`。

## 4. 价格与回本点 Economics

| 操作 | 相对普通输入价格 |
| --- | --- |
| 缓存写入（5 分钟 TTL） | 1.25× |
| 缓存写入（1 小时 TTL） | 2× |
| 缓存读取 | 约 0.1×（Opus 5.5：0.05×，即 \$0.20/MTok） |

**回本点（break-even）：**

- **5 分钟 TTL**：用 **2 次**就回本 → 1.25× + 0.1× = 1.35×，而不缓存是 2×。
- **1 小时 TTL**：至少 **3 次**才回本 → 2× + 0.2× = 2.2×，而不缓存是 3×。

> [!warning] 最小可缓存长度
> 前缀太短时**静默不缓存**（不报错，只是 `cache_creation_input_tokens = 0`）。最小长度因模型而异：
> - Opus 5.5、Sonnet 5.5 等最新模型：**512 tokens**
> - Haiku 4.5：**4096 tokens**

### 数值例子：接 Lesson 1 的客服机器人

[[LLM 基础 - Lesson 1]] 中的例子：Sonnet 5.5，每天 100,000 次请求，每次 2,000 输入 + 300 输出 Token，原本 **\$700/天**。

假设其中 **1,500 Token 是所有请求共享的 system prompt**，剩下 500 Token 是用户问题。Sonnet 5.5 缓存读取价格为 \$0.20/MTok。

| 项目 | 计算 | 每天成本 |
| --- | --- | --- |
| 缓存读取（共享前缀） | 100,000 × 1,500 = 150M × \$0.20 | \$30 |
| 普通输入（用户问题） | 100,000 × 500 = 50M × \$2 | \$100 |
| 输出 | 30M × \$10 | \$300 |
| **合计** | | **≈ \$430**（原来 \$700） |

输入成本从 \$400 降到约 \$130，总成本降低约 **39%**。缓存写入只在缓存过期时发生，流量持续时可以忽略。

> [!note]
> 缓存**不影响输出成本**。这个例子里剩下的大头是输出（\$300），要靠缩短回复来降。

**Key takeaway:** A 5-minute cache pays for itself from the second request; cache reads cost about a tenth of normal input.

## 5. 如何选择 TTL

缓存每被读取一次，计时器就**免费刷新**。所以关键看“共享同一前缀的两次请求之间的间隔”：

| 请求间隔 | 选择 |
| --- | --- |
| 小于 5 分钟（流量持续） | **5 分钟 TTL**：每次请求都会刷新，更便宜 |
| 5–60 分钟（例如用户隔 20 分钟才回复） | **1 小时 TTL**：唯一值得付 2× 写入价的场景 |
| 超过 1 小时 | 都不直接有用：定时预热，或接受冷启动 |

## 6. 常见放置模式

### 6.1 大型共享 system prompt

断点放在最后一个 system 块上。由于 tools 在 system 之前渲染，这一个断点会把 **tools + system** 一起缓存。

### 6.2 多轮对话

断点放在最新一轮消息的最后一个内容块上（或直接用顶层自动缓存）。每次请求复用之前的整段对话前缀，命中量随对话增长。

### 6.3 共享前缀 + 变化的问题

很多请求共享一大段固定内容（few-shot 示例、检索文档、说明），只有最后的问题不同。**断点要放在共享部分的末尾**，不要放在整个 prompt 的末尾，否则每次请求都会写一个新缓存，却从来读不到。

```json
"messages": [{ "role": "user", "content": [
  { "type": "text", "text": "<共享上下文>", "cache_control": { "type": "ephemeral" } },
  { "type": "text", "text": "<每次不同的问题>" }
]}]
```

### 6.4 每次开头都不同的 prompt

**不要缓存。** 没有可复用的前缀，加 `cache_control` 只会白付写入溢价。

## 7. 静默失效：最常见的坑

缓存失效**不会报错**，请求照常成功，只是账单变高。以下写法都会破坏前缀：

| 写法 | 为什么会失效 |
| --- | --- |
| 在 system prompt 里放当前时间（`LocalDateTime.now()`） | 每次请求前缀都变 |
| 在内容开头放 UUID / 请求 ID | 每次请求都不一样 |
| JSON 序列化顺序不确定（如遍历 `HashMap` / `HashSet`） | 字节顺序不同 |
| 把用户名、会话 ID 拼进 system prompt | 每个用户一个前缀，无法跨用户共享 |
| 根据开关条件拼接 system 内容 | 每种开关组合都是不同前缀 |
| 按用户动态生成不同的工具列表 | tools 在最前面，什么都缓存不了 |
| 对话中途切换模型 | 缓存按模型隔离 |

**修复：** 把动态内容移到最后一个断点之后，让序列化保持确定（例如工具按名字排序），或者删掉不必要的动态内容。

> [!tip] Java 提示
> 拼 JSON 时用 `LinkedHashMap` / `TreeMap` 或 Jackson 的 `ORDER_MAP_ENTRIES_BY_KEYS`，保证字段顺序固定。

**Key takeaway:** Cache misses fail silently — anything dynamic in the prefix breaks caching without an error.

## 8. 如何验证缓存命中

响应中的 `usage` 字段：

| 字段 | 含义 |
| --- | --- |
| `cache_creation_input_tokens` | 本次写入缓存的 Token（付 1.25× 写入价） |
| `cache_read_input_tokens` | 本次从缓存读取的 Token（付约 0.1×） |
| `input_tokens` | 未缓存、按全价处理的 Token |

> [!important] 注意
> `input_tokens` **只是未缓存的部分**。
> 总输入 = `input_tokens` + `cache_creation_input_tokens` + `cache_read_input_tokens`。

- **健康的多轮对话**：`cache_read_input_tokens` 每轮增长，`cache_creation_input_tokens` 只有新增的一小段。
- **重复相同前缀的请求，`cache_read_input_tokens` 却一直是 0** → 存在静默失效。对比两次请求的完整 JSON，找到第一个不同的字节。
- **持续监控**：缓存往往在后来改 prompt 拼装代码时悄悄失效。可以写一个集成测试，断言第二次相同请求的 `cache_read_input_tokens > 0`。

**Key takeaway:** `usage.cache_read_input_tokens` is the only proof that caching works.

## 9. 进阶细节

- **并发请求**：缓存在第一个响应**开始流式输出**后才能读取。同时发 N 个相同前缀的请求，全部按全价计费。做法：先发 1 个，等到第一个 Token，再发其余 N−1 个。
- **预热（Pre-warming）**：启动时发一个 `max_tokens: 0` 的请求，只做 prefill、写入缓存，不产生输出 Token，让第一个真实用户请求也能命中缓存。流量持续时不需要。
- **工作区隔离**：缓存按 workspace 隔离，不会跨组织共享。
- **20 块回看窗口**：每个断点最多往回找 20 个位置。单轮追加内容过多时，可能找不到上一次的缓存，需要加中间断点。

## 10. Interview Answer（英文面试答案）

### Short version

Prompt caching stores the processed prefix of a prompt so that later requests starting with the exact same bytes can reuse it. Cache reads cost about a tenth of the normal input price and skip prefill, so they cut both cost and time to first token. Because it's a prefix match, you order the prompt from most stable to most volatile: tools, then the system prompt, then the conversation, with timestamps and per-request data at the end. A five-minute cache write costs 1.25 times the input price, so it pays off from the second request. Finally, verify it with the `cache_read_input_tokens` field, because a broken cache fails silently.

### 中文理解

Prompt caching 缓存 prompt 前缀的处理结果，之后开头字节完全相同的请求可以直接复用。缓存读取约为普通输入价格的十分之一，并且跳过 prefill，所以同时降低成本和首 Token 延迟。因为是前缀匹配，要按稳定程度排列 prompt：工具 → system prompt → 对话，时间戳和每次请求的数据放最后。5 分钟缓存的写入价是 1.25 倍，第二次请求就回本。最后要用 `cache_read_input_tokens` 验证，因为缓存失效是静默的。

### Keywords

- Prefix match（前缀匹配）
- Cache breakpoint / `cache_control`（缓存断点）
- TTL: 5 minutes / 1 hour（缓存有效期）
- Cache write vs cache read pricing（写入价 vs 读取价）
- Prefill / TTFT（预填充 / 首 Token 时间）
- Silent invalidation（静默失效）

## 11. Quick Revision（快速复习）

- **是什么**：缓存 prompt 前缀的处理结果，不是缓存回答。
- **规则**：逐字节前缀匹配；顺序为 tools → system → messages。
- **怎么用**：`cache_control: {"type": "ephemeral"}`，最多 4 个断点；多轮对话可用顶层自动缓存。
- **价格**：写入 1.25×（5 分钟）/ 2×（1 小时），读取约 0.1×；5 分钟 TTL 用 2 次就回本。
- **最小长度**：最新模型 512 tokens，Haiku 4.5 为 4096 tokens；不够长时静默不缓存。
- **坑**：system prompt 里的时间戳、随机 ID、不确定的序列化、切换模型或工具。
- **验证**：看 `cache_read_input_tokens`；总输入 = 三个字段之和。
- **收益**：降成本 + 降 TTFT；不影响输出成本。

> [!quote] 一句话总结
> Put stable content first, mark the end of the shared prefix with `cache_control`, keep those bytes identical, and check `cache_read_input_tokens` to confirm you're actually hitting the cache.
>
> 稳定内容放前面，在共享前缀末尾打断点，保持这些字节不变，并用 `cache_read_input_tokens` 确认真的命中了缓存。

## Related Notes

- [[LLM 基础 - Lesson 1]]
- [[贪心算法 vs Top-p vs Temperature 讲解区别]]
- [[Prompt 设计与结构化输出 - Lesson 2]]: 稳定指令放 system，让缓存命中
