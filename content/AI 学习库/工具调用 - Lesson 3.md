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
  - Java
created: 2026-11-05
---

# 🛠️ 工具调用 Tool Calling

> [!info] 课程安排 Schedule（2026-10-29，45 分钟 45 min）
> 25 分钟概念 · 15 分钟动手（在 claude.ai 里做，不需要 API 额度）· 5 分钟笔记
> 25 min concepts · 15 min hands-on (in claude.ai, no API credit needed) · 5 min notes

> [!abstract] TL;DR
> 工具调用就是：你用名字、描述和 JSON Schema **描述函数**，模型返回一个**结构化的调用请求**，**你的代码**去执行并把结果送回，循环直到模型给出最终答案。模型只负责“选哪个函数、传什么参数”，所以**授权、输入校验、副作用控制都在你的代码里**，工具结果和用户输入一样是**不可信数据**。
> Tool calling means you **describe functions** with a name, a description and a JSON Schema; the model returns a **structured call request**, **your code** runs it and sends back the result, and you loop until the model gives a final answer. The model only picks the function and the arguments, so **authorization, input validation and side-effect controls live in your code**, and tool results are **untrusted data**, just like user input.

## 1. 🎯 什么是工具调用 What Tool Calling Is

模型自己不能运行代码、查数据库或调用 API。
The model cannot run code, query a database or call an API by itself.

有了工具调用，你先把函数**描述**给模型；模型觉得需要时，就回复一个**结构化请求**（例如“用 `{"order_id": "A123"}` 调用 `get_order_status`”）。**你的代码**执行函数，把结果送回去，模型再写出最终答案。
With tool calling you first **describe** functions to the model. When it decides one is needed, it replies with a **structured request** (for example "call `get_order_status` with `{"order_id": "A123"}`"). **Your code** runs the function and sends the result back, and the model then writes the final answer.

> [!example] Java 类比 Java analogy：接口 + 分发器 an interface plus a dispatcher
> 你把一个**接口**（方法名、参数类型、Javadoc）交给模型。模型看不到实现，只决定“调哪个方法、传什么参数”。你的代码就是**分发器**。
> You hand the model an **interface** (method names, parameter types, Javadoc). It never sees the implementation; it only decides which method to call with which arguments. Your code is the **dispatcher**.

## 2. 🧩 工具定义 A Tool Definition

每个工具有三部分：
Each tool has three parts:

```json
{
  "name": "get_order_status",
  "description": "Look up the current status of a customer's trade order. Use when the customer asks whether an order has filled, settled or failed.",
  "input_schema": {
    "type": "object",
    "properties": {
      "order_id": { "type": "string", "description": "Order id, e.g. A123" }
    },
    "required": ["order_id"]
  }
}
```

| 部分 Part | 作用 Role | Java 类比 Java analogy |
| --- | --- | --- |
| `name` | 模型调用时用的名字 What the model calls | 方法名 Method name |
| `description` | 告诉模型**什么时候**用它，最重要的一部分 Tells the model **when** to use it; the most important part | Javadoc |
| `input_schema` | 参数的 JSON Schema，和[[Prompt 设计与结构化输出 - Lesson 2\|第 2 课 Lesson 2]]的结构化输出是同一个思路 JSON Schema for the arguments, the same idea as structured output in [[Prompt 设计与结构化输出 - Lesson 2\|第 2 课 Lesson 2]] | 方法签名 Method signature |

> [!tip] 描述要写“什么时候用” Describe *when* to use it
> 好描述写清楚触发场景和边界（“用户问订单是否成交、结算或失败时用”），而不是只重复函数名。
> A good description states the trigger and the boundaries ("use when the customer asks whether an order has filled, settled or failed"), not just the function name restated.

## 3. 🔁 循环 The Loop

