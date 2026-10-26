---
title: "Lesson 1: LLM Basics — Tokens, Context, Sampling, Cost, Latency"
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

> [!info] 课程安排 Schedule（2026-10-15，60 分钟 60 min）
> 30 分钟概念 · 25 分钟动手 · 5 分钟笔记
> 30 min concepts · 25 min hands-on · 5 min notes

## 1. Tokens：模型处理文本的单位 The model's unit of text

LLM 不直接读字符。**Tokenizer** 先把文本切成 Token（子词片段），每个 Token 对应一个整数 id。
An LLM doesn't read characters directly. A **tokenizer** first cuts the text into tokens (sub-word pieces), and each token maps to an integer id.

| 文本类型 Text type | 经验值 Rule of thumb |
| --- | --- |
| 英文 English | 每个 token 约等于 4 个字符或 0.75 个单词 One token ≈ 4 characters ≈ 0.75 words |
| 中文 Chinese | 一个汉字通常对应 1–2 个词元 One Chinese character is usually ≈ 1–2 tokens |
| 代码、JSON、生僻词 Code, JSON, rare words | 消耗更多 token Use more tokens |

**为什么重要 Why it matters:** 计费、上下文长度、生成速度，全部按 token 计算，而不是按字数。
Billing, context length and generation speed are all counted in tokens, not words.

模型本质上只做一件事：给定之前所有 Token，预测下一个 Token 的概率分布 → 选一个 → 追加到末尾 → 重复，直到停止。这就是 **自回归生成**。
At its core the model does one thing: given all previous tokens, predict a probability distribution for the next token → pick one → append it → repeat until it stops. This is **autoregressive generation**.

> [!example] Java 类比 Java analogy
> Tokenizer ≈ 一个 `Map<String, Integer>` 词表 + 一个贪心切分算法。
> A tokenizer ≈ a `Map<String, Integer>` vocabulary + a greedy splitting algorithm.
> 模型输入是 `int[]`，输出是“下一个 int”的概率表。
> The model's input is an `int[]`; its output is a probability table for "the next int".

## 2. Context Window：模型的工作记忆 The model's working memory

**上下文窗口 Context window:** 单次请求中模型能看到的最大 Token 数，**输入 + 输出合计**。
The maximum number of tokens the model can see in one request, **input + output combined**.

- 当前的 Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5：**1M tokens**（大约几本书）；旧的 Haiku 4.5：200K。
  Current Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5: **1M tokens** (roughly several books); the older Haiku 4.5: 200K.
- **模型没有记忆，每次 API 调用都是无状态的。** 聊天之所以“记得”前文，是因为客户端每次都把完整历史重新发送。
  **The model has no memory; every API call is stateless.** A chat "remembers" earlier turns only because the client resends the full history each time.
- 所以对话越长 → 每轮输入 Token 越多 → 每轮越慢、越贵。
  So the longer the conversation → the more input tokens per turn → each turn is slower and more expensive.
- `max_tokens` 限制单次调用的输出长度。触顶时回复被截断，`stop_reason` 变成 `"max_tokens"`，而不是正常结束的 `"end_turn"`。
  `max_tokens` limits the output length of one call. When it's hit, the reply is cut off and `stop_reason` becomes `"max_tokens"` instead of the normal `"end_turn"`.

> [!example] 类比 Analogy
> HTTP 是无状态的，Session 能工作是因为客户端每次都带上 Cookie。LLM 的“记忆”同理：客户端每次重发历史。
> HTTP is stateless; sessions work because the client sends the cookie every time. An LLM's "memory" works the same way: the client resends the history every time.

## 3. Sampling：如何选下一个 Token How the next token is chosen

每一步模型输出一个分布，例如 `{"cat": 0.6, "dog": 0.3, "car": 0.1}`。从中选择的方式叫 **采样**。
At each step the model outputs a distribution, e.g. `{"cat": 0.6, "dog": 0.3, "car": 0.1}`. How we pick from it is called **sampling**.

