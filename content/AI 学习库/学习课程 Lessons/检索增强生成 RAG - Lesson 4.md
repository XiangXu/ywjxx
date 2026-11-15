---
title: "第 4 课：检索增强生成 Lesson 4: RAG"
aliases:
  - RAG
  - 检索增强生成
  - Retrieval-Augmented Generation
  - Embedding
  - Vector Database
  - 向量数据库
  - Hybrid Search
  - Cosine Similarity
tags:
  - AI
  - LLM
  - Interview-Prep
  - Claude-API
  - RAG
  - Python
created: 2026-11-15
---

# 📚 检索增强生成 RAG

> [!abstract] TL;DR
> 模型不知道你的私有文档。RAG 先把和问题相关的几段找出来，塞进 prompt，再让模型只根据这几段回答。
> The model doesn't know your private documents. RAG finds the few passages related to the question, puts them in the prompt, and has the model answer from those passages only.

## 1. 🎯 是什么 What It Is

模型只知道训练时见过的东西，不知道公司内部文档、昨天的新政策或你的笔记。全部贴进 prompt 又放不下、也太贵。
A model only knows what it saw in training: not your internal docs, yesterday's policy change, or your notes. Pasting everything into the prompt doesn't fit and costs too much.

RAG 只把**和问题相关的那几段**找出来贴进去，相当于给模型一份开卷资料。
RAG pastes in **only the passages related to the question**, like handing the model open-book notes.

**提前准备（只做一次）Prepare ahead (once)**

1. 切段：把文档切成几百 token 的小段。
   Chunk: split documents into pieces of a few hundred tokens.
2. 嵌入：每段算一个 embedding（一串代表意思的数字）。
   Embed: compute an embedding for each chunk (a list of numbers that represents its meaning).
3. 存储：存进向量数据库。
   Store: save them in a vector database.

**每次提问 Every question**

1. 问题也算成 embedding。
   Embed the question too.
2. 相似度搜索，找出最接近的 3–5 段。
   Run a similarity search for the 3–5 closest chunks.
3. 这几段加上问题，一起发给模型。
   Send those chunks plus the question to the model.
4. 模型只根据这几段回答，并标出处。
   The model answers from those chunks only, and cites them.

> [!tip] 一句话流程 The flow in one line
> 问题 → 算 embedding → 找最像的几段 → 拼进 prompt → 模型回答
> question → embed → find closest chunks → build prompt → model answers

## 2. 🔑 关键细节 Key Details

| 概念 Concept | 要点 Key point |
| --- | --- |
| 嵌入 Embedding | 一串数字（比如 1024 维），意思相近的文字向量也相近 A list of numbers (say 1,024); similar meanings give nearby vectors |
| 相似度 Similarity | 常用余弦相似度，越接近 1 越像 Usually cosine similarity; closer to 1 means more similar |
| 段大小 Chunk size | 太大混进噪音，太小丢上下文；常见几百 token，相邻段略重叠 Too big adds noise, too small loses context; a few hundred tokens is common, with slight overlap |
| 取几段 Top-k | 太少会漏答案，太多浪费 token 还分散注意力；一般 3–5 段 Too few can miss the answer, too many waste tokens and distract; usually 3–5 |
| 混合检索 Hybrid search | 订单号、产品代码这类精确词，关键词搜索（比如 BM25 算法）更准；生产里常和向量检索一起用 Keyword search (e.g. BM25) is better for exact terms like order IDs; production often combines it with vectors |
| 重排序 Reranking | 先粗召回几十段，再用重排模型挑出最相关的几段 Retrieve a few dozen candidates, then a reranker picks the best few |
| 同一模型 Same model | 文档和问题必须用同一个 embedding 模型，换模型要全部重新嵌入 Docs and queries must use the same embedding model; switching models means re-embedding everything |
| 怎么评估 Evaluation | 检索和回答分开测：检索看 recall@k，回答看是否忠于资料 Measure retrieval and answers separately: recall@k (is the right chunk in the top k) for retrieval, faithfulness to the passages for answers |

- **让模型老实 Keep it honest:** prompt 里写明只根据资料回答、找不到就说不知道、标出处。
  Tell it to answer only from the passages, say so when the answer isn't there, and cite.
