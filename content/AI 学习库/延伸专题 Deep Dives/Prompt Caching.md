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

每次 API 调用都是无状态的，客户端会重发完整的 prompt（system、tools、历史消息）。如果每次请求的**开头都一样**，模型每次都要重新处理（prefill）这一大段，既花钱又花时间。
Every API call is stateless, so the client resends the full prompt (system, tools, message history). If **the start of every request is the same**, the model still reprocesses (prefills) that whole block each time, which costs money and time.

**Prompt caching** 让 API 把已处理过的**前缀**缓存起来。下次请求开头的字节完全相同时，直接读取缓存：
**Prompt caching** lets the API cache the already-processed **prefix**. When the next request starts with exactly the same bytes, it reads from the cache:

- **更便宜 Cheaper:** 缓存读取约为普通输入价格的 **0.1× 或更低**（Opus 5.5 为 0.05×）。
  Cache reads cost about **0.1× or less** of the normal input price (0.05× on Opus 5.5).
- **更快 Faster:** 跳过前缀的 prefill，**TTFT 降低**。
  Prefill of the prefix is skipped, so **TTFT drops**.

> [!abstract] 一句话理解 In one sentence
> Prompt caching 缓存的是 **prompt 前缀的计算结果**，不是模型的回答。命中的前提是：前缀**逐字节完全一致**。
> Prompt caching stores **the computed result of the prompt prefix**, not the model's answer. A hit requires the prefix to be **identical byte for byte**.

> [!example] 类比 Analogy
> 像奶茶店的小本子：会员信息记一次，以后只说“老样子”。也像 HTTP 缓存，只是“缓存键”是前缀的字节，改一个字节就不命中。
> Like a bubble tea shop's notebook: your membership info is written down once, and after that you just say "the usual". Or like an HTTP cache, except the "cache key" is the bytes of the prefix, so changing one byte means a miss.

## 2. 唯一的核心规则：前缀匹配 The One Core Rule: Prefix Match

> [!important] 核心规则 Core rule
> Prompt caching 是**前缀匹配**：前缀中任何位置的改动，都会让它之后的**所有内容失效**。
> Prompt caching is a **prefix match**: a change anywhere in the prefix **invalidates everything after it**.

Prompt 的渲染顺序固定为 `tools → system → messages`，所以要按稳定程度排序：**最稳定的放最前面，最易变的放最后面**。
The prompt is always rendered as `tools → system → messages`, so order it by stability: **most stable first, most volatile last**.

| 内容 Content | 变化频率 Changes | 应该放在哪里 Where it goes |
| --- | --- | --- |
| 工具定义、核心 system prompt 提示词 Tool definitions, core system prompt | 几乎不变 Almost never | 最前面，缓存断点之前 First, before the cache breakpoint |
| 每个会话的背景资料 Per-session background | 每个会话变化 Per session | 全局前缀之后 After the global prefix |
| 对话历史 Conversation history | 每轮变化 Every turn | 后面 Later |
| 时间戳、请求 ID、当前问题 Timestamps, request IDs, the current question | 每次请求变化 Every request | 最后一个断点之后，或删除 After the last breakpoint, or removed |

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

- 每个请求最多 **4 个**断点，可以放在 system 文本块、工具定义和消息内容块上。
  At most **4** breakpoints per request; they can go on system text blocks, tool definitions and message content blocks.
- **自动缓存 Automatic caching:** 在请求顶层加 `cache_control`，断点会自动放在最后一个可缓存块上，并随对话增长前移。多轮对话用它最省事。
  Put `cache_control` at the top level of the request and the breakpoint goes on the last cacheable block automatically, moving forward as the conversation grows. It's the easiest option for multi-turn chats.

**Java SDK:** `.system(String)` 无法携带 cache control，要用 `.systemOfTextBlockParams(...)`；验证命中看 `response.usage().cacheReadInputTokens()`。
`.system(String)` can't carry cache control, so use `.systemOfTextBlockParams(...)`; check for a hit with `response.usage().cacheReadInputTokens()`.

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

## 4. 价格与回本点 Economics

