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
>
> 一句话：RAG = 向量库查资料 + 大模型写答案 + 中间的胶水代码。
> In one line: RAG = a vector DB to look things up + an LLM to write the answer + glue code in between.

## 1. 🎯 是什么 What It Is

模型只知道训练时见过的东西，不知道公司内部文档、昨天的新政策或你的笔记。全部贴进 prompt 又放不下、也太贵。
A model only knows what it saw in training: not your internal docs, yesterday's policy change, or your notes. Pasting everything into the prompt doesn't fit and costs too much.

RAG 只把**和问题相关的那几段**找出来贴进去，相当于给模型一份开卷资料。
RAG pastes in **only the passages related to the question**, like handing the model open-book notes.

| 角色 Role | RAG 世界 RAG world | Java 类比 Java analogy |
| --- | --- | --- |
| 架构模式 Pattern | RAG | MVC |
| 框架 Framework | Spring AI / LangChain | Spring Boot |
| 存储 Storage | 向量库 Vector DB (pgvector, Qdrant) | MySQL |

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
| 嵌入 Embedding | 一串数字（比如 1024 维），意思相近的文字向量也相近，如“pod 重启了”和“容器挂了自动拉起” A list of numbers (say 1,024); similar meanings give nearby vectors, like "the pod restarted" and "the container died and came back" |
| 向量库 Vector DB | 按意思查找的数据库，比如 pgvector 和 Qdrant 等 A database that searches by meaning, such as pgvector or Qdrant |
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
- **元数据 Metadata:** 每块带上来源、章节、团队等字段，用来标出处和按权限过滤。
  Store source, section and team with each chunk, for citations and permission filters.

## 3. 🧭 完整例子：K8s 运维问答 Full Example: K8s Ops Assistant

**背景 Background:** 团队资料散在 Confluence 运维手册、事故复盘和 Git 里的 Helm chart。新人值班遇到告警，不知道该翻哪份；目标是直接提问，拿到带出处的答案。
  Team knowledge is scattered across Confluence runbooks, postmortems, and Helm charts in Git. A new on-call engineer doesn't know which doc to open; the goal is to ask a question and get an answer with sources.

### 3.1 离线建索引 Step 1: Build the Index (Offline)

原始文档是事故复盘 `postmortem-2026-03.md` 的一部分：
Source document, part of `postmortem-2026-03.md`:

```markdown
## Root cause
order-service pods kept getting OOMKilled. The JVM heap was 2G,
but the container memory limit was also 2G, leaving no room for off-heap memory.

## Fix
Raised the limit to 3G and set -XX:MaxRAMPercentage=70.
```

1. 切块：按 `##` 标题切成 2 块，每块带上元数据。
   Chunk: split on `##` headings into 2 chunks, each with metadata.
2. 嵌入：每块变成一个 1024 维向量，比如 `[0.12, -0.53, 0.08, …]`。
   Embed: each chunk becomes a 1,024-dimension vector, e.g. `[0.12, -0.53, 0.08, …]`.
3. 入库：几千份文档切成约 3 万块，存进 pgvector。
   Store: a few thousand docs become about 30,000 chunks in pgvector.

```json
{
  "text": "Root cause: order-service pods kept getting OOMKilled. The JVM heap...",
  "source": "postmortem-2026-03.md",
  "section": "Root cause",
  "team": "backend"
}
```

### 3.2 在线检索 Step 2: Retrieve (Online)

凌晨 3 点，新人问："payment-service 的 pod 一直重启，状态是 OOMKilled，怎么办？"
At 3 a.m., the new engineer asks: "payment-service pods keep restarting with OOMKilled. What do I do?"

| 检索方式 Method | 命中 Hit | 为什么 Why |
| --- | --- | --- |
| 向量检索 Vector search | `postmortem-2026-03.md` | 讲的是另一个服务，但情形很像：Java 服务、内存超限、反复重启 A different service, but the same situation: Java service, OOMKilled, restart loop |
| 关键词检索 BM25 | `runbook-oom.md` | 文中有 OOMKilled 这个词 Contains the exact word "OOMKilled" |
| 噪音 Noise | 调度失败排查 Pod scheduling failures | 沾边但不相关 Related but not useful |