- **文档不可信 Docs are untrusted:** 和第 2 课一样，用 `<doc id="3">…</doc>` 标签包起来，让模型把它当资料而不是指令，降低提示注入风险。
  As in Lesson 2, wrap passages in `<doc id="3">…</doc>` tags so the model treats them as data rather than instructions, which reduces (but doesn't remove) prompt-injection risk.
- **检索时过滤权限 Filter at retrieval:** 按用户权限过滤文档，别指望靠 prompt 让模型"别说"。
  Filter by the user's permissions before the model sees anything; don't rely on the prompt to keep secrets.

## 3. 🧭 例子 Examples

**券商客服 Brokerage support:** 公司有 500 页内部 FAQ，客户问"卖了股票多久钱能到账？"
The company has 500 pages of internal FAQ. A customer asks: "How long after selling shares does the cash arrive?"

| 步骤 Step | 发生了什么 What happens |
| --- | --- |
| 检索 Retrieve | 找到 3 段：T+1 结算、周末节假日顺延、可提现与未结算余额 Finds 3 chunks: T+1 settlement, weekend/holiday delays, withdrawable vs unsettled cash |
| 拼 prompt Build prompt | 用 `<doc>` 标签包好这 3 段，再加上问题 Wraps the 3 chunks in `<doc>` tags and adds the question |
| 回答 Answer | 一般下一个工作日到账，周末顺延，引用第 1、2 段 Usually the next business day, later over weekends; cites docs 1 and 2 |

**什么时候不用 RAG When not to use RAG**

| 问题 Question | 更好的办法 Better approach |
| --- | --- |
| 我账户现在多少钱？ What's my balance right now? | 工具调用查实时数据（第 3 课） Tool calling for live data (Lesson 3) |
| 把这封邮件改礼貌点 Make this email more polite | 直接问，不需要外部资料 Just ask; no outside knowledge needed |
| 总结这份 10 页文档 Summarize this 10-page doc | 放得下就整份贴进去 If it fits, paste it whole |
| 每日简报（天气、日程、新闻） My daily brief (weather, calendar, news) | 数据少且每天都是新的，整份放进 prompt 即可 Small, fresh data each day; put it all in the prompt |

> [!important] 适用场景 When RAG fits
> 知识多、问题杂、每次只用其中一小部分。
> Lots of knowledge, varied questions, and each question needs only a small part.

> [!example]- 动手 Hands-on（claude.ai，10 分钟 10 min）
> 新开对话贴下面这段；再把问题换成"可以买加密货币吗？"，看它会不会老实说资料里没有。
> Paste this into a new chat, then change the question to "Can I buy crypto?" and check whether it admits the answer isn't there.
>
> ```
> 只根据下面的资料回答。找不到答案就说"资料里没有"。在句末用 [doc N] 标出处。
> Answer only from the passages below. If the answer isn't there, say "not in the passages". Cite with [doc N].
>
> <doc id="1">Trades settle on T+1: cash from a sale becomes withdrawable one business day after the trade.</doc>
> <doc id="2">If the settlement day is a weekend or bank holiday, settlement moves to the next business day.</doc>
> <doc id="3">Unsettled cash can be used to buy other shares but cannot be withdrawn.</doc>
>
> 问题 Question: 我周五卖了股票，什么时候能提现？ I sold shares on Friday. When can I withdraw the cash?
> ```
>
> 预期答案：周五之后的下一个工作日是周一，若周一是节假日再顺延 \[doc 1\]\[doc 2\]。
> Expected: the next business day after Friday is Monday, later if Monday is a holiday \[doc 1\]\[doc 2\].

## 4. 💻 代码 Code

不调用任何 API 的迷你 RAG：用"词袋 + 余弦"代替真正的 embedding，演示检索这一步。
A mini RAG with no API calls: a bag-of-words vector plus cosine stands in for a real embedding, to show the retrieval step.

```python
"""
mini_rag.py - 迷你 RAG 检索演示 Minimal RAG retrieval demo
运行 Run:  python3 mini_rag.py   (不需要装包，不调用模型 No packages, no model call)
"""
import math
import re
from collections import Counter

# ① 文档切段（这里每段就是一句）Chunks (one sentence each here)
DOCS = [
    "Trades settle on T+1: cash from a sale becomes withdrawable one business day after the trade.",
    "If the settlement day is a weekend or bank holiday, settlement moves to the next business day.",
    "Unsettled cash can be used to buy other shares but cannot be withdrawn.",
    "To reset your password, use the 'Forgot password' link on the login page.",
    "Dividends are paid into your cash balance on the payment date.",
]

# ② "Embedding"：把文字变成词频向量 Turn text into a word-count vector
def embed(text):
    words = re.findall(r"[a-z0-9+]+", text.lower())
    return Counter(words)

# ③ 余弦相似度 Cosine similarity
def cosine(a, b):
    dot = sum(a[w] * b[w] for w in a)
    norm = math.sqrt(sum(v * v for v in a.values())) * math.sqrt(sum(v * v for v in b.values()))
    return dot / norm if norm else 0.0

# ④ 提前算好所有段的向量（"向量数据库"）Precompute vectors (the "vector DB")
INDEX = [(i + 1, doc, embed(doc)) for i, doc in enumerate(DOCS)]

# ⑤ 检索 top-k Retrieve the top-k chunks
def retrieve(question, k=2):
    q = embed(question)
    scored = [(cosine(q, vec), doc_id, doc) for doc_id, doc, vec in INDEX]
    scored.sort(reverse=True)
    return scored[:k]

# ⑥ 拼 prompt（真实系统会发给模型）Build the prompt (a real system sends this to the model)
def build_prompt(question, hits):
    docs = "\n".join(f'<doc id="{doc_id}">{doc}</doc>' for _, doc_id, doc in hits)
    return (
        "Answer only from the passages below. If the answer isn't there, say so. Cite with [doc N].\n\n"
        f"{docs}\n\nQuestion: {question}"
    )

if __name__ == "__main__":
    question = "When can I withdraw cash after I sell shares on a weekend?"
    hits = retrieve(question)
    for score, doc_id, doc in hits:
        print(f"{score:.2f}  doc {doc_id}: {doc}")
    print("\n--- prompt ---\n" + build_prompt(question, hits))
```

> [!example] 实际运行结果 Actual output（全部 5 段 all 5 chunks）
>
> | 分数 Score | 文档 Doc | 共同的词 Shared words |
> | --- | --- | --- |
> | 0.27 ✅ | doc 1: T+1 结算 T+1 settlement | on, cash, a, after |
> | 0.21 ✅ | doc 3: 未结算现金 unsettled cash | can, cash, shares |
> | 0.16 | doc 5: 分红 dividends | on, cash |
> | 0.11 | doc 2: 周末顺延 weekend delay ❗ | a, weekend |
> | 0.06 | doc 4: 密码 password | on |
>
> `k=2` 只取前两段。讲周末顺延的 doc 2 排第 4 被漏掉了，连分红那段都排在它前面。
> With `k=2` only the top two are kept. Doc 2, the weekend rule, ranks 4th and is missed; even the dividend chunk beats it.
>
> 词袋只比字面：`withdraw` 对不上 `withdrawable`，`sell` 对不上 `sale`，分数主要来自 on、a 这类虚词。真正的 embedding 懂意思，很可能会把 doc 2 排进来。
> Bag-of-words compares exact words only: `withdraw` doesn't match `withdrawable`, and `sell` doesn't match `sale`, so most of the score comes from filler words like "on" and "a". A real embedding captures meaning and would most likely rank doc 2 in.

真实系统里，② 换成 embedding 模型（如 Voyage AI），④ 换成向量数据库（pgvector、Pinecone 等），⑥ 之后再调用 Claude。
In a real system, ② becomes an embedding model (such as Voyage AI), ④ becomes a vector database (pgvector, Pinecone, etc.), and after ⑥ you call Claude.

## 5. 🔍 对课程原文的补充与更正 Clarifications to the Lesson Text

- **不是训练 Not training:** 模型本身不变，只是每次多给资料。改了文档，下一次回答就生效，不用重新训练。
  The model doesn't change; it gets extra material per question. Edit a document and the next answer reflects it, with no retraining.
- **对比微调 Versus fine-tuning:** 要模型知道新事实或常变的事实，通常用 RAG；要改风格、格式或特定任务行为，才考虑微调。微调记事实不可靠，也给不出出处。面试常问。
  To give the model new or changing facts, usually use RAG; consider fine-tuning to change style, format or task behavior. Fine-tuning is unreliable for facts and can't cite sources. A common interview question.
- **长上下文也不够用 Long context still needs it:** 几万页资料还是放不下；每次都贴全部又慢又贵；资料太长时模型也更容易漏掉中间的内容。
  Tens of thousands of pages still won't fit, sending everything every time is slow and costly, and models are more likely to miss details buried in a very long prompt.
- **答错先查检索 Check retrieval first:** 大部分 RAG 的错是没找到对的那段，不是模型笨。先打印 top-k 看看找到了什么（上面的 doc 2 就是例子）。
  Most RAG failures are "the right chunk wasn't retrieved", not a weak model. Print the top-k and look (doc 2 above is an example).
- **余弦范围 Cosine range:** 原文说"0 = 无关"。词频向量没有负数，所以范围是 0 到 1；真正的 embedding 范围是 -1 到 1，无关的文字也常有不低的分数。看排名，别看绝对值。
  The source says 0 means unrelated. Word-count vectors have no negative values, so they score 0 to 1; real embeddings range from -1 to 1, and unrelated texts often still score noticeably above 0. Compare rankings, not absolute scores.
- **编号也会被切碎 IDs get split too:** 原文说精确编号"没有意思"。更准确地说，embedding 通常会把 `A123` 和 `A132` 看成几乎一样，所以找不准具体那一个。
  The source says exact IDs have "no meaning". More precisely, an embedding usually sees `A123` and `A132` as nearly identical, so it can't pin down the exact one.
- **嵌入模型 Embedding models:** Anthropic 不提供自己的 embedding 模型，官方文档推荐 Voyage AI 等第三方。
  Anthropic doesn't offer its own embedding model; its docs point to third parties such as Voyage AI.
- **项目功能 Claude Projects:** 项目知识快超出上下文窗口时，Claude Projects 会自动切换成检索模式，只取相关部分。
  When project knowledge approaches the context window limit, Claude Projects switches to a retrieval mode and pulls in only the relevant parts.
- **和缓存配合 With prompt caching:** 检索到的段每次不同，要放在固定的系统 prompt 之后（`cache_control` 打在系统 prompt 上），否则缓存前缀会失效。
  Retrieved chunks change every question, so put them after the fixed system prompt (with `cache_control` on the system prompt), or they break the cached prefix.

## 6. ❓ 复习题 Review Questions

**Q1.** RAG 的两个阶段分别做什么？ What do RAG's two phases do?

> [!success]- 答案 Answer
> 准备阶段：切段、算 embedding、存进向量库。提问阶段：问题算 embedding、找最像的几段、拼进 prompt、模型回答。
> Prepare: chunk, embed, store. Ask: embed the question, find the closest chunks, build the prompt, and the model answers.

**Q2.** 为什么"退款"能搜到"把钱退回来"？ Why does "refund" find "give my money back"?

> [!success]- 答案 Answer
> 因为 embedding 表示的是意思，不是字面。意思接近，向量就接近。
> Embeddings capture meaning, not exact words. Similar meaning gives similar vectors.

**Q3.** 查订单号 A123 时，为什么光用向量搜索不够？ Why isn't vector search alone enough for order ID A123?

> [!success]- 答案 Answer
> 向量会把相似的编号看成差不多，找不准具体那个；要配合关键词搜索（混合检索）。
> Vectors treat similar IDs as nearly the same, so they can't pin down the exact one; combine with keyword search (hybrid search).

**Q4.** 什么时候用 RAG，什么时候用工具调用？ When RAG, when tool calling?

> [!success]- 答案 Answer
> 大量、相对静态的文档知识用 RAG；实时数据或执行动作（查余额、下单）用工具调用。
> RAG for large, mostly static document knowledge; tool calling for live data or actions (balances, placing orders).

**Q5.** RAG 和微调怎么选？ RAG or fine-tuning?

> [!success]- 答案 Answer
> 加新事实、要出处、资料常变，用 RAG；改风格、格式或任务行为，才考虑微调。
> New facts, citations, or changing data → RAG. Style, format or task behavior → consider fine-tuning.

**Q6.** RAG 答错了，先查哪里？ A RAG system answers wrong. Where do you look first?

> [!success]- 答案 Answer
> 先查检索：打印 top-k，看对的那段有没有被找回来。大部分错误出在这里。
> Retrieval first: print the top-k and check whether the right chunk came back. Most failures are there.

**Q7.** 为什么我的每日简报现在不需要 RAG？ Why doesn't my daily brief need RAG yet?

> [!success]- 答案 Answer
> 每天的数据少、都是新的，整份放进 prompt 就行。等要从几百篇旧笔记里找内容时再加。
> The daily data is small and fresh, so it fits in the prompt. Add RAG when it needs to search hundreds of old notes.

## 🔗 相关 Related

- ⬅️ 上一课 Previous: [[工具调用 - Lesson 3|第 3 课：工具调用 Lesson 3: Tool Calling]]
- ✍️ [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]: 用标签包住不可信的文档，防提示注入
  Wrap untrusted documents in tags to defend against prompt injection
- ⚡ [[Prompt Caching|提示缓存 Prompt Caching]]: 检索到的段放在缓存前缀之后
  Put retrieved chunks after the cached prefix
- ➡️ 下一课 Next: 第 5 课（待定）
  Lesson 5 (TBD)