| 操作 Operation | 相对普通输入价格 vs normal input price |
| --- | --- |
| 缓存写入（5 分钟） Cache write (5-minute TTL) | 1.25× |
| 缓存写入（1 小时） Cache write (1-hour TTL) | 2× |
| 缓存读取 Cache read | 约 0.1×（Opus 5.5：0.05×，即 \$0.20/MTok；Fable 5.1：0.025×） About 0.1× (Opus 5.5: 0.05×, i.e. \$0.20/MTok; Fable 5.1: 0.025×) |

- **五分钟缓存 5-minute TTL:** 用 **2 次**就回本 → 1.25× + 0.1× = 1.35×，而不缓存是 2×。
  Pays off after **2 uses** → 1.25× + 0.1× = 1.35×, vs 2× without caching.
- **一小时缓存 1-hour TTL:** 至少 **3 次**才回本 → 2× + 0.2× = 2.2×，而不缓存是 3×。
  Needs at least **3 uses** → 2× + 0.2× = 2.2×, vs 3× without caching.

> [!warning] 最小可缓存长度 Minimum cacheable length
> 前缀太短时**静默不缓存**（不报错，只是 `cache_creation_input_tokens = 0`）。Opus 5.5、Sonnet 5.5 等最新模型最少 **512 tokens**，Haiku 4.5 要 **4096 tokens**。
> A prefix that's too short is **silently not cached** (no error, just `cache_creation_input_tokens = 0`). The latest models such as Opus 5.5 and Sonnet 5.5 need at least **512 tokens**; Haiku 4.5 needs **4096 tokens**.

**数值例子 Worked example:** 接 [[LLM 基础 - Lesson 1|第 1 课 Lesson 1]] 的客服机器人：Sonnet 5.5，每天 100,000 次请求，每次 2,000 输入 + 300 输出 Token，原本 **\$700/天**。假设其中 1,500 Token 是所有请求共享的 system prompt，Sonnet 5.5 缓存读取价格为 \$0.20/MTok。
The support bot from [[LLM 基础 - Lesson 1|第 1 课 Lesson 1]]: Sonnet 5.5, 100,000 requests a day, each with 2,000 input + 300 output tokens, originally **\$700/day**. Assume 1,500 of those tokens are a system prompt shared by every request, and Sonnet 5.5 cache reads cost \$0.20/MTok.

| 项目 Item | 计算 Calculation | 每天成本 Cost per day |
| --- | --- | --- |
| 缓存读取（共享前缀） Cache read (shared prefix) | 100,000 × 1,500 = 150M × \$0.20 | \$30 |
| 普通输入（用户问题） Normal input (user question) | 100,000 × 500 = 50M × \$2 | \$100 |
| 输出 Output | 30M × \$10 | \$300 |
| **合计 Total** | | **≈ \$430** <span lang="zh">（原来 \$700）</span><span lang="en">(was \$700)</span> |

输入成本从 \$400 降到约 \$130，总成本降低约 **39%**（流量持续时缓存很少过期，写入成本可以忽略）。缓存**不影响输出成本**，剩下的大头（\$300）只能靠缩短回复来降。
Input cost falls from \$400 to about \$130, cutting the total by about **39%** (with steady traffic the cache rarely expires, so write costs are negligible). Caching **doesn't touch output cost**, so the biggest remaining item (\$300) only drops with shorter replies.

## 5. 如何选择 TTL Choosing a TTL

缓存每被读取一次，计时器就**免费刷新**（计时从请求开始算，生成时间也计入）。所以关键看“共享同一前缀的两次请求之间的间隔”：
Each cache read **refreshes the timer for free** (the timer runs from the start of the request, so generation time counts). So what matters is the gap between two requests sharing the same prefix:

| 请求间隔 Gap between requests | 选择 Choice |
| --- | --- |
| 小于 5 分钟（流量持续） Under 5 minutes (steady traffic) | **5 分钟**：每次请求都会刷新，更便宜 **5-minute TTL**: each request refreshes it, and it's cheaper |
| 5–60 分钟（例如用户隔 20 分钟才回复） 5–60 minutes (e.g. a user replies after 20 minutes) | **1 小时**：唯一值得付 2× 写入价的场景 **1-hour TTL**: the one case worth the 2× write price |
| 超过 1 小时 Over an hour | 都不直接有用：定时预热，或接受冷启动 Neither helps directly: pre-warm on a schedule or accept a cold start |

