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

`family_assistant.py` 是一个最小的家庭助手示例。
`family_assistant.py` is a minimal family assistant.

```python
"""最小的 tool calling 示例：家庭助手。
A minimal tool calling example: a family assistant.

运行 Run:
    pip install anthropic
    export ANTHROPIC_API_KEY=your-api-key
    python family_assistant.py "What should I wear for school pickup tomorrow?"
"""

import json
import sys

import anthropic

client = anthropic.Anthropic()

# ① 工具清单：告诉模型"你能让我做什么"。模型靠 name、description 和 input_schema 来判断。
#    Tool list: tells the model "what you can ask me to do". It decides using name, description and input_schema.
TOOLS = [
    {
        "name": "get_weather",
        "description": "Get the weather at a given time (temperature, whether it will rain)",
        "input_schema": {
            "type": "object",
            "properties": {"time": {"type": "string", "description": "e.g. 'tomorrow 15:00'"}},
            "required": ["time"],
        },
    },
    {
        "name": "get_calendar",
        "description": "Get the schedule for a given day",
        "input_schema": {
            "type": "object",
            "properties": {"date": {"type": "string", "description": "e.g. 'tomorrow'"}},
            "required": ["date"],
        },
    },
]


# ② 真正干活的函数。这里用假数据，实际可以换成调 Open-Meteo、Google Calendar。
#    The functions that do the real work. They use fake data here; swap in calls to Open-Meteo or Google Calendar.
def get_weather(time):
    return {"time": time, "temperature": 9, "rain": "light rain"}


def get_calendar(date):
    return {"date": date, "events": [{"time": "15:00", "title": "school pickup"}]}


FUNCTIONS = {"get_weather": get_weather, "get_calendar": get_calendar}


# ③ 循环：问模型 → 它要调工具就执行 → 把结果给它 → 再问，直到它直接回答。
#    The loop: ask the model → run any tool it wants → give it the result → ask again, until it answers directly.
def ask(question):
    messages = [{"role": "user", "content": question}]

    for _ in range(5):  # 最多 5 轮，防止停不下来 At most 5 rounds, so it can't run forever
        response = client.messages.create(
            model="claude-sonnet-5-5",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            return response.content[-1].text  # 模型决定不再查了，这就是最终回答 The model is done looking things up; this is the final answer

        results = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"🔧 Model wants to call {block.name}({block.input})")
                output = FUNCTIONS[block.name](**block.input)
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(output, ensure_ascii=False),
                })
        messages.append({"role": "user", "content": results})

    return "Too many lookups, stopped."


if __name__ == "__main__":
    print(ask(sys.argv[1] if len(sys.argv) > 1 else "What should I wear for school pickup tomorrow?"))
```

> [!example] 一次可能的运行 One possible run
> 下面是问“明天接孩子要穿什么？”时可能的过程。模型每次的选择可能不同。
> Here is what might happen for "What should I wear for school pickup tomorrow?". The model's choices can vary.
>
> | 轮次 Round | 模型 Model | 你的代码 Your code |
> | --- | --- | --- |
> | 1 | 调用 `get_calendar` Calls `get_calendar` | 返回 15:00 接孩子 Returns 15:00 school pickup |
> | 2 | 调用 `get_weather` Calls `get_weather` | 返回 9°C，小雨 Returns 9°C, light rain |
> | 3 | 直接回答穿什么 Answers what to wear | 显示回答 Shows the answer |

## 5. 🏠 我的每日简报 My Daily Brief

**决定 Decision:** 这次不改代码。我的简报每天查的东西都一样（天气、穿衣、按关键词排新闻），现在的规则方案就够用；工具调用适合事先不知道要查什么的场景。
No code changes this time. My brief looks up the same things every day (weather, clothing, news ranked by keyword), so the rule-based approach is enough; tool calling suits cases where you don't know in advance what to look up.

## 6. 🔍 对课程原文的补充与更正 Clarifications to the Lesson Text

- **服务端工具例外 Server tools are the exception:** 原文说模型从不执行任何东西。你定义的工具由你的代码执行；网页搜索这类服务端工具在 Anthropic 一侧执行，不经过你的代码。
  The source says the model never runs anything. Tools you define run in your code; server tools such as web search run on Anthropic's side, without going through your code.
- **日期要告诉模型 The model needs the date:** 问“几号”时模型不调用工具，但它本身不知道今天的日期，要在 prompt 里告诉它，或者提供一个查日期的工具。
  For "What's the date?" the model calls no tools, but it doesn't know today's date by itself; put the date in the prompt or provide a tool that returns it.
- **模型也看参数定义 It reads the schema too:** 原注释说模型只看 `name` 和 `description`，其实它也看 `input_schema`，所以才知道该传什么参数（代码注释已改正）。
  The original comment said the model only looks at `name` and `description`; it also reads `input_schema`, which is how it knows what arguments to pass (the code comment is fixed).
- **权限由你的代码检查 Your code checks permissions:** 模型生成了订单号，不代表这个订单属于当前用户。用户身份要从登录会话里取。
  A model producing an order ID doesn't mean that order belongs to the current user. Take the user's identity from the login session.
- **不是智能体 MCP isn't an agent:** 原文把 MCP 和 Agent 列在一起。MCP 是连接 AI 应用和外部工具、数据的开放标准，Agent 可以通过它使用工具。
  The source lists MCP alongside agents. MCP is an open standard for connecting AI applications to external tools and data, and agents can use tools through it.
- **代码省略了错误处理 The code skips error handling:** 工具不存在或执行失败时程序会崩溃，生产代码要捕获异常，用 `is_error` 把错误还给模型（见下）。另外，任何不是 `tool_use` 的停止原因都被当成最终回答，包括被 `max_tokens` 截断；这时最后一块不一定是文本，最后一行也可能报错。Sonnet 5.5 默认开启自适应思考，思考也计入 `max_tokens`，所以 1024 偏紧。
  If a tool doesn't exist or fails, the program crashes; production code should catch the exception and return the error with `is_error` (below). Also, any stop reason other than `tool_use` is treated as the final answer, including a `max_tokens` cut-off; then the last block may not be text and the last line can crash. Sonnet 5.5 thinks adaptively by default and thinking counts toward `max_tokens`, so 1024 is tight.

```python
try:
    tool = FUNCTIONS[block.name]
    content = json.dumps(tool(**block.input), ensure_ascii=False)
    results.append({"type": "tool_result", "tool_use_id": block.id, "content": content})
except Exception as e:
    results.append({"type": "tool_result", "tool_use_id": block.id, "is_error": True, "content": str(e)})
```

## 7. ❓ 复习题 Review Questions

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
