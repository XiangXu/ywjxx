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

> [!info] 课程安排（2026-10-15，60 分钟）
> 30 分钟概念 · 25 分钟动手 · 5 分钟笔记

## 1. Tokens：模型处理文本的单位

LLM 不直接读字符。**Tokenizer** 先把文本切成 Token（子词片段），每个 Token 对应一个整数 id。

| 文本类型 | 经验值 |
| --- | --- |
| 英文 | 1 token ≈ 4 个字符 ≈ 0.75 个单词 |
| 中文 | 1 个汉字通常 ≈ 1–2 个 token |
| 代码、JSON、生僻词 | 消耗更多 token |

**为什么重要：** 计费、上下文长度、生成速度，全部按 token 计算，而不是按字数。

模型本质上只做一件事：给定之前所有 Token，预测下一个 Token 的概率分布 → 选一个 → 追加到末尾 → 重复，直到停止。这就是 **自回归生成（Autoregressive Generation）**。

> [!example] Java 类比
> Tokenizer ≈ 一个 `Map<String, Integer>` 词表 + 一个贪心切分算法。
> 模型输入是 `int[]`，输出是“下一个 int”的概率表。

## 2. Context Window：模型的工作记忆

**Context window（上下文窗口）**：单次请求中模型能看到的最大 Token 数，**输入 + 输出合计**。

- 当前 Claude Opus / Sonnet 模型：**1M tokens**（大约几本书）；Haiku 4.5：200K。
- **模型没有记忆，每次 API 调用都是无状态（stateless）的。** 聊天之所以“记得”前文，是因为客户端每次都把完整历史重新发送。
- 所以对话越长 → 每轮输入 Token 越多 → 每轮越慢、越贵。
- `max_tokens` 限制单次调用的输出长度。触顶时回复被截断，`stop_reason` 变成 `"max_tokens"`，而不是正常结束的 `"end_turn"`。

> [!example] 类比
> HTTP 是无状态的，Session 能工作是因为客户端每次都带上 Cookie。LLM 的“记忆”同理：客户端每次重发历史。

## 3. Sampling：如何选下一个 Token

每一步模型输出一个分布，例如 `{"cat": 0.6, "dog": 0.3, "car": 0.1}`。从中选择的方式叫 **采样（Sampling）**。

| 方法          | 做法                         | 特点 / 适用场景                                 |
| ----------- | -------------------------- | ----------------------------------------- |
| Greedy      | 总是选概率最高的                   | 确定性，但容易重复、死板                              |
| Temperature | 采样前让分布更尖锐或更平坦              | 低（如 0.2）：稳定，适合分类、抽取、代码；高（如 1.0）：多样，适合头脑风暴 |
| Top-p       | 只从累计概率达到 p（如 0.9）的最小候选集中采样 | 砍掉低概率长尾                                   |
| Top-k       | 只从概率最高的 k 个 Token 中采样      | 固定候选数量                                    |

详细原理、数值例子和 Temperature = 0 的可重复性问题见 [[贪心算法 vs Top-p vs Temperature 讲解区别]]。

> [!warning] 实践注意（重要）
> 最新 Claude 模型（Opus 5.5 等）**不再接受** `temperature` / `top_p` / `top_k`，发送会返回 **400 错误**（Sonnet 5.5 只接受默认值）。应通过 **prompt** 和 **`effort` 参数**（`output_config.effort`：`low` / `medium` / `high` / `xhigh` / `max`）来引导输出。
> 面试仍会问这些概念，但今晚的代码里不要发送这些参数。

## 4. 成本计算 Cost

$$
\text{cost} = \text{input\_tokens} \times \text{input price} + \text{output\_tokens} \times \text{output price}
$$

价格按 **每百万 Token（MTok）** 报价：

| 模型 | Input $/1M | Output $/1M | Context |
| --- | --- | --- | --- |
| Claude Opus 5.5（最强，默认） | $4.00 | $20.00 | 1M |
| Claude Sonnet 5.5（均衡） | $2.00 | $10.00 | 1M |
| Claude Haiku 4.5（最便宜、最快） | $1.00 | $5.00 | 200K |

> [!note] 更正
> 课程原文写的是 “Claude Haiku 5.5，$0.10 / $0.50”，这个模型不存在。当前的 Haiku 是 **Haiku 4.5，$1 / $5**。

### 练习

客服机器人每天 100,000 次请求，每次 2,000 输入 Token + 300 输出 Token，用 Sonnet 5.5，每天花多少钱？

> [!success]- 答案
> - Input：100,000 × 2,000 = 200M tokens × $2 = **$400**
> - Output：100,000 × 300 = 30M tokens × $10 = **$300**
> - 合计：**$700 / 天**，约 **$21,000 / 月**
> - 换成 Haiku 4.5：200M × $1 + 30M × $5 = $200 + $150 = **$350 / 天**