```
1. 你的代码 -> API:   用户消息 + 工具定义
   Your code -> API:  user message + tool definitions
2. API -> 你的代码:   stop_reason = "tool_use"，块 {id, name, input}
   API -> your code:  stop_reason = "tool_use", block {id, name, input}
3. 你的代码执行真正的函数
   Your code runs the real function
4. 你的代码 -> API:   完整历史 + tool_result 块 {tool_use_id, content}
   Your code -> API:  the full history + a tool_result block {tool_use_id, content}
5. 重复 2-4，直到 stop_reason = "end_turn"，再展示最终文本
   Repeat 2-4 until stop_reason = "end_turn", then show the final text
```

要点：
Key points:

- 模型可以**一轮调用多个工具**，也可以**链式调用**（先查订单，再查账户）。
  The model may call **several tools in one turn**, or **chain** calls (look up an order, then the account).
- 每次都要把**完整历史**发回去，因为 API 是无状态的。这包括模型那一轮带 `tool_use` 的回复。
  You must send the **whole history** back every time because the API is stateless. That includes the model's own turn containing the `tool_use` block.
- `tool_result` 放在一条 `user` 消息里，并且用 `tool_use_id` 对应到具体的调用。一轮里有多个调用时，所有结果放进**同一条** `user` 消息，而且 `tool_result` 块要排在内容最前面，在任何额外文字之前。
  `tool_result` blocks go in a `user` message and are matched to calls by `tool_use_id`. When a turn has several calls, put all the results in the **same** `user` message, with the `tool_result` blocks first in the content, before any extra text.
- 错误也要作为工具结果返回（`"is_error": true`，例如 “order not found”），这样模型可以恢复，或者向用户追问。
  Return errors as tool results too (`"is_error": true`, e.g. "order not found") so the model can recover or ask the user.

### 💻 Java 里的循环 The Loop in Java

> [!note] 伪代码 Pseudocode
> 下面的 `llm`、`Message`、`ToolUse` 等类型是假设的，不是某个 SDK 的真实 API，重点是循环的形状。
> Types like `llm`, `Message` and `ToolUse` below are made up, not a real SDK API; the point is the shape of the loop.

```java
public String run(String userId, String userText) {
    List<Message> history = new ArrayList<>(List.of(Message.user(userText)));

    for (int i = 0; i < MAX_ITERATIONS; i++) {       // 限制循环 cap the loop
        Response resp = llm.send(history, tools);    // 每次发完整历史 resend the full history
        history.add(resp.asAssistantMessage());      // 保留 tool_use 这一轮 keep the tool_use turn

        if ("end_turn".equals(resp.stopReason())) {
            return resp.text();                      // 最终答案 final answer
        }
        if (!"tool_use".equals(resp.stopReason())) {
            // max_tokens、refusal 等：生产代码要单独处理 handle max_tokens, refusal, etc. separately
            throw new IllegalStateException("unexpected stop reason: " + resp.stopReason());
        }

        List<ToolResult> results = new ArrayList<>();
        for (ToolUse call : resp.toolUses()) {       // 可能一次多个 may be several at once
            results.add(dispatch(userId, call));
        }
        history.add(Message.userToolResults(results)); // 同一条 user 消息 one user message
    }
    throw new IllegalStateException("tool loop exceeded " + MAX_ITERATIONS);
}

private ToolResult dispatch(String userId, ToolUse call) {
    Tool tool = registry.get(call.name());
    if (tool == null) {
        return ToolResult.error(call.id(), "unknown tool: " + call.name());
    }
    try {
        tool.validate(call.input());                 // 1. 校验参数 validate the arguments
        tool.authorize(userId, call.input());        // 2. 授权：用户能访问吗？ is this user allowed?
        return ToolResult.ok(call.id(), tool.execute(userId, call.input())); // 3. 执行 run it
    } catch (ValidationException | AccessDeniedException e) {
        return ToolResult.error(call.id(), e.getMessage()); // 错误也回给模型 errors go back too
    } catch (Exception e) {
        log.error("tool {} failed", call.name(), e);        // 内部细节只写日志 keep internals in the log
        return ToolResult.error(call.id(), "tool failed");  // 超时、下游故障 timeouts, downstream failures
    }
}
```

