---
title: "第 1 课：LLM 基础——Token、上下文、采样、成本、延迟 Lesson 1: LLM Basics — Tokens, Context, Sampling, Cost, Latency"
aliases:
  - LLM Basics
  - LLM 基础
tags:
  - AI
  - LLM
  - Interview-Prep
  - Claude-API
  - Java
created: 2026-10-15
---
# Lesson 1: LLM Basics（LLM 基础）

## 1. Tokens：模型处理文本的单位 The model's unit of text

LLM 不直接读字符。**Tokenizer** 先把文本切成 Token（子词片段），每个 Token 对应一个整数 id。
An LLM doesn't read characters directly. A **tokenizer** first cuts the text into tokens (sub-word pieces), and each token maps to an integer id.

| 文本类型 Text type | 经验值 Rule of thumb |
| --- | --- |
| 英文 English | 每个 token 约等于 4 个字符或 0.75 个单词 One token ≈ 4 characters ≈ 0.75 words |
| 中文 Chinese | 一个汉字通常对应 1–2 个词元 One Chinese character is usually ≈ 1–2 tokens |
| 代码、JSON、生僻词 Code, JSON, rare words | 消耗的 token 更多 Use more tokens |

**为什么重要 Why it matters:** 计费、上下文长度、生成速度，全部按 token 计算，而不是按字数。
Billing, context length and generation speed are all counted in tokens, not words.

模型本质上只做一件事：给定之前所有 Token，预测下一个 Token 的概率分布 → 选一个 → 追加到末尾 → 重复，直到停止。这就是 **自回归生成**。
At its core the model does one thing: given all previous tokens, predict a probability distribution for the next token → pick one → append it → repeat until it stops. This is **autoregressive generation**.

## 2. Context Window：模型的工作记忆 The model's working memory

**上下文窗口 Context window:** 单次请求中模型能看到的最大 Token 数，**输入 + 输出合计**。
The maximum number of tokens the model can see in one request, **input + output combined**.

- 当前的 Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5：**1M tokens**（大约几本书）；旧的 Haiku 4.5：200K。
  Current Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5: **1M tokens** (roughly several books); the older Haiku 4.5: 200K.
- **模型没有记忆，每次 API 调用都是无状态的。** 聊天之所以“记得”前文，是因为客户端每次都重发完整历史，所以对话越长，每轮越慢、越贵。
  **The model has no memory; every API call is stateless.** A chat "remembers" earlier turns only because the client resends the full history each time, so the longer the chat, the slower and pricier each turn.
- `max_tokens` 限制单次调用的输出长度。触顶时回复被截断，`stop_reason` 变成 `"max_tokens"`，而不是正常结束的 `"end_turn"`。
  `max_tokens` limits the output length of one call. When it's hit, the reply is cut off and `stop_reason` becomes `"max_tokens"` instead of the normal `"end_turn"`.

> [!example] 类比 Analogy
> HTTP 是无状态的，Session 能工作是因为客户端每次都带上 Cookie。LLM 的“记忆”同理。
> HTTP is stateless; sessions work because the client sends the cookie every time. An LLM's "memory" works the same way.

## 3. Sampling：如何选下一个 Token How the next token is chosen

每一步模型输出一个分布，例如 `{"cat": 0.6, "dog": 0.3, "car": 0.1}`。从中选择的方式叫 **采样**。
At each step the model outputs a distribution, e.g. `{"cat": 0.6, "dog": 0.3, "car": 0.1}`. How we pick from it is called **sampling**.

| 方法 Method | 做法 How | 特点 / 适用场景 Traits / when to use |
| --- | --- | --- |
| Greedy | 总是选概率最高的 Always pick the most likely token | 确定性，但容易重复、死板 Deterministic, but prone to repetition and stiffness |
| Temperature | 采样前让分布更尖锐或更平坦 Sharpen or flatten the distribution before sampling | 低值稳定，适合分类、抽取、代码；高值多样，适合头脑风暴 Low (e.g. 0.2): stable, good for classification, extraction, code; high (e.g. 1.0): varied, good for brainstorming |
| Top-p | 只从累计概率达到 p 的最小候选集中采样 Sample only from the smallest set whose cumulative probability reaches p (e.g. 0.9) | 砍掉低概率长尾 Cuts off the low-probability tail |
| Top-k | 只从概率最高的 k 个 Token 中采样 Sample only from the k most likely tokens | 固定候选数量 Fixed number of candidates |

