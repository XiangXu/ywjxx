---
title: "提示缓存 Prompt Caching"
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

### 1.1 通俗解释 In plain words

想象你每天去同一家奶茶店，每次都要先把一长串会员信息、口味偏好念一遍，最后才说“今天要一杯奶茶”。
Imagine going to the same bubble tea shop every day and reciting your whole membership info and taste preferences each time before finally saying "one milk tea today".

如果店员把你前面那一长串**记在小本子上**，下次你只要说“老样子，今天要一杯奶茶”，点单就快多了、也省事多了。
If the staff **write that long preamble in a notebook**, next time you just say "the usual, one milk tea today", and ordering is much faster and easier.

Prompt caching 就是这个小本子：**前面不变的那一大段只处理一次，之后直接复用。**
Prompt caching is that notebook: **the big unchanging part at the start is processed once and reused after that.**

### 1.2 技术解释 Technically

每次 API 调用都是无状态的，客户端会重发完整的 prompt（system、tools、历史消息）。如果每次请求的**开头部分都一样**，模型每次都要重新处理（prefill）这一大段，既花钱又花时间。
Every API call is stateless, so the client resends the full prompt (system, tools, message history). If **the start of every request is the same**, the model still reprocesses (prefills) that whole block each time, which costs money and time.

**Prompt caching** 让 API 把已处理过的**前缀**缓存起来。下次请求的开头字节完全相同时，直接读取缓存：
**Prompt caching** lets the API cache the already-processed **prefix**. When the next request starts with exactly the same bytes, it reads from the cache:

- **更便宜 Cheaper:** 缓存读取约为普通输入价格的 **0.1×**（Opus 5.5 为 0.05×）。
  Cache reads cost about **0.1×** the normal input price (0.05× on Opus 5.5).
- **更快 Faster:** 跳过前缀的 prefill，**TTFT 降低**。
  Prefill of the prefix is skipped, so **TTFT drops**.

> [!abstract] 一句话理解 In one sentence
> Prompt caching 缓存的是 **prompt 前缀的计算结果**，不是模型的回答。命中的前提是：前缀**逐字节完全一致**。
> Prompt caching stores **the computed result of the prompt prefix**, not the model's answer. A hit requires the prefix to be **identical byte for byte**.

> [!example] 类比 Analogy
> 像 HTTP 缓存 / CDN：同一个资源只在第一次请求时回源，之后直接命中缓存。区别是这里的“缓存键”是 prompt 前缀的字节，改一个字节就不命中。
> Like an HTTP cache / CDN: a resource goes back to the origin only on the first request, then it's served from cache. The difference is that the "cache key" here is the bytes of the prompt prefix, so changing one byte means a miss.

## 2. 唯一的核心规则：前缀匹配 The One Core Rule: Prefix Match

> [!important] 核心规则 Core rule
> Prompt caching 是**前缀匹配**：前缀中任何位置的改动，都会让它之后的**所有内容失效**。
> Prompt caching is a **prefix match**: a change anywhere in the prefix **invalidates everything after it**.

Prompt 的渲染顺序固定为：
The prompt is always rendered in this order:

```
tools → system → messages
```

所以设计 prompt 时要按“稳定程度”排序：**最稳定的放最前面，最易变的放最后面**。
So order the prompt by stability: **most stable first, most volatile last**.

| 内容 Content | 变化频率 Changes | 应该放在哪里 Where it goes |
| --- | --- | --- |
| 工具定义、核心 system prompt 提示词 Tool definitions, core system prompt | 几乎不变 Almost never | 最前面，缓存断点之前 First, before the cache breakpoint |
| 每个会话的背景资料 Per-session background | 每个会话变化 Per session | 全局前缀之后 After the global prefix |
| 对话历史 Conversation history | 每轮变化 Every turn | 后面 Later |
| 时间戳、请求 ID、当前问题 Timestamps, request IDs, the current question | 每次请求变化 Every request | 最后一个断点之后，或删除 After the last breakpoint, or removed |

> [!tip] 记忆方法 How to remember it
> 小本子只能从第一页开始对照：只要前面有一个字不一样，后面记的全部作废。
> The notebook can only be checked from page one: if a single word early on differs, everything written after it is void.

**要点 Key takeaway:** Prompt caching 是前缀匹配，内容要按从最稳定到最易变排序。
Prompt caching is a prefix match: order content from most stable to most volatile.

## 3. 怎么用 `cache_control` How to use `cache_control`