## 4. 🏭 生产注意事项（面试高频） Production Concerns

| 关注点 Concern | 怎么做 What to do |
| --- | --- |
| **授权 Authorization** | 授权在你的代码里，不在 prompt 里。模型只是选参数，分发器必须检查这个用户能不能访问这个订单。 Authorization lives in your code, not the prompt. The model just chooses arguments; the dispatcher must check the user may access that order. |
| **输入校验 Input validation** | 执行前按 schema 校验，模型仍然可能给出错误的值。 Validate against the schema before executing; the model can still produce bad values. |
| **副作用 Side effects** | 只读工具可以直接执行；“下单”“转账”这类操作需要人工确认、幂等键和审计日志。 Read-only tools can run freely; actions like "place trade" or "send money" need human confirmation, idempotency keys and audit logs. |
| **限制循环 Limit the loop** | 设置最大迭代次数和超时，避免模型困惑后无限循环。 Set a max number of iterations and a timeout so a confused model can't loop forever. |
| **精简工具集 Keep the tool set small** | 相似的工具太多会选错。少而清晰的工具，胜过多而重叠的工具。 Too many similar tools leads to wrong choices. Fewer, clearer tools beat many overlapping ones. |
| **提示注入 Prompt injection** | 网页或文档返回的文本是不可信数据，和[[Prompt 设计与结构化输出 - Lesson 2\|第 2 课 Lesson 2]]里的用户输入一样。 Text coming back from a web page or a document is untrusted data, just like user input in [[Prompt 设计与结构化输出 - Lesson 2\|第 2 课 Lesson 2]]. |

> [!important] 不要信任模型生成的参数 Never trust arguments just because the model produced them
> 模型生成了 `order_id`，不代表这个订单属于当前用户。更稳妥的做法是：`account_id` 这类身份信息由**你的代码从登录会话里取**，而不是让模型填。
> The model producing an `order_id` doesn't mean that order belongs to the current user. Even better: take identity such as `account_id` **from the authenticated session in your code**, rather than letting the model fill it in.

这也是 **Agent** 的核心：Agent 就是这个循环加上更多的工具和更多的迭代。**MCP**（Model Context Protocol，模型上下文协议）是把工具打包起来的标准方式，让很多应用都能使用。
This is also the core of **agents**: an agent is this loop with more tools and more iterations. **MCP** (Model Context Protocol) is a standard way to package tools so many apps can use them.

## 5. 🎤 一段话面试答案 Interview Answer

> [!quote] 面试答案 Interview answer
> “工具调用是指：我用名字、清晰的描述和 JSON Schema 来描述函数；模型返回一个结构化调用，我的代码执行它并返回结果，循环直到模型给出最终答案。模型只选择函数和参数，所以授权、输入校验和副作用控制都留在我的代码里：只读工具直接执行，写操作需要人工确认和幂等性，循环有迭代上限。工具结果和用户文本一样，是不可信输入。”
> "Tool calling means I describe functions with a name, a clear description and a JSON schema; the model returns a structured call, my code executes it and returns the result, and we loop until the model gives a final answer. The model only picks the function and arguments, so authorization, input validation and side-effect controls stay in my code: read-only tools run directly, write actions need human confirmation and idempotency, and the loop has an iteration cap. Tool results are untrusted input, same as user text."

## 6. 🧪 动手练习：券商客服 Hands-on: A Brokerage Support Assistant

你扮演 API 和 Java 代码，Claude 扮演模型。
You play the API and your Java code; Claude plays the model.

**第 1 步 Step 1.** 新开一个对话，粘贴下面的内容：
Start a new chat and paste:

```
You are a support assistant for a brokerage app. You can use these tools.
To call one, reply with ONLY a JSON object like {"tool": "<name>", "input": {...}} and nothing else.
I will reply with the tool result inside <tool_result> tags. When you have enough information, answer the customer in plain text.

Tools:
1. get_order_status(order_id: string): status of a trade order (filled, settling, failed) and its settlement date.
2. get_cash_balance(account_id: string): available cash and cash still settling.

Customer (account_id "ACC9"): "I sold my shares yesterday (order A123) but the cash still isn't in my account and I need it for rent."
```