| 方法 Method | 做法 How | 特点 / 适用场景 Traits / when to use |
| --- | --- | --- |
| Greedy | 总是选概率最高的 Always pick the most likely token | 确定性，但容易重复、死板 Deterministic, but prone to repetition and stiffness |
| Temperature | 采样前让分布更尖锐或更平坦 Sharpen or flatten the distribution before sampling | 低值稳定，适合分类、抽取、代码；高值多样，适合头脑风暴 Low (e.g. 0.2): stable, good for classification, extraction, code; high (e.g. 1.0): varied, good for brainstorming |
| Top-p | 只从累计概率达到 p 的最小候选集中采样 Sample only from the smallest set whose cumulative probability reaches p (e.g. 0.9) | 砍掉低概率长尾 Cuts off the low-probability tail |
| Top-k | 只从概率最高的 k 个 Token 中采样 Sample only from the k most likely tokens | 固定候选数量 Fixed number of candidates |

详细原理、数值例子和 Temperature = 0 的可重复性问题见 [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]]。
For the details, worked numbers and the reproducibility issue with temperature = 0, see [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]].

> [!warning] 实践注意 In practice（重要 important）
> 最新 Claude 模型（Opus 5.5 等）**不再接受** `temperature` / `top_p` / `top_k`，发送会返回 **400 错误**（Sonnet 5.5 只接受默认值）。应通过 **prompt** 和 **`effort` 参数**（`output_config.effort`：`low` / `medium` / `high` / `xhigh` / `max`）来引导输出。
> The latest Claude models (Opus 5.5 and others) **no longer accept** `temperature` / `top_p` / `top_k`; sending them returns a **400 error** (Sonnet 5.5 accepts only the defaults). Steer the output with the **prompt** and the **`effort` parameter** (`output_config.effort`: `low` / `medium` / `high` / `xhigh` / `max`) instead.
> 面试仍会问这些概念，但今晚的代码里不要发送这些参数。
> Interviews still ask about these concepts, but don't send these parameters in tonight's code.

## 4. 成本计算 Cost

$$
\text{cost} = \text{input tokens} \times \text{input price} + \text{output tokens} \times \text{output price}
$$

价格按 **每百万 Token（MTok）** 报价：
Prices are quoted **per million tokens (MTok)**:

| 模型 Model | Input \$/1M | Output \$/1M | Context |
| --- | --- | --- | --- |
| Claude Opus 5.5（最强，默认 most capable, default） | \$4.00 | \$20.00 | 1M |
| Claude Sonnet 5.5（均衡 balanced） | \$2.00 | \$10.00 | 1M |
| Claude Haiku 5.5（最便宜、最快 cheapest, fastest） | \$0.10 | \$0.50 | 1M |
| Claude Haiku 4.5（上一代 previous generation） | \$1.00 | \$5.00 | 200K |

> [!note] 价格说明 Pricing note
> Haiku 5.5 的 \$0.10 / \$0.50 适用于 100K Token 以内的 prompt；超过 100K 时为 \$0.50 / \$2.50。
> Haiku 5.5's \$0.10 / \$0.50 applies to prompts up to 100K tokens; above 100K it's \$0.50 / \$2.50.

### 练习 Exercise

客服机器人每天 100,000 次请求，每次 2,000 输入 Token + 300 输出 Token，用 Sonnet 5.5，每天花多少钱？
A support bot handles 100,000 requests a day, each with 2,000 input tokens + 300 output tokens, on Sonnet 5.5. What does it cost per day?

> [!success]- 答案 Answer
> - Input: 100,000 × 2,000 = 200M tokens × \$2 = **\$400**
> - Output: 100,000 × 300 = 30M tokens × \$10 = **\$300**
> - 合计 Total: **\$700 / 天 per day**，约 **\$21,000 / 月**
>   About **\$21,000 / month**
> - 换成 Haiku 5.5（每次 2,000 Token，低于 100K 档）：200M × \$0.10 + 30M × \$0.50 = \$20 + \$15 = **\$35 / 天**，是 Sonnet 5.5 的 1/20。
>   With Haiku 5.5 (2,000 tokens per request, under the 100K tier): 200M × \$0.10 + 30M × \$0.50 = \$20 + \$15 = **\$35 / day**, 1/20 of Sonnet 5.5.