在某个内容块上加 `cache_control`，就标记了一个**缓存断点**：从开头到这个块为止的内容会被缓存。
Adding `cache_control` to a content block marks a **cache breakpoint**: everything from the start up to that block gets cached.

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

| 参数 Parameter | 含义 Meaning |
| --- | --- |
| `{"type": "ephemeral"}` | 默认 **5 分钟**有效期 Default **5-minute** TTL |
| `{"type": "ephemeral", "ttl": "1h"}` | **一小时**有效期 **1-hour** TTL |

- 每个请求最多 **4 个**断点。
  At most **4** breakpoints per request.
- 可以放在 system 文本块、工具定义、消息内容块（text、image、tool_use、tool_result、document）上。
  They can go on system text blocks, tool definitions and message content blocks (text, image, tool_use, tool_result, document).
- **自动缓存 Automatic caching:** 在请求顶层加 `cache_control`，系统会自动把断点放在最后一个可缓存块上，并随对话增长自动前移。多轮对话用它最省事。
  Put `cache_control` at the top level of the request and the breakpoint goes on the last cacheable block automatically, moving forward as the conversation grows. It's the easiest option for multi-turn chats.

### Java SDK 写法 Java SDK

`.system(String)` 无法携带 cache control，要用 `.systemOfTextBlockParams(...)`：
`.system(String)` can't carry cache control, so use `.systemOfTextBlockParams(...)`:

```java
import com.anthropic.models.messages.TextBlockParam;
import com.anthropic.models.messages.CacheControlEphemeral;

.systemOfTextBlockParams(List.of(
    TextBlockParam.builder()
        .text(longSystemPrompt)
        .cacheControl(CacheControlEphemeral.builder()
            .ttl(CacheControlEphemeral.Ttl.TTL_1H)  // 可选；默认 5 分钟 optional; default 5 minutes
            .build())
        .build()))
```

验证命中：看 `response.usage().cacheReadInputTokens()` 的值。
Check for a hit with `response.usage().cacheReadInputTokens()`.

## 4. 价格与回本点 Economics

| 操作 Operation | 相对普通输入价格 vs normal input price |
| --- | --- |
| 缓存写入（5 分钟） Cache write (5-minute TTL) | 1.25× |
| 缓存写入（1 小时） Cache write (1-hour TTL) | 2× |
| 缓存读取 Cache read | 约 0.1×（Opus 5.5：0.05×，即 \$0.20/MTok） About 0.1× (Opus 5.5: 0.05×, i.e. \$0.20/MTok) |

**回本点 Break-even:**

- **五分钟缓存 5-minute TTL:** 用 **2 次**就回本 → 1.25× + 0.1× = 1.35×，而不缓存是 2×。
  Pays off after **2 uses** → 1.25× + 0.1× = 1.35×, vs 2× without caching.
- **一小时缓存 1-hour TTL:** 至少 **3 次**才回本 → 2× + 0.2× = 2.2×，而不缓存是 3×。
  Needs at least **3 uses** → 2× + 0.2× = 2.2×, vs 3× without caching.

> [!warning] 最小可缓存长度 Minimum cacheable length
> 前缀太短时**静默不缓存**（不报错，只是 `cache_creation_input_tokens = 0`）。最小长度因模型而异：
> A prefix that's too short is **silently not cached** (no error, just `cache_creation_input_tokens = 0`). The minimum depends on the model:
> - Opus 5.5、Sonnet 5.5 等最新模型：**512 tokens**
>   Latest models such as Opus 5.5 and Sonnet 5.5: **512 tokens**
> - Haiku 4.5：**4096 tokens**

### 数值例子：接第 1 课的客服机器人 Worked example: the support bot from Lesson 1

[[LLM 基础 - Lesson 1|第 1 课 Lesson 1]] 中的例子：Sonnet 5.5，每天 100,000 次请求，每次 2,000 输入 + 300 输出 Token，原本 **\$700/天**。
The example from [[LLM 基础 - Lesson 1|第 1 课 Lesson 1]]: Sonnet 5.5, 100,000 requests a day, each with 2,000 input + 300 output tokens, originally **\$700/day**.

假设其中 **1,500 Token 是所有请求共享的 system prompt**，剩下 500 Token 是用户问题。Sonnet 5.5 缓存读取价格为 \$0.20/MTok。
Assume **1,500 tokens are a system prompt shared by every request** and the other 500 are the user's question. Sonnet 5.5 cache reads cost \$0.20/MTok.