**第 2 步 Step 2.** Claude 应该返回一个工具调用。你用假结果回复：
Claude should return a tool call. Reply with a fake result:

```
<tool_result>{"order_id": "A123", "status": "settling", "settlement_date": "2026-10-30"}</tool_result>
```

如果它接着调用 `get_cash_balance`，回复：
If it then calls `get_cash_balance`, reply:

```
<tool_result>{"available": 120.00, "settling": 2450.00}</tool_result>
```

读最终答案，数一数一共几次往返。通常是两次工具调用，再加一次最终回答。
Read the final answer and count the round trips. Usually that is two tool calls plus the final answer.

**第 3 步 错误路径 Step 3: the error path.** 重新开始，这次用下面的内容回复第一个工具调用：
Start over, but this time answer the first tool call with:

```
<tool_result>{"is_error": true, "message": "order A123 not found for account ACC9"}</tool_result>
```

看它是不是合理地恢复（向用户要正确的订单号），而不是编造答案。
See whether it recovers sensibly (asks for the right id) instead of making something up.

> [!note] 这只是模拟 This is only a simulation
> 在聊天里，`is_error` 只是你写进文本里的一个字段。真正的 API 里，`is_error` 是 `tool_result` 块自己的字段，不是放在 `content` 的 JSON 里。
> In a chat, `is_error` is just a field you typed into text. In the real API, `is_error` is a field of the `tool_result` block itself, not something inside the `content` JSON.