详细原理和数值例子见 [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]]。
For the details and worked numbers, see [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]].

> [!warning] 实践注意 In practice（重要 important）
> 最新 Claude 模型（Opus 5.5 等）**不再接受** `temperature` / `top_p` / `top_k`，发送会返回 **400 错误**（Sonnet 5.5、Haiku 5.5 只接受默认值）；API 版本 `2026-10-21` 起所有模型都拒绝它们。应通过 **prompt** 和 **`effort` 参数**（`output_config.effort`：`low` / `medium` / `high` / `xhigh` / `max`）来引导输出。面试仍会问这些概念。
> The latest Claude models (Opus 5.5 and others) **no longer accept** `temperature` / `top_p` / `top_k`; sending them returns a **400 error** (Sonnet 5.5 and Haiku 5.5 accept only the defaults), and from API version `2026-10-21` every model rejects them. Steer the output with the **prompt** and the **`effort` parameter** (`output_config.effort`: `low` / `medium` / `high` / `xhigh` / `max`) instead. Interviews still ask about these concepts.

## 4. 成本计算 Cost

$$
\text{cost} = \text{input tokens} \times \text{input price} + \text{output tokens} \times \text{output price}
$$

价格按 **每百万 Token（MTok）** 报价：
Prices are quoted **per million tokens (MTok)**:

| 模型 Model | Input \$/1M | Output \$/1M | Context |
| --- | --- | --- | --- |
| Claude Opus 5.5（默认 default） | \$4.00 | \$20.00 | 1M |
| Claude Sonnet 5.5（均衡 balanced） | \$2.00 | \$10.00 | 1M |
| Claude Haiku 5.5（最便宜、最快 cheapest, fastest） | \$0.10 | \$0.50 | 1M |
| Claude Haiku 4.5（上一代 previous generation） | \$1.00 | \$5.00 | 200K |

> [!note] 价格说明 Pricing note
> Haiku 5.5 的 \$0.10 / \$0.50 适用于 100K Token 以内的 prompt；超过 100K 时为 \$0.50 / \$2.50。
> Haiku 5.5's \$0.10 / \$0.50 applies to prompts up to 100K tokens; above 100K it's \$0.50 / \$2.50.

**练习 Exercise:** 客服机器人每天 100,000 次请求，每次 2,000 输入 Token + 300 输出 Token，用 Sonnet 5.5，每天花多少钱？
A support bot handles 100,000 requests a day, each with 2,000 input tokens + 300 output tokens, on Sonnet 5.5. What does it cost per day?

> [!success]- 答案 Answer
> - Input: 100,000 × 2,000 = 200M tokens × \$2 = **\$400**
> - Output: 100,000 × 300 = 30M tokens × \$10 = **\$300**
> - 合计 Total: **\$700 / 天 per day**，约 **\$21,000 / 月**
>   About **\$21,000 / month**
> - 换成 Haiku 5.5：200M × \$0.10 + 30M × \$0.50 = **\$35 / 天**，是 Sonnet 5.5 的 1/20。
>   With Haiku 5.5: 200M × \$0.10 + 30M × \$0.50 = **\$35 / day**, 1/20 of Sonnet 5.5.

**要点 Key points:**

- 这几款模型的 **输出单价都是输入的 5 倍** → 缩短回复能省很多钱；长对话中不断累积的输入往往成为主要成本。
  For these models **output costs 5× input** → shorter replies save a lot; in long chats the growing input usually becomes the main cost.
