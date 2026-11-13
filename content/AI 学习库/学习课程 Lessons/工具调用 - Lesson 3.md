---
title: "第 3 课：工具调用 Lesson 3: Tool Calling"
aliases:
  - Tool Calling
  - 工具调用
  - Function Calling
  - Tool Use
  - tool_use
  - tool_result
  - Agent Loop
tags:
  - AI
  - LLM
  - Interview-Prep
  - Claude-API
  - Tool-Calling
  - Agents
  - Python
created: 2026-11-05
---

# 🛠️ 工具调用 Tool Calling

> [!abstract] TL;DR
> 普通调用是你问、模型答；工具调用是模型反过来让你帮它查，查够了再答。
> In a normal call, you ask and the model answers. With tool calling, the model asks you to look things up, then answers once it has enough.

## 1. 🎯 是什么 What It Is

模型自己判断调用哪个工具（API），你的代码负责真正去执行。
The model decides which tool (API) to call, and your code actually runs it.

1. 你提供工具清单（名称、描述、参数）。
   You provide a list of tools (name, description, parameters).
2. 模型判断：调不调、调哪个、传什么参数、按什么顺序。
   The model decides: whether to call one, which one, with what arguments, and in what order.
3. 你的代码执行后，把结果发回模型。
   Your code runs the tool and sends the result back to the model.
4. 循环下去，直到模型直接给出回答。
   This repeats until the model answers directly.

大多数 AI Agent 都建立在它之上：Claude Code、客服机器人、运维排障助手。
Most AI agents are built on it: Claude Code, support bots and ops troubleshooting assistants.

## 2. 🔑 关键细节 Key Details

- 模型不会直接执行你的工具，中间始终隔着你的代码。
  The model never runs your tools itself; your code always sits in between.
- 你的代码这一层负责：校验参数、拦截危险操作、处理错误。
  That layer of code validates arguments, blocks dangerous actions and handles errors.
- 真实 API 用 `tools` 参数传工具定义，模型返回 `tool_use` 块，你回传 `tool_result`，它的 `tool_use_id` 等于该块的 `id`，两者由此对应。
  The real API takes tool definitions in the `tools` parameter. The model returns a `tool_use` block, and you send back a `tool_result` whose `tool_use_id` matches that block's `id`.
- 出错时 `is_error` 写在 `tool_result` 块上，不是写在内容 JSON 里。
  On failure, `is_error` goes on the `tool_result` block, not inside the content JSON.
- 要限制循环次数，有风险的写操作通常要人工确认。
  Cap the number of loops, and usually get a human to confirm risky write actions.

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_123",
  "is_error": true,
  "content": "order A123 not found"
}
```

## 3. 🧭 例子 Examples

**券商客服 Brokerage support:** 查订单 → 查余额 → 回答客户
Look up the order → check the balance → answer the customer

**家庭助手 Family assistant:** 问题不同，要查的东西也不同。
Different questions need different lookups.

| 问题 Question | 模型怎么做 What the model does |
| --- | --- |
| 带伞吗？ Do I need an umbrella? | 只查天气 Checks only the weather |
| 接孩子穿什么？ What should I wear for school pickup? | 先查日历，再查天气 Checks the calendar, then the weather |
| 几号？ What's the date? | 不查任何东西 Calls no tools |

## 4. 💻 代码 Code

最小的 agent loop：工具清单 → 问模型 → 它要调工具就执行 → 把结果发回 → 再问，直到它直接回答。
The minimal agent loop: tool list → ask the model → run any tool it wants → send the result back → ask again, until it answers directly.

```python
# 工具定义：模型靠 name、description 和 input_schema 判断调什么、传什么。
# Tool definition: the model picks a tool and its arguments from name, description and input_schema.
TOOLS = [{
    "name": "get_weather",
    "description": "Get the weather at a given time (temperature, whether it will rain)",
    "input_schema": {
        "type": "object",
        "properties": {"time": {"type": "string", "description": "e.g. 'tomorrow 15:00'"}},
        "required": ["time"],
    },
}]
FUNCTIONS = {"get_weather": get_weather}  # 真正干活的函数 The functions that do the real work