重排序：20 条候选重新打分，只留前 3 条。
Rerank: rescore 20 candidates and keep the top 3.

1. `runbook-oom.md`：通用的内存超限排查步骤
   `runbook-oom.md`: generic OOM troubleshooting steps
2. `postmortem-2026-03.md`：堆大小和容器上限冲突的案例
   `postmortem-2026-03.md`: the heap vs container limit incident
3. `payment-service/values.yaml`：这个服务当前的资源配置
   `payment-service/values.yaml`: this service's current resource settings

### 3.3 拼 Prompt Step 3: Build the Prompt

```
只根据以下资料回答，注明出处。资料中没有的信息请说明。
Answer only from the passages below and cite them. Say so if something isn't covered.

<doc id="1" source="runbook-oom.md">
Run kubectl describe pod and confirm Last State is OOMKilled,
then check actual memory use with kubectl top pod...
</doc>
<doc id="2" source="postmortem-2026-03.md">
order-service kept getting OOMKilled: JVM heap 2G, container limit also 2G...
</doc>
<doc id="3" source="payment-service/values.yaml">
resources.limits.memory: 1Gi
JAVA_OPTS: -Xmx1g
</doc>

问题 Question: payment-service 的 pod 一直重启，状态是 OOMKilled，怎么办？
payment-service pods keep restarting with OOMKilled. What do I do?
```

### 3.4 模型回答 Step 4: The Answer

> [!example] 模型回答 Model answer
> 很可能和 3 月 order-service 的事故是同一个问题：堆设成 `-Xmx1g`，内存上限也是 `1Gi`，堆外内存没有空间 \[2\]\[3\]。
> Most likely the same problem as March's order-service incident: the heap is `-Xmx1g` and the limit is also `1Gi`, leaving no room for off-heap memory \[2\]\[3\].
>
> 1. 先确认：用 `kubectl describe pod` 看上一次退出原因 \[1\]。
>    Confirm: check Last State with `kubectl describe pod` \[1\].
> 2. 临时缓解：把内存上限提到 1.5Gi。
>    Short term: raise the memory limit to 1.5Gi.
> 3. 长期方案：去掉 `-Xmx`，改用 `-XX:MaxRAMPercentage=70`，让堆随上限自动调整 \[2\]。
>    Long term: drop `-Xmx` and use `-XX:MaxRAMPercentage=70` so the heap scales with the limit \[2\].

### 3.5 体现了什么 What This Shows

- **跨文档关联 Cross-document:** 事故复盘和配置文件在两个系统里，RAG 把它们拼到一起。
  The postmortem and the config live in different systems; RAG puts them side by side.
- **语义匹配 Semantic match:** 问的是 payment-service，却找到了 order-service 的事故。
  The question is about payment-service, yet it finds the order-service incident.
- **私有知识 Private knowledge:** 通用模型不可能知道你们的 `values.yaml` 怎么配。
  No general model knows what's in your `values.yaml`.
- **可验证 Verifiable:** 每条建议都有出处，值班的人可以点开原文核对。
  Every suggestion has a source the on-call engineer can open and check.

> [!warning] 不用 RAG 会怎样 Without RAG
> 直接问 Claude，会得到一份正确但泛泛的排查清单。它不知道你们 3 月出过同样的事故，也不知道这个服务的配置。
> Asking Claude directly gives a correct but generic OOM checklist. It doesn't know you had the same incident in March or how this service is configured.

### 3.6 什么时候不用 RAG When Not to Use RAG

| 问题 Question | 更好的办法 Better approach |
| --- | --- |
| 我账户现在多少钱？ What's my balance right now? | 工具调用查实时数据（第 3 课） Tool calling for live data (Lesson 3) |
| 把这封邮件改礼貌点 Make this email more polite | 直接问，不需要外部资料 Just ask; no outside knowledge needed |
| 总结这份 10 页文档 Summarize this 10-page doc | 放得下就整份贴进去 If it fits, paste it whole |
| 每日简报（天气、日程、新闻） My daily brief (weather, calendar, news) | 数据少且每天都是新的，整份放进 prompt 即可 Small, fresh data each day; put it all in the prompt |