| 项目 Item | 计算 Calculation | 每天成本 Cost per day |
| --- | --- | --- |
| 缓存读取（共享前缀） Cache read (shared prefix) | 100,000 × 1,500 = 150M × \$0.20 | \$30 |
| 普通输入（用户问题） Normal input (user question) | 100,000 × 500 = 50M × \$2 | \$100 |
| 输出 Output | 30M × \$10 | \$300 |
| **合计 Total** | | **≈ \$430** <span lang="zh">（原来 \$700）</span><span lang="en">(was \$700)</span> |

输入成本从 \$400 降到约 \$130，总成本降低约 **39%**。缓存写入只在缓存过期时发生，流量持续时可以忽略。
Input cost falls from \$400 to about \$130, cutting the total by about **39%**. Cache writes only happen when the cache expires, so with steady traffic they're negligible.

> [!note] 注意 Note
> 缓存**不影响输出成本**。这个例子里剩下的大头是输出（\$300），要靠缩短回复来降。
> Caching **doesn't touch output cost**. The biggest remaining item here is output (\$300), which only shorter replies reduce.

**要点 Key takeaway:** 5 分钟缓存从第二次请求起就回本；缓存读取约为普通输入价格的十分之一。
A 5-minute cache pays for itself from the second request; cache reads cost about a tenth of normal input.

## 5. 如何选择 TTL Choosing a TTL

缓存每被读取一次，计时器就**免费刷新**。所以关键看“共享同一前缀的两次请求之间的间隔”：
Each cache read **refreshes the timer for free**. So what matters is the gap between two requests sharing the same prefix:

| 请求间隔 Gap between requests | 选择 Choice |
| --- | --- |
| 小于 5 分钟（流量持续） Under 5 minutes (steady traffic) | 选 **5 分钟**：每次请求都会刷新，更便宜 **5-minute TTL**: each request refreshes it, and it's cheaper |
| 5–60 分钟（例如用户隔 20 分钟才回复） 5–60 minutes (e.g. a user replies after 20 minutes) | 选 **1 小时**：唯一值得付 2× 写入价的场景 **1-hour TTL**: the one case worth the 2× write price |
| 超过 1 小时 Over an hour | 都不直接有用：定时预热，或接受冷启动 Neither helps directly: pre-warm on a schedule or accept a cold start |

## 6. 常见放置模式 Common Placement Patterns

### 6.1 大段共享系统提示 Large shared system prompt

断点放在最后一个 system 块上。由于 tools 在 system 之前渲染，这一个断点会把 **tools + system** 一起缓存。
Put the breakpoint on the last system block. Because tools render before system, this one breakpoint caches **tools + system** together.

### 6.2 多轮对话 Multi-turn conversation

断点放在最新一轮消息的最后一个内容块上（或直接用顶层自动缓存）。每次请求复用之前的整段对话前缀，命中量随对话增长。
Put the breakpoint on the last content block of the latest turn (or just use top-level automatic caching). Each request reuses the whole earlier conversation as its prefix, so hits grow with the conversation.

### 6.3 共享前缀 + 变化的问题 Shared prefix + changing question

很多请求共享一大段固定内容（few-shot 示例、检索文档、说明），只有最后的问题不同。**断点要放在共享部分的末尾**，不要放在整个 prompt 的末尾，否则每次请求都会写一个新缓存，却从来读不到。
Many requests share a big fixed block (few-shot examples, retrieved documents, instructions) and differ only in the final question. **Put the breakpoint at the end of the shared part**, not at the end of the whole prompt, or every request writes a new cache entry that's never read.

```json
"messages": [{ "role": "user", "content": [
  { "type": "text", "text": "<共享上下文>", "cache_control": { "type": "ephemeral" } },
  { "type": "text", "text": "<每次不同的问题>" }
]}]
```

### 6.4 每次开头都不同 A different start every time

**不要缓存。** 没有可复用的前缀，加 `cache_control` 只会白付写入溢价。
**Don't cache.** With no reusable prefix, `cache_control` only adds the write premium for nothing.

## 7. 静默失效：最常见的坑 Silent Invalidation: the Most Common Trap

缓存失效**不会报错**，请求照常成功，只是账单变高。以下写法都会破坏前缀：
A cache miss **raises no error**: the request succeeds as usual, only the bill goes up. All of these break the prefix:

| 写法 Pattern | 为什么会失效 Why it breaks |
| --- | --- |
| 在 system prompt 里放当前时间 Current time in the system prompt (`LocalDateTime.now()`) | 每次请求前缀都变 The prefix changes on every request |
| 在内容开头放 UUID / 请求 ID 标识 A UUID / request ID at the start | 每次请求都不一样 Different on every request |
| 序列化顺序不确定 Non-deterministic JSON order (e.g. iterating a `HashMap` / `HashSet`) | 字节顺序不同 The bytes come out in a different order |
| 把用户名、会话 ID 拼进 system prompt 提示词 User names or session IDs in the system prompt | 每个用户一个前缀，无法跨用户共享 One prefix per user, nothing shared across users |
| 根据开关条件拼接 system 内容 System content assembled from feature flags | 每种开关组合都是不同前缀 Each flag combination is a different prefix |
| 按用户动态生成不同的工具列表 A per-user tool list | tools 在最前面，什么都缓存不了 Tools come first, so nothing can be cached |
| 对话中途切换模型 Switching models mid-conversation | 缓存按模型隔离 Caches are per model |

**修复 Fix:** 把动态内容移到最后一个断点之后，让序列化保持确定（例如工具按名字排序），或者删掉不必要的动态内容。
Move dynamic content after the last breakpoint, keep serialization deterministic (e.g. sort tools by name), or drop dynamic content you don't need.

> [!tip] Java 提示 Java tip
> 拼 JSON 时用 `LinkedHashMap` / `TreeMap` 或 Jackson 的 `ORDER_MAP_ENTRIES_BY_KEYS`，保证字段顺序固定。
> When building JSON, use `LinkedHashMap` / `TreeMap` or Jackson's `ORDER_MAP_ENTRIES_BY_KEYS` to keep the field order fixed.

**要点 Key takeaway:** 缓存失效是静默的，前缀里任何动态内容都会让缓存失效且不报错。
Cache misses fail silently: anything dynamic in the prefix breaks caching without an error.

## 8. 如何验证缓存命中 Verifying Cache Hits

响应中的 `usage` 字段：
The `usage` field in the response:

| 字段 Field | 含义 Meaning |
| --- | --- |
| `cache_creation_input_tokens` | 本次写入缓存的 Token（付 1.25× 写入价） Tokens written to the cache this time (at the 1.25× write price) |
| `cache_read_input_tokens` | 本次从缓存读取的 Token（付约 0.1×） Tokens read from the cache this time (at about 0.1×) |
| `input_tokens` | 未缓存、按全价处理的 Token Uncached tokens at full price |

> [!important] 注意 Watch out
> 字段 `input_tokens` 只是**未缓存的部分**。
> The `input_tokens` field is **only the uncached part**.
> 总输入 = `input_tokens` + `cache_creation_input_tokens` + `cache_read_input_tokens`。
> Total input = `input_tokens` + `cache_creation_input_tokens` + `cache_read_input_tokens`.

- **健康的多轮对话 A healthy multi-turn chat:** `cache_read_input_tokens` 每轮增长，`cache_creation_input_tokens` 只有新增的一小段。
  `cache_read_input_tokens` grows every turn, and `cache_creation_input_tokens` covers only the small new part.
- **重复前缀却读不到缓存 Same prefix, no cache reads:** 重复相同前缀的请求，`cache_read_input_tokens` 却一直是 0 → 存在静默失效。对比两次请求的完整 JSON，找到第一个不同的字节。
  If requests repeat the same prefix but `cache_read_input_tokens` stays 0 → something is silently invalidating it. Diff the full JSON of two requests and find the first differing byte.
- **持续监控 Keep monitoring:** 缓存往往在后来改 prompt 拼装代码时悄悄失效。可以写一个集成测试，断言第二次相同请求的 `cache_read_input_tokens > 0`。
  Caching often breaks quietly when someone later changes the prompt-building code. Write an integration test asserting `cache_read_input_tokens > 0` on a second identical request.

**要点 Key takeaway:** `usage.cache_read_input_tokens` 是缓存生效的唯一证据。
`usage.cache_read_input_tokens` is the only proof that caching works.

## 9. 进阶细节 Advanced Details

- **并发请求 Concurrent requests:** 缓存在第一个响应**开始流式输出**后才能读取。同时发 N 个相同前缀的请求，全部按全价计费。做法：先发 1 个，等到第一个 Token，再发其余 N−1 个。
  The cache becomes readable only once the first response **starts streaming**. Send N requests with the same prefix at once and they're all billed at full price. Instead: send 1, wait for its first token, then send the other N−1.