- 降本手段：**Prompt caching**（重复前缀便宜得多，例如 Opus 5.5 缓存读取 \$0.20/MTok，普通输入 \$4/MTok）、**Batch API**（异步，**半价**）、更小的模型、更短的 prompt。
  Ways to cut cost: **prompt caching** (repeated prefixes are much cheaper, e.g. Opus 5.5 cache reads at \$0.20/MTok vs \$4/MTok normal input), the **Batch API** (asynchronous, **half price**), smaller models, shorter prompts.

## 5. 延迟计算 Latency

$$
\text{total latency} \approx \text{TTFT} + \text{output tokens} \times \text{time per token}
$$

- **首 Token 时间 TTFT (Time To First Token):** 网络 + 排队 + 处理全部输入（**prefill**）。输入越长，TTFT 越长。
  Network + queueing + processing the whole input (**prefill**). The longer the input, the longer the TTFT.
- **生成阶段 Generation:** Token 一个一个输出，按 tokens/second 衡量。输出长度通常是延迟的最大驱动因素。
  Tokens come out one at a time, measured in tokens/second. Output length is usually the biggest driver of latency.
- **降延迟 Cutting latency:** 用 **streaming**（边生成边显示，用户只需等 TTFT）、更短的输出、更小的模型、**prompt caching**（降低 TTFT）。
  **Streaming** (show text as it's generated, so the user only waits for the TTFT), shorter outputs, smaller models, **prompt caching** (lowers the TTFT).

> [!example] 系统设计类比 System design analogy
> TTFT ≈ Time To First Byte · 生成速度 ≈ 吞吐量 · Streaming ≈ chunked transfer encoding
> TTFT ≈ Time To First Byte · generation speed ≈ throughput · streaming ≈ chunked transfer encoding

## 6. 一段话面试答案 Interview Answer

LLM 把文本切成 Token，在固定大小的上下文窗口内自回归地预测下一个 Token。采样参数控制随机性。成本按输入和输出 Token 分别计价，输出更贵。延迟约等于 TTFT 加上输出长度除以生成速度。所以降本降延迟的核心是管理 Token：缓存前缀、缩短输出、选对模型、用流式输出改善感知延迟。

"An LLM splits text into tokens and autoregressively predicts the next token within a fixed-size context window. Sampling parameters control randomness. Cost is priced separately for input and output tokens, with output more expensive. Latency is roughly TTFT plus output length divided by generation speed. So the core of reducing both cost and latency is managing tokens: cache prefixes, shorten outputs, pick the right model, and stream to improve perceived latency."

## 7. 一次 API 调用长什么样 What One API Call Looks Like

底层就是一个 HTTPS POST；真实项目用官方 SDK（Java：`com.anthropic:anthropic-java`），不要手拼 JSON。
Underneath it's just an HTTPS POST; real projects use the official SDK (Java: `com.anthropic:anthropic-java`) instead of building JSON by hand.

```http
POST https://api.anthropic.com/v1/messages
x-api-key: $ANTHROPIC_API_KEY
anthropic-version: 2023-06-01
content-type: application/json
```

```json
{
  "model": "claude-opus-5-5",
  "max_tokens": 1024,
  "messages": [
    { "role": "user", "content": "Explain what a token is in one sentence" }
  ]
}
```

- **必填 Required:** 三个字段 `model`、`max_tokens`、`messages`（`role` + `content` 数组），加上面三个 header。
  Three fields, `model`, `max_tokens` and `messages` (an array of `role` + `content`), plus the three headers above.
- **无状态 Stateless:** 多轮对话时，把之前的 user 和 assistant 消息都放进 `messages` 再发一次。
  For a multi-turn conversation, put the earlier user and assistant messages into `messages` and send them again.
- **响应里看 In the response:** `content[0].text`（回答 the answer）、`stop_reason`（`end_turn` / `max_tokens`）、`usage.input_tokens` / `usage.output_tokens`。
  `content[0].text`, `stop_reason` (`end_turn` / `max_tokens`) and `usage.input_tokens` / `usage.output_tokens`.

## 8. 🔗 相关笔记 Related Notes

- [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]]
- [[Prompt Caching]]
- ➡️ 下一课 Next: [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]