> [!important] 适用场景 When RAG fits
> 知识多、问题杂、每次只用其中一小部分。
> Lots of knowledge, varied questions, and each question needs only a small part.

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

## 5. 🚀 部署与成败关键 Deployment & What Makes It Work

| 规模 Scale | 做法 Setup |
| --- | --- |
| 个人项目 Personal | 用 Python、Chroma 和 Claude API，本地就能跑 Runs locally with Python, Chroma and the Claude API |
| 小团队 Small team | 用 Dify、RAGFlow 等现成平台，用 docker-compose 一键启动 Ready-made platforms like Dify or RAGFlow, started with docker-compose |
| 企业 Enterprise | 部署在 K8s 上，见下表 On K8s, see below |

| 组件 Component | K8s 上怎么部署 On K8s |
| --- | --- |
| 检索服务 RAG API | Deployment + HPA |
| 向量库 Vector DB | 复用现有 Postgres 装 pgvector，或单独部署 Qdrant Reuse the existing Postgres with pgvector, or run Qdrant as a StatefulSet |
| 文档同步 Doc sync | 用 CronJob 定时从 Confluence 和 Git 增量拉取 A CronJob pulls incremental changes from Confluence and Git |
| 大模型 LLM | 调用 Claude API，或在 GPU 节点上用 vLLM 自建 Call the Claude API, or self-host with vLLM on GPU nodes |

> [!tip] 成败关键 What decides success
> 难点不在部署，在检索质量：怎么切块、选哪个 embedding 模型、要不要混合检索和重排序。上面的例子如果没找回那份事故复盘，答案就退化成泛泛的通用建议。
> The hard part isn't deployment, it's retrieval quality: how you chunk, which embedding model, whether to add hybrid search and reranking. If the example had missed the postmortem, the answer would fall back to generic advice.

## 6. 🔍 对课程原文的补充与更正 Clarifications to the Lesson Text

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
- **关键词也能命中 Keywords would hit it too:** 原文说找到 order-service 的事故是关键词搜索做不到的。其实复盘里也有 OOMKilled，BM25 也可能命中；向量检索的优势是认出整个情形相似，即使服务名不同。
  The source says keyword search couldn't find the order-service incident. The postmortem also contains "OOMKilled", so BM25 might hit it too; vector search's edge is recognizing the same situation even with a different service name.
- **`-Xmx` 会覆盖百分比 `-Xmx` overrides the percentage:** 同时设了 `-Xmx` 时 `MaxRAMPercentage` 不生效，所以长期方案要先删掉 `-Xmx`。堆外内存还包括元空间、线程栈、直接内存和 JIT 代码缓存。
  If `-Xmx` is also set, `MaxRAMPercentage` is ignored, so the long-term fix must remove `-Xmx` first. Off-heap memory includes metaspace, thread stacks, direct buffers and the JIT code cache.

## 7. ❓ 复习题 Review Questions

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

**Q8.** 在 K8s 例子里，向量检索、关键词检索和重排序各起什么作用？ In the K8s example, what does each of vector search, keyword search and reranking contribute?

> [!success]- 答案 Answer
> 向量检索按情形相似找到别的服务的事故复盘；关键词检索靠 OOMKilled 这个词找到运维手册；重排序从 20 条候选里挑出最有用的 3 条。
> Vector search finds another service's postmortem because the situation is similar; keyword search finds the runbook through the word "OOMKilled"; reranking picks the 3 most useful of 20 candidates.

## 🔗 相关 Related

- ⬅️ 上一课 Previous: [[工具调用 - Lesson 3|第 3 课：工具调用 Lesson 3: Tool Calling]]
- ✍️ [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]: 用标签包住不可信的文档，防提示注入
  Wrap untrusted documents in tags to defend against prompt injection
- ⚡ [[Prompt Caching|提示缓存 Prompt Caching]]: 检索到的段放在缓存前缀之后
  Put retrieved chunks after the cached prefix
- ➡️ 下一课 Next: 第 5 课（待定）
  Lesson 5 (TBD)