## 6. 常见放置模式 Common Placement Patterns

| 场景 Scenario | 断点放哪里 Where the breakpoint goes |
| --- | --- |
| 大段共享 system prompt Large shared system prompt | 最后一个 system 块上；tools 在 system 之前渲染，所以一个断点就把 **tools + system** 一起缓存 On the last system block; tools render before system, so one breakpoint caches **tools + system** together |
| 多轮对话 Multi-turn conversation | 最新一轮的最后一个内容块上（或直接用顶层自动缓存）；命中量随对话增长 On the last block of the latest turn (or just use top-level automatic caching); hits grow with the conversation |
| 共享前缀 + 变化的问题 Shared prefix + changing question | **共享部分的末尾**，不要放在整个 prompt 的末尾，否则每次都写一个新缓存却从来读不到 **At the end of the shared part**, not the end of the whole prompt, or every request writes a new entry that's never read |
| 每次开头都不同 A different start every time | **不要缓存**：没有可复用的前缀，只会白付写入溢价 **Don't cache**: with no reusable prefix you only pay the write premium |

```json
"messages": [{ "role": "user", "content": [
  { "type": "text", "text": "<共享上下文>", "cache_control": { "type": "ephemeral" } },
  { "type": "text", "text": "<每次不同的问题>" }
]}]
```

## 7. 静默失效：最常见的坑 Silent Invalidation: the Most Common Trap

缓存失效**不会报错**，请求照常成功，只是账单变高。以下写法都会破坏前缀：
A cache miss **raises no error**: the request succeeds as usual, only the bill goes up. All of these break the prefix:

| 写法 Pattern | 为什么会失效 Why it breaks |
| --- | --- |
| 在 system prompt 里放当前时间 Current time in the system prompt (`LocalDateTime.now()`) | 每次请求前缀都变 The prefix changes on every request |
| 在内容开头放 UUID / 请求 ID 标识 A UUID / request ID at the start | 每次请求都不一样 Different on every request |
| 序列化顺序不确定 Non-deterministic JSON order (e.g. iterating a `HashMap`) | 字节顺序不同 The bytes come out in a different order |
| 把用户名、会话 ID 拼进 system prompt 提示词 User names or session IDs in the system prompt | 每个用户一个前缀，无法跨用户共享 One prefix per user, nothing shared across users |
| 根据开关条件拼接 system 内容 System content assembled from feature flags | 每种开关组合都是不同前缀 Each flag combination is a different prefix |
| 按用户动态生成不同的工具列表 A per-user tool list | tools 在最前面，什么都缓存不了 Tools come first, so nothing can be cached |
| 对话中途切换模型 Switching models mid-conversation | 缓存按模型隔离 Caches are per model |