def ask(question):
    messages = [{"role": "user", "content": question}]
    for _ in range(5):  # 上限，防止停不下来 A cap, so it can't run forever
        response = client.messages.create(
            model="claude-sonnet-5-5", max_tokens=1024, tools=TOOLS, messages=messages
        )
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":
            return response.content[-1].text  # 最终回答 The final answer

        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = FUNCTIONS[block.name](**block.input)
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": json.dumps(output, ensure_ascii=False)})
        messages.append({"role": "user", "content": results})  # 结果以 user 消息发回 Results go back as a user message
    return "Too many lookups, stopped."
```

## 5. 🔍 对课程原文的补充与更正 Clarifications to the Lesson Text

- **服务端工具例外 Server tools are the exception:** 原文说模型从不执行任何东西。你定义的工具由你的代码执行；网页搜索这类服务端工具在 Anthropic 一侧执行，不经过你的代码。
  The source says the model never runs anything. Tools you define run in your code; server tools such as web search run on Anthropic's side, without going through your code.
- **日期要告诉模型 The model needs the date:** 问“几号”时模型不调用工具，但它本身不知道今天的日期，要在 prompt 里告诉它，或者提供一个查日期的工具。
  For "What's the date?" the model calls no tools, but it doesn't know today's date by itself; put the date in the prompt or provide a tool that returns it.
- **权限由你的代码检查 Your code checks permissions:** 模型生成了订单号，不代表这个订单属于当前用户。用户身份要从登录会话里取。
  A model producing an order ID doesn't mean that order belongs to the current user. Take the user's identity from the login session.
- **不是智能体 MCP isn't an agent:** 原文把 MCP 和 Agent 列在一起。MCP 是连接 AI 应用和外部工具、数据的开放标准，Agent 可以通过它使用工具。
  The source lists MCP alongside agents. MCP is an open standard for connecting AI applications to external tools and data, and agents can use tools through it.
- **代码省略了错误处理 The code skips error handling:** 工具失败时要捕获异常，用 `is_error: true` 的 `tool_result` 把错误还给模型，而不是崩溃；并且要单独处理 `max_tokens` 截断，别把它当成最终回答。Sonnet 5.5 默认自适应思考，思考也计入 `max_tokens`，所以 1024 偏紧。
  Catch tool exceptions and return the error to the model as a `tool_result` with `is_error: true` instead of crashing, and handle a `max_tokens` cut-off separately rather than treating it as the final answer. Sonnet 5.5 thinks adaptively by default and thinking counts toward `max_tokens`, so 1024 is tight.

## 6. ❓ 复习题 Review Questions

**Q1.** 谁决定调用哪个工具？谁真正执行？ Who decides which tool to call, and who actually runs it?

> [!success]- 答案 Answer
> 模型决定，你的代码执行。
> The model decides, and your code runs it.

**Q2.** 工具出错时，`is_error` 写在哪里？ When a tool fails, where does `is_error` go?

> [!success]- 答案 Answer
> 写在 `tool_result` 块上，不是写在内容 JSON 里。
> On the `tool_result` block, not inside the content JSON.

**Q3.** 为什么循环要设上限？ Why does the loop need a cap?

> [!success]- 答案 Answer
> 防止模型一直调用工具、停不下来。示例代码最多跑 5 轮。
> It stops the model from calling tools forever. The example code runs at most 5 rounds.

## 🔗 相关 Related

- ⬅️ 上一课 Previous: [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]
- 🧩 [[LLM 基础 - Lesson 1|第 1 课：LLM 基础 Lesson 1: LLM Basics]]
- ⚡ [[Prompt Caching]]: 工具定义也是 prompt 前缀的一部分，改动它会让整个缓存失效
  Tool definitions are part of the prompt prefix; changing them invalidates the entire cache
- ➡️ 下一课 Next: 第 4 课，检索增强生成，把你自己的文档交给模型
  Lesson 4, RAG: giving the model your own documents