### 要点 Key points

- 这几款模型的 **输出单价都是输入的 5 倍** → 缩短回复能省很多钱。
  For these models **output costs 5× input** → shorter replies save a lot.
- 长对话中输入不断累积，往往成为主要成本。
  In long conversations the input keeps growing and usually becomes the main cost.
- 降本手段：
  Ways to cut cost:
  - **Prompt caching**：重复的前缀便宜得多（例如 Opus 5.5 的缓存读取为 \$0.20/MTok，而普通输入为 \$4/MTok）。
    Repeated prefixes are much cheaper (e.g. Opus 5.5 cache reads are \$0.20/MTok vs \$4/MTok for normal input).
  - **Batch API**：异步处理，**半价**。
    Asynchronous processing at **half price**.
  - 更小的模型、更短的 prompt。
    Smaller models, shorter prompts.

## 5. 延迟计算 Latency

$$
\text{total latency} \approx \text{TTFT} + \text{output tokens} \times \text{time per token}
$$

- **首 Token 时间 TTFT (Time To First Token):** 网络 + 排队 + 处理全部输入（**prefill**）。输入越长，TTFT 越长。
  Network + queueing + processing the whole input (**prefill**). The longer the input, the longer the TTFT.
- **生成阶段 Generation:** Token 一个一个输出，按 tokens/second 衡量。1,000 个输出 Token 远比 100 个慢。
  Tokens come out one at a time, measured in tokens/second. 1,000 output tokens take far longer than 100.
- **结论 Takeaway:** 输出长度是延迟的最大驱动因素。
  Output length is the biggest driver of latency.

降延迟手段：
Ways to cut latency:

- **Streaming**：边生成边显示，用户只需等待 TTFT。
  Show text as it's generated, so the user only waits for the TTFT.
- 更短的输出、更小的模型。
  Shorter outputs, smaller models.
- **Prompt caching**：同样能降低 TTFT。
  Also lowers the TTFT.

> [!example] 系统设计类比 System design analogy
> TTFT ≈ Time To First Byte · 生成速度 ≈ 吞吐量 · Streaming ≈ chunked transfer encoding
> TTFT ≈ Time To First Byte · generation speed ≈ throughput · streaming ≈ chunked transfer encoding

## 6. 一段话面试答案 Interview Answer

LLM 把文本切成 Token，在固定大小的上下文窗口内自回归地预测下一个 Token。采样参数控制随机性。成本按输入和输出 Token 分别计价，输出更贵。延迟约等于 TTFT 加上输出长度除以生成速度。所以降本降延迟的核心是管理 Token：缓存前缀、缩短输出、选对模型、用流式输出改善感知延迟。

"An LLM splits text into tokens and autoregressively predicts the next token within a fixed-size context window. Sampling parameters control randomness. Cost is priced separately for input and output tokens, with output more expensive. Latency is roughly TTFT plus output length divided by generation speed. So the core of reducing both cost and latency is managing tokens: cache prefixes, shorten outputs, pick the right model, and stream to improve perceived latency."

## 7. 动手写 LlmHello.java Hands-on: LlmHello.java

只用 JDK 自带的 `java.net.http.HttpClient`，不需要 Maven。
Uses only the JDK's built-in `java.net.http.HttpClient`; no Maven needed.

### 步骤 Steps

1. **获取密钥 Get an API key:** 在 console.anthropic.com 注册，在 API Keys 中创建 key，充值少量额度（\$5 能用很久）。大约 5 分钟。
   Sign up at console.anthropic.com, create a key under API Keys, and add a little credit (\$5 lasts a long time). About 5 minutes.