- **预热 Pre-warming:** 启动时发一个 `max_tokens: 0` 的请求，只做 prefill、写入缓存，不产生输出 Token，让第一个真实用户请求也能命中缓存。流量持续时不需要。
  At startup, send a request with `max_tokens: 0` that only prefills and writes the cache without producing output tokens, so even the first real user request hits the cache. Not needed with steady traffic.
- **工作区隔离 Workspace isolation:** 缓存按 workspace 隔离，不会跨组织共享。
  Caches are isolated per workspace and never shared across organizations.
- **回看窗口 20 块 Lookback window of 20 blocks:** 每个断点最多往回找 20 个位置。单轮追加内容过多时，可能找不到上一次的缓存，需要加中间断点。
  Each breakpoint looks back at most 20 positions. If one turn adds too much content, the previous cache entry may be out of reach, so add an intermediate breakpoint.

## 10. 面试答案 Interview Answer

### 简短版 Short version

Prompt caching 缓存 prompt 前缀的处理结果，之后开头字节完全相同的请求可以直接复用。缓存读取约为普通输入价格的十分之一，并且跳过 prefill，所以同时降低成本和首 Token 延迟。因为是前缀匹配，要按稳定程度排列 prompt：工具 → system prompt → 对话，时间戳和每次请求的数据放最后。5 分钟缓存的写入价是 1.25 倍，第二次请求就回本。最后要用 `cache_read_input_tokens` 验证，因为缓存失效是静默的。

Prompt caching stores the processed prefix of a prompt so that later requests starting with the exact same bytes can reuse it. Cache reads cost about a tenth of the normal input price and skip prefill, so they cut both cost and time to first token. Because it's a prefix match, you order the prompt from most stable to most volatile: tools, then the system prompt, then the conversation, with timestamps and per-request data at the end. A five-minute cache write costs 1.25 times the input price, so it pays off from the second request. Finally, verify it with the `cache_read_input_tokens` field, because a broken cache fails silently.

### 关键词 Keywords

- 前缀匹配 Prefix match
- 缓存断点 Cache breakpoint / `cache_control`
- 缓存有效期 TTL: 5 minutes / 1 hour
- 写入价 vs 读取价 Cache write vs cache read pricing
- 预填充 / 首 Token 时间 Prefill / TTFT
- 静默失效 Silent invalidation

## 11. 快速复习 Quick Revision

- **是什么 What:** 缓存 prompt 前缀的处理结果，不是缓存回答。
  Caches the processed prompt prefix, not the answer.
- **规则 Rule:** 逐字节前缀匹配；顺序为 tools → system → messages。
  Byte-for-byte prefix match; the order is tools → system → messages.
- **怎么用 How:** `cache_control: {"type": "ephemeral"}`，最多 4 个断点；多轮对话可用顶层自动缓存。
  `cache_control: {"type": "ephemeral"}`, up to 4 breakpoints; multi-turn chats can use top-level automatic caching.
- **价格 Price:** 写入 1.25×（5 分钟）/ 2×（1 小时），读取约 0.1×；5 分钟 TTL 用 2 次就回本。
  Writes 1.25× (5 min) / 2× (1 hour), reads about 0.1×; a 5-minute TTL pays off after 2 uses.
- **最小长度 Minimum length:** 最新模型 512 tokens，Haiku 4.5 为 4096 tokens；不够长时静默不缓存。
  512 tokens on the latest models, 4096 on Haiku 4.5; shorter prefixes are silently not cached.
- **坑 Traps:** system prompt 里的时间戳、随机 ID、不确定的序列化、切换模型或工具。
  Timestamps or random IDs in the system prompt, non-deterministic serialization, switching models or tools.
- **验证 Verify:** 看 `cache_read_input_tokens`；总输入 = 三个字段之和。
  Check `cache_read_input_tokens`; total input = the sum of the three fields.
- **收益 Benefit:** 降成本 + 降 TTFT；不影响输出成本。
  Lower cost + lower TTFT; output cost is unaffected.

> [!quote] 一句话总结 One-sentence summary
> 稳定内容放前面，在共享前缀末尾打断点，保持这些字节不变，并用 `cache_read_input_tokens` 确认真的命中了缓存。
>
> Put stable content first, mark the end of the shared prefix with `cache_control`, keep those bytes identical, and check `cache_read_input_tokens` to confirm you're actually hitting the cache.

## 12. 🔗 相关笔记 Related Notes

- [[LLM 基础 - Lesson 1|第 1 课：LLM 基础 Lesson 1: LLM Basics]]
- [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]]
- [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]: 稳定指令放 system，让缓存命中
  Stable instructions in `system` keep the cache hitting