**修复 Fix:** 把动态内容移到最后一个断点之后，让序列化保持确定（Java 里用 `LinkedHashMap` / `TreeMap` 或 Jackson 的 `ORDER_MAP_ENTRIES_BY_KEYS`，工具按名字排序），或者删掉不必要的动态内容。
Move dynamic content after the last breakpoint, keep serialization deterministic (in Java use `LinkedHashMap` / `TreeMap` or Jackson's `ORDER_MAP_ENTRIES_BY_KEYS`, and sort tools by name), or drop dynamic content you don't need.

## 8. 如何验证缓存命中 Verifying Cache Hits

| `usage` 字段 Field | 含义 Meaning |
| --- | --- |
| `cache_creation_input_tokens` | 本次写入缓存的 Token（付 1.25× 或 2× 写入价） Tokens written to the cache this time (at the 1.25× or 2× write price) |
| `cache_read_input_tokens` | 本次从缓存读取的 Token（付约 0.1×） Tokens read from the cache this time (at about 0.1×) |
| `input_tokens` | 未缓存、按全价处理的 Token Uncached tokens at full price |

> [!important] 注意 Watch out
> `input_tokens` 只是**未缓存的部分**。总输入 = `input_tokens` + `cache_creation_input_tokens` + `cache_read_input_tokens`。
> `input_tokens` is **only the uncached part**. Total input = `input_tokens` + `cache_creation_input_tokens` + `cache_read_input_tokens`.

- **健康的多轮对话 A healthy multi-turn chat:** `cache_read_input_tokens` 每轮增长，`cache_creation_input_tokens` 只有新增的一小段。
  `cache_read_input_tokens` grows every turn, and `cache_creation_input_tokens` covers only the small new part.
- **重复前缀却读不到 Same prefix, no reads:** `cache_read_input_tokens` 一直是 0 → 存在静默失效。对比两次请求的完整 JSON，找到第一个不同的字节。
  `cache_read_input_tokens` stays 0 → something is silently invalidating it. Diff the full JSON of two requests and find the first differing byte.
- **持续监控 Keep monitoring:** 缓存往往在后来改 prompt 拼装代码时悄悄失效。写一个集成测试，断言第二次相同请求的 `cache_read_input_tokens > 0`。
  Caching often breaks quietly when someone later changes the prompt-building code. Write an integration test asserting `cache_read_input_tokens > 0` on a second identical request.

## 9. 进阶细节 Advanced Details

- **并发请求 Concurrent requests:** 缓存在第一个响应**开始流式输出**后才能读取。同时发 N 个相同前缀的请求，全部按全价计费。做法：先发 1 个，等到第一个 Token，再发其余 N−1 个。
  The cache becomes readable only once the first response **starts streaming**. Send N requests with the same prefix at once and they're all billed at full price. Instead: send 1, wait for its first token, then send the other N−1.
- **预热 Pre-warming:** 启动时发一个 `max_tokens: 0` 的请求，只做 prefill、写入缓存，不产生输出 Token。流量持续时不需要。
  At startup, send a request with `max_tokens: 0` that only prefills and writes the cache without producing output tokens. Not needed with steady traffic.
- **工作区隔离 Workspace isolation:** 在 Claude API 上缓存按 workspace 隔离（Bedrock、Google Cloud 上按组织），从不跨组织共享。同一个 prompt 分散在多个 workspace，会各写各的缓存。
  On the Claude API caches are isolated per workspace (per organization on Bedrock and Google Cloud) and never shared across organizations. The same prompt split across workspaces writes separate entries.
- **回看窗口 20 块 Lookback window of 20 blocks:** 每个断点最多往回找 20 个位置（连续的 `tool_use` 或 `tool_result` 块各算一个位置）。单轮追加内容过多时可能找不到上一次的缓存，需要加中间断点。
  Each breakpoint looks back at most 20 positions (a run of consecutive `tool_use` or `tool_result` blocks counts as one). If one turn adds too much content, the previous cache entry may be out of reach, so add an intermediate breakpoint.

## 10. 面试答案 Interview Answer

Prompt caching 缓存 prompt 前缀的处理结果，之后开头字节完全相同的请求可以直接复用。缓存读取约为普通输入价格的十分之一，并且跳过 prefill，所以同时降低成本和首 Token 延迟。因为是前缀匹配，要按稳定程度排列 prompt：工具 → system prompt → 对话，时间戳和每次请求的数据放最后。5 分钟缓存的写入价是 1.25 倍，第二次请求就回本。最后要用 `cache_read_input_tokens` 验证，因为缓存失效是静默的。

Prompt caching stores the processed prefix of a prompt so that later requests starting with the exact same bytes can reuse it. Cache reads cost about a tenth of the normal input price and skip prefill, so they cut both cost and time to first token. Because it's a prefix match, you order the prompt from most stable to most volatile: tools, then the system prompt, then the conversation, with timestamps and per-request data at the end. A five-minute cache write costs 1.25 times the input price, so it pays off from the second request. Finally, verify it with the `cache_read_input_tokens` field, because a broken cache fails silently.

> [!quote] 一句话总结 One-sentence summary
> 稳定内容放前面，在共享前缀末尾打断点，保持这些字节不变，并用 `cache_read_input_tokens` 确认真的命中了缓存。
>
> Put stable content first, mark the end of the shared prefix with `cache_control`, keep those bytes identical, and check `cache_read_input_tokens` to confirm you're actually hitting the cache.

## 11. 🔗 相关笔记 Related Notes

- [[LLM 基础 - Lesson 1|第 1 课：LLM 基础 Lesson 1: LLM Basics]]
- [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]]
- [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]: 稳定指令放 system，让缓存命中
  Stable instructions in `system` keep the cache hitting