2. **设置环境变量 Set the environment variable:**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   ```
3. **运行 Run**（Java 11+ 可以直接运行单个源文件，不需要 `javac`）：
   Java 11+ can run a single source file directly, no `javac` needed:
   ```bash
   java LlmHello.java "Explain what a token is in one sentence"
   ```
4. **在输出中找到 Find in the output:**
   - `content[0].text`：模型的回答 the model's answer
   - `stop_reason`：`end_turn` 表示正常结束 means a normal finish
   - `usage.input_tokens` 和 `usage.output_tokens` 两个用量
     `usage.input_tokens` and `usage.output_tokens`
   - 程序最后打印的成本和延迟 The cost and latency printed at the end

### 请求结构 Request shape

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

- **三个必填字段 Three required fields:** `model`、`max_tokens`、`messages`（由 `role` + `content` 组成的数组）。
  `model`, `max_tokens` and `messages` (an array of `role` + `content`).
- **三个 header Three headers:** `x-api-key`、`anthropic-version: 2023-06-01`、`content-type`。
  `x-api-key`, `anthropic-version: 2023-06-01` and `content-type`.
- **无状态 Stateless:** 多轮对话时，把之前的 user 和 assistant 消息都放进 `messages` 再发一次。
  For a multi-turn conversation, put the earlier user and assistant messages into `messages` and send them again.

### 实验 Experiments（可选 optional）

| 实验 Experiment | 做法 How | 观察 Observe |
| --- | --- | --- |
| A. 中英文 Token Chinese vs English tokens | 分别问 “What is a token?” 和 “什么是 token？” Ask both questions separately | 比较 `input_tokens` Compare `input_tokens` |
| B. 截断 Truncation | 把 `max_tokens` 设为 20，问一个需要长回答的问题 Set `max_tokens` to 20 and ask for a long answer | 停止原因变为 `max_tokens` 值 The `stop_reason` becomes `max_tokens` |
| C. 延迟 vs 输出长度 Latency vs output length | 先要求一句话回答，再要求 500 字回答 Ask for a one-sentence answer, then a 500-word one | 比较延迟 Compare latency |

> [!tip] 真实项目 Real projects
> 不要手拼 JSON，也不要用正则解析。使用官方 Java SDK（`com.anthropic:anthropic-java`）或 Jackson。今晚用 `HttpClient` 只是为了说明：底层就是一个 HTTPS POST。
> Don't build JSON by hand or parse it with regexes. Use the official Java SDK (`com.anthropic:anthropic-java`) or Jackson. Tonight's `HttpClient` is only to show that underneath it's just an HTTPS POST.

## 8. 快速复习 Quick Revision

- **Token**：模型的文本单位；计费、上下文、速度都按 Token 算。
  The model's unit of text; billing, context and speed are all counted in tokens.
- **Autoregressive**：预测下一个 Token → 追加 → 重复。
  Predict the next token → append → repeat.
- **Context window**：输入 + 输出的上限；API 无状态，历史由客户端重发。
  The limit on input + output; the API is stateless, so the client resends the history.
- **max_tokens**：输出上限，触顶时 `stop_reason = "max_tokens"`。
  The output limit; when hit, `stop_reason = "max_tokens"`.
- **Sampling**：Greedy / Temperature / Top-p / Top-k；新 Claude 模型改用 prompt + `effort`。
  Greedy / temperature / top-p / top-k; newer Claude models use the prompt + `effort` instead.
- **Cost**：输入、输出分别计价，输出贵 5 倍；用 caching、Batch、小模型降本。
  Input and output are priced separately, output is 5× more; cut cost with caching, Batch and smaller models.
- **Latency**：TTFT + 输出长度 × 每 Token 时间；用 streaming 改善感知延迟。
  TTFT + output length × time per token; streaming improves perceived latency.

## 9. 🔗 相关笔记 Related Notes

- [[贪心算法 vs Top-p vs Temperature 讲解区别|Greedy vs Top-p vs Temperature]]
- [[Prompt Caching]]
- ➡️ 下一课 Next: [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]