**第 4 步 想一想 Step 4: think, don't type.** 见下面的[[#8. 📝 课后笔记 After-class Notes|课后笔记 After-class Notes]]。
See [[#8. 📝 课后笔记 After-class Notes|课后笔记 After-class Notes]] below.

## 7. 🔍 对课程原文的补充与更正 Clarifications to the Lesson Text

> [!note] 1. 循环的结束条件不止一种 The loop can end on more than `end_turn`
> 课程写“直到 `stop_reason = "end_turn"`”。生产代码还要处理 `max_tokens`（输出被截断，可能包含不完整的 `tool_use`，通常要调高上限后重试）、`pause_turn`、`refusal` 等其他停止原因，不能把“不是 `tool_use`”都当成成功。
> The lesson says "until `stop_reason = "end_turn"`". Production code must also handle other stop reasons such as `max_tokens` (output cut off, possibly with an incomplete `tool_use`; usually retry with a higher limit), `pause_turn` and `refusal`; don't treat everything that isn't `tool_use` as success.

> [!note] 2. `tool_result` 的位置和格式 Where `tool_result` goes and how
> `tool_result` 要放在 `user` 消息里，并且必须带上对应的 `tool_use_id`。一轮有多个调用时，所有结果放进同一条 `user` 消息，而不是分成多条，并且排在其他文字之前。
> `tool_result` goes in a `user` message and must carry the matching `tool_use_id`. When a turn has several calls, put all results in one `user` message instead of splitting them, ahead of any other text.

> [!note] 3. 动手部分的 `account_id` 是模型填的，真实系统不该这样 In the hands-on, the model fills `account_id`; a real system shouldn't
> 练习里 `get_cash_balance(account_id)` 的 `account_id` 来自模型。在真实系统里，账户应该由登录会话决定，否则模型（或被注入的文本）可以请求别人的账户。
> In the exercise, the `account_id` of `get_cash_balance(account_id)` comes from the model. In a real system the account should come from the logged-in session; otherwise the model (or injected text) could ask for someone else's account.

> [!note] 4. “不要信任参数”不等于“不用 schema” "Don't trust arguments" doesn't mean "skip the schema"
> 设置 `strict: true` 后，参数会符合 schema 的**形状**，但它检查不了**业务含义**：这个订单是不是这个用户的、金额是否合理，只能由你的代码检查。
> With `strict: true` the arguments conform to the schema's **shape**, but it can't check **business meaning**: whether this order belongs to this user or the amount is sensible is only checked by your code.

## 8. 📝 课后笔记 After-class Notes

**1.** 工具调用循环的 4 步 The tool-calling loop in 4 steps
- ① 你把用户消息和工具定义发给 API。
  You send the user message and tool definitions to the API.
- ② 模型返回 `tool_use`（名字、参数、id），你的代码执行真正的函数。
  The model returns `tool_use` (name, input, id), and your code runs the real function.
- ③ 你把完整历史加上 `tool_result` 发回去。
  You send back the full history plus a `tool_result`.
- ④ 重复，直到模型给出最终文本（`end_turn`），并设置迭代上限。
  Repeat until the model gives final text (`end_turn`), with an iteration cap.

**2.** 为什么授权属于你的代码，不属于 prompt Why authorization belongs in your code, not in the prompt
- prompt 里的规则只是**请求**，模型可能被说服、被注入，或者简单地出错；你的代码是确定性的，是能可靠地**强制**规则的地方。
  Rules in a prompt are only **requests**: the model can be talked around, injected or simply wrong. Your code is deterministic and the place that can reliably **enforce** the rules.
- 模型只是选择参数，所以每个参数都是不可信输入，必须由分发器检查“这个用户能不能这样做”。
  The model only chooses arguments, so every argument is untrusted input, and the dispatcher must check "may this user do this".

**3.** 第 4 步的答案：如果有第三个工具 `place_withdrawal(account_id, amount)`，分发器要先做哪些检查？ Step 4: if a third tool `place_withdrawal(account_id, amount)` existed, what would the dispatcher check first?

| 检查 Check | 内容 What | 为什么 Why |
| --- | --- | --- |
| **身份与授权 Identity and authorization** | `account_id` 取自登录会话，并确认该用户拥有这个账户 Take `account_id` from the session and confirm the user owns the account | 防止取走别人的钱 Stops moving someone else's money |
| **参数校验 Argument validation** | 金额为正，用 `BigDecimal`，币种和精度正确，类型符合 schema Amount is positive, uses `BigDecimal`, currency and precision are right, types match the schema | 模型可能给出错误的值 The model can still produce bad values |
| **业务规则 Business rules** | 金额不超过**可用**现金（结算中的钱不能提），单笔和每日限额，账户未冻结 Amount within **available** cash (settling cash can't be withdrawn), per-transaction and daily limits, account not frozen | 防止透支和滥用 Prevents overdrafts and abuse |
| **收款方 Destination** | 只能转到已绑定、已验证的账户 Only to linked and verified accounts | 防止转到攻击者账户 Stops transfers to an attacker's account |
| **人工确认 Human confirmation** | 向用户显示金额和收款方，由用户明确确认（必要时再加一次验证） Show the user the amount and destination and get an explicit confirmation (plus step-up verification if needed) | 写操作不能只靠模型一句话 A write action can't rest on one model sentence |
| **幂等键 Idempotency key** | 同一个键重复调用只执行一次 The same key executes only once | 重试或模型重复调用不会转两次 Retries or repeated model calls can't withdraw twice |
| **审计与限流 Audit and rate limit** | 记录谁、何时、用什么参数；限制调用频率 Log who, when and with what arguments; limit the call rate | 事后可追查，也能挡住失控的循环 Traceable afterwards, and stops a runaway loop |

## 9. ❓ 复习题 Review Questions

**Q1.** 工具调用循环的步骤是什么？谁真正执行函数？ What are the steps of the tool-calling loop, and who actually runs the function?

> [!success]- 答案 Answer
> 发送消息和工具定义 → 模型返回 `tool_use` → **你的代码**执行函数 → 把完整历史加 `tool_result` 发回 → 重复，直到 `end_turn`。模型从不执行你自己的（客户端）工具；web search 这类服务端工具由 Anthropic 一侧执行。
> Send the message and tool definitions → the model returns `tool_use` → **your code** runs the function → send back the full history plus `tool_result` → repeat until `end_turn`. The model never executes your own (client) tools; server tools such as web search run on Anthropic's side.

**Q2.** 工具定义里哪一部分最重要？为什么？ Which part of a tool definition matters most, and why?

> [!success]- 答案 Answer
> `description`。模型靠它判断**什么时候**该用这个工具；写得像好的 Javadoc，说清楚触发场景和边界。
> The `description`. The model uses it to decide **when** to use the tool; write it like good Javadoc, with the trigger and the boundaries.

**Q3.** 为什么每次都要把完整历史发回去？ Why do you resend the whole history every time?

> [!success]- 答案 Answer
> API 是无状态的，模型不会“记得”上一轮。历史里还必须包含带 `tool_use` 的那一轮回复，`tool_result` 才能通过 `tool_use_id` 对上。
> The API is stateless; the model doesn't "remember" the previous turn. The history must also include the model's turn with the `tool_use`, so the `tool_result` can match it through `tool_use_id`.

**Q4.** 工具执行失败（比如订单不存在）时应该怎么做？ What should you do when a tool fails, for example the order doesn't exist?

> [!success]- 答案 Answer
> 把错误作为 `tool_result` 返回（`is_error: true` 加上清楚的信息），而不是让程序崩溃。模型可以据此恢复，比如向用户要正确的订单号，而不是编造答案。
> Return the error as a `tool_result` (`is_error: true` with a clear message) instead of crashing. The model can then recover, for example by asking the user for the right order id, rather than making something up.

**Q5.** 为什么授权不能只写在 prompt 里？ Why isn't it enough to put authorization in the prompt?

> [!success]- 答案 Answer
> prompt 里的规则只是请求，模型可能出错或被注入。授权必须在分发器里确定性地检查：身份取自会话，并确认该用户能访问这个资源。
> Rules in a prompt are only requests, and the model can be wrong or injected. Authorization must be checked deterministically in the dispatcher: take identity from the session and confirm the user may access the resource.

**Q6.** 哪些工具可以直接执行，哪些需要额外保护？ Which tools can run directly, and which need extra protection?

> [!success]- 答案 Answer
> 只读工具可以直接执行（仍然要授权）。有副作用的工具（下单、转账）需要人工确认、幂等键和审计日志。
> Read-only tools can run directly (authorization still applies). Tools with side effects (place a trade, send money) need human confirmation, idempotency keys and audit logs.

**Q7.** 怎么防止模型把循环跑个没完？ How do you stop a confused model from looping forever?

> [!success]- 答案 Answer
> 设置最大迭代次数和整体超时，超过就中止并返回错误或降级的回答。
> Set a max iteration count and an overall timeout; when exceeded, abort and return an error or a degraded answer.

**Q8.** 工具返回的网页文本里写着 “ignore previous instructions”，怎么办？ A tool returns web text saying "ignore previous instructions". What do you do?

> [!success]- 答案 Answer
> 把工具结果当作不可信**数据**：用标签包起来并在 system 里说明，给模型最小权限（没有危险工具），对高风险操作要求人工确认，并校验输出。
> Treat tool results as untrusted **data**: wrap them in tags and say so in `system`, give the model least privilege (no dangerous tools), require human confirmation for risky actions, and validate the output.

## 🔗 相关 Related

- ⬅️ 上一课 Previous: [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]
- 🧩 [[LLM 基础 - Lesson 1|第 1 课：LLM 基础 Lesson 1: LLM Basics]]
- ⚡ [[Prompt Caching]]: 工具定义也是 prompt 前缀的一部分，改动工具定义会让它之后的缓存全部失效
  Tool definitions are part of the prompt prefix; changing them invalidates the cache after them
- ➡️ 下一课 Next: Lesson 4 · RAG（检索增强生成，把你自己的文档交给模型）
  Retrieval-augmented generation: giving the model your own documents