### 要点

- 这几款模型的 **输出单价都是输入的 5 倍** → 缩短回复能省很多钱。
- 长对话中输入不断累积，往往成为主要成本。
- 降本手段：
  - **Prompt caching**：重复的前缀便宜得多（例如 Opus 5.5 的缓存读取为 $0.20/MTok，而普通输入为 $4/MTok）。
  - **Batch API**：异步处理，**半价**。
  - 更小的模型、更短的 prompt。

## 5. 延迟计算 Latency

$$
\text{total latency} \approx \text{TTFT} + \text{output\_tokens} \times \text{time per token}
$$

- **TTFT（Time To First Token，首 Token 时间）**：网络 + 排队 + 处理全部输入（**prefill**）。输入越长，TTFT 越长。
- **生成阶段**：Token 一个一个输出，按 tokens/second 衡量。1,000 个输出 Token 远比 100 个慢。
- **结论：输出长度是延迟的最大驱动因素。**

降延迟手段：

- **Streaming**：边生成边显示，用户只需等待 TTFT。
- 更短的输出、更小的模型。
- **Prompt caching**：同样能降低 TTFT。

> [!example] 系统设计类比
> TTFT ≈ Time To First Byte · 生成速度 ≈ 吞吐量（throughput）· Streaming ≈ chunked transfer encoding

## 6. Interview Answer（一段话面试答案）

> "An LLM splits text into tokens and autoregressively predicts the next token within a fixed-size context window. Sampling parameters control randomness. Cost is priced separately for input and output tokens, with output more expensive. Latency is roughly TTFT plus output length divided by generation speed. So the core of reducing both cost and latency is managing tokens: cache prefixes, shorten outputs, pick the right model, and stream to improve perceived latency."

**中文理解：** LLM 把文本切成 Token，在固定大小的上下文窗口内自回归地预测下一个 Token。采样参数控制随机性。成本按输入和输出 Token 分别计价，输出更贵。延迟约等于 TTFT 加上输出长度除以生成速度。所以降本降延迟的核心是管理 Token：缓存前缀、缩短输出、选对模型、用流式输出改善感知延迟。

## 7. Hands-on：LlmHello.java

只用 JDK 自带的 `java.net.http.HttpClient`，不需要 Maven。

### 步骤

1. **获取 API Key**（5 分钟）：在 console.anthropic.com 注册，在 API Keys 中创建 key，充值少量额度（$5 能用很久）。
2. **设置环境变量：**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   ```
3. **运行**（Java 11+ 可以直接运行单个源文件，不需要 `javac`）：
   ```bash
   java LlmHello.java "Explain what a token is in one sentence"
   ```
4. **在输出中找到：**
   - `content[0].text`：模型的回答
   - `stop_reason`：`end_turn` 表示正常结束
   - `usage.input_tokens` 和 `usage.output_tokens`
   - 程序最后打印的成本和延迟

### 请求结构

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

- **三个必填 body 字段**：`model`、`max_tokens`、`messages`（由 `role` + `content` 组成的数组）。
- **三个 header**：`x-api-key`、`anthropic-version: 2023-06-01`、`content-type`。
- **无状态**：多轮对话时，把之前的 user 和 assistant 消息都放进 `messages` 再发一次。

### 实验（可选）

| 实验 | 做法 | 观察 |
| --- | --- | --- |
| A. 中英文 Token | 分别问 “What is a token?” 和 “什么是 token？” | 比较 `input_tokens` |
| B. 截断 | 把 `max_tokens` 设为 20，问一个需要长回答的问题 | `stop_reason` 变成 `max_tokens` |
| C. 延迟 vs 输出长度 | 先要求一句话回答，再要求 500 字回答 | 比较延迟 |

> [!tip] 真实项目
> 不要手拼 JSON，也不要用正则解析。使用官方 Java SDK（`com.anthropic:anthropic-java`）或 Jackson。今晚用 `HttpClient` 只是为了说明：底层就是一个 HTTPS POST。

## 8. Quick Revision（快速复习）

- **Token**：模型的文本单位；计费、上下文、速度都按 Token 算。
- **Autoregressive**：预测下一个 Token → 追加 → 重复。
- **Context window**：输入 + 输出的上限；API 无状态，历史由客户端重发。
- **max_tokens**：输出上限，触顶时 `stop_reason = "max_tokens"`。
- **Sampling**：Greedy / Temperature / Top-p / Top-k；新 Claude 模型改用 prompt + `effort`。
- **Cost**：输入、输出分别计价，输出贵 5 倍；用 caching、Batch、小模型降本。
- **Latency**：TTFT + 输出长度 × 每 Token 时间；用 streaming 改善感知延迟。

## Related Notes

- [[贪心算法 vs Top-p vs Temperature 讲解区别]]
- [[Prompt Caching]]
