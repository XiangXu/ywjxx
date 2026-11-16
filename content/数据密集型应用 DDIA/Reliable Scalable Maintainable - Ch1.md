---
title: "第 1 章 可靠、可扩展、可维护 Ch1 Reliable, Scalable, Maintainable"
aliases:
  - DDIA 第 1 章
  - DDIA Chapter 1
  - Reliable, Scalable, and Maintainable Applications
  - 可靠性 Reliability
  - 可扩展性 Scalability
  - 可维护性 Maintainability
  - 尾延迟 Tail Latency
  - 扇出 Fan-out
tags:
  - DDIA
  - System-Design
  - Reliability
  - Scalability
  - Interview-Prep
created: 2026-11-16
---

# 🛡️ 第 1 章 可靠、可扩展、可维护 Ch1 Reliable, Scalable, Maintainable

> [!abstract] 一句话总结 One-line summary
> 一个数据系统好不好，看三件事：出错时还能不能正确工作（**可靠**），负载变大时撑不撑得住（**可扩展**），以后别人改起来容不容易（**可维护**）。
> A data system is judged on three things: does it keep working correctly when things go wrong (**reliability**), can it cope as load grows (**scalability**), and can people keep changing it easily (**maintainability**).

> [!tip] 复习方法 Review tip
> 先别往下看，合上这页写下你记得的 3–5 个要点，再对照下面补漏。
> Before reading on, close this page and write down the 3–5 points you remember, then check below.

## 1. 太长不看 TL;DR

- 🧱 **数据密集型 Data-intensive:** 难点是数据的量、复杂度和变化速度，不是 CPU 算力。
  The hard part is the volume, complexity and rate of change of data, not CPU power.
- 🛡️ **可靠性 Reliability:** 容错，不让局部**故障**（fault）变成整体**失效**（failure）。人为配置错误是最常见的宕机原因。
  Fault tolerance: stop a component **fault** from becoming a system **failure**. Operator configuration errors are the leading cause of outages.
- 📈 **可扩展性 Scalability:** 先用**负载参数**描述负载，再用**百分位数**（p50、p99）描述性能，最后选纵向或横向扩展。
  Describe load with **load parameters**, describe performance with **percentiles** (p50, p99), then choose scaling up or out.
- 🔧 **可维护性 Maintainability:** 可运维、简单、可演进。软件的大部分成本在维护，不在开发。
  Operability, simplicity, evolvability. Most software cost is maintenance, not initial development.

## 2. 🎯 数据密集型应用 Data-Intensive Applications

一个应用通常由几块现成的积木拼起来：
An app is usually assembled from standard building blocks:

| 组件 Component                   | 作用 Purpose                                         |
| -------------------------------- | ---------------------------------------------------- |
| 数据库 Database                  | 存数据 Store data                                    |
| 缓存 Cache                       | 记住贵的计算结果，加快读取 Remember expensive results to speed up reads |
| 搜索索引 Search index            | 按关键词查找和过滤 Search and filter by keyword      |
| 流处理 Stream processing         | 异步地给其他进程发消息 Send messages to other processes asynchronously |
| 批处理 Batch processing          | 定期处理大量累积的数据 Periodically crunch large amounts of accumulated data |

把它们用应用代码拼起来，你就造了一个新的**数据系统**，它的可靠性和扩展性由你负责。
Glue them together with application code and you have built a new **data system**, whose reliability and scalability are now your responsibility.

## 3. 🛡️ 可靠性 Reliability

**定义 Definition:** 即使出了问题，系统也能继续正确工作。
The system keeps working correctly even when things go wrong.

- 🔩 **故障与失效 Fault vs failure:** 故障是某个组件偏离规格；失效是整个系统不能给用户提供服务。容错就是不让故障变成失效。
  A fault is one component deviating from its spec; a failure is the whole system no longer serving users. Fault tolerance stops faults from becoming failures.
- 🐒 **主动制造故障 Inject faults on purpose:** 例如 Netflix 的 Chaos Monkey 随机杀进程，确保容错机制一直被真实地测试。
  For example, Netflix's Chaos Monkey kills processes at random so the fault-tolerance machinery is exercised for real.

| 类型 Type     | 例子 Example | 怎么应对 How to handle |
| ------------- | ------------ | ---------------------- |
| 硬件 Hardware | 硬盘坏、断电、网线被拔 Disk dies, power loss, unplugged cable | 冗余：磁盘阵列、双电源、多台机器 Redundancy: RAID, dual power supplies, multiple machines |
| 软件 Software | 软件缺陷让所有节点同时崩溃（如 2012 年的闰秒问题）、依赖变慢、级联故障 A bug crashes every node at once (the 2012 leap-second bug), a dependency slows down, cascading failures | 想清楚假设、充分测试、进程隔离、允许崩溃重启、监控告警 Check assumptions, test thoroughly, isolate processes, allow crash and restart, monitor |
| 人为 Human    | 运维配置写错，是最常见的宕机原因 Operator config errors, the leading cause of outages | 好的接口和抽象、沙箱环境、快速回滚、灰度发布、详细监控 Good APIs and abstractions, sandboxes, quick rollback, gradual rollouts, detailed monitoring |

> [!important] 关键数字 Key number
> 硬盘的平均无故障时间约 10–50 年，所以一个有 1 万块硬盘的集群，平均**每天坏一块**。规模大了，硬件故障就是常态。
> Hard disks have a mean time to failure of about 10–50 years, so a cluster of 10,000 disks should expect **one dead disk per day** on average. At scale, hardware faults are routine.

> [!warning] 软件故障更危险 Software faults are more dangerous
> 硬件故障大多随机、彼此弱相关，一台坏了别的通常还好；软件故障常常是相关的，同一个 bug 会同时打在所有节点上。
> Hardware faults are mostly random and only weakly correlated, so one dead machine rarely takes others with it; software faults are correlated, and the same bug hits every node at once.

**工作联系 At work:** 在金融系统里，可靠性直接关系到钱和合规，比如结算数据丢了就是事故。
In financial systems, reliability is money and compliance: losing settlement data is an incident.

## 4. 📈 可扩展性 Scalability

**定义 Definition:** 负载增长时，系统有办法应对。它不是“可扩展 / 不可扩展”的标签，而是“如果负载涨到 X，我们怎么办”。
The system has ways to cope as load grows. It's not a yes/no label; it's "if load grows to X, what do we do?"

### 4.1 先描述负载 Describe the Load First

用**负载参数**描述负载，比如每秒请求数、读写比例、同时在线人数、缓存命中率。
Describe load with **load parameters**: requests per second, read/write ratio, concurrent users, cache hit rate.

**推特的例子 The Twitter example**（书里最有名的例子 the book's best-known example，2012 年数据 2012 figures）：

- ✍️ **发推 Post tweet:** 平均每秒 4.6k 条，峰值每秒 12k 条。
  On average 4.6k/s, peaking at 12k/s.
- 📰 **读首页时间线 Read home timeline:** 每秒 300k 次，是发推的几十倍。
  About 300k/s, dozens of times the tweet rate.
- 🌊 **难点是扇出 The hard part is fan-out:** 不是发推的量，而是一个人有很多粉丝，一条推要送到很多人的时间线。
  Not the tweet volume, but that one user has many followers, so one tweet must reach many timelines.

| 方案 Approach                     | 做法 How it works | 代价 Cost |
| --------------------------------- | ----------------- | --------- |
| ① 读时合并 Merge on read          | 读时间线时查出所有关注者的推，再合并排序 On read, query every followed user's tweets and merge them | 写便宜，读贵 Cheap writes, expensive reads |
| ② 写时扇出 Fan-out on write       | 发推时把推塞进每个粉丝的时间线缓存 On post, push the tweet into each follower's timeline cache | 读便宜，写贵 Cheap reads, expensive writes |

读时间线的次数比发推多将近两个数量级，所以推特改用方案 ②。但名人有几千万粉丝，一条推要写几千万次，所以名人的推仍用方案 ①，最终是**混合方案**。
Timeline reads outnumber tweets by almost two orders of magnitude, so Twitter moved to approach ②. But a celebrity tweet would mean tens of millions of writes, so celebrity tweets still use approach ①: a **hybrid**.

> [!important] 关键点 Key point
> 决定架构的是**每个用户粉丝数的分布**，不只是平均值。面试里先问清楚读写比和数据分布，再选方案。
> The **distribution of followers per user**, not just the average, drove the architecture. In an interview, ask about the read/write ratio and the data distribution before choosing a design.

### 4.2 再描述性能 Then Describe Performance

- 🚚 **吞吐量 Throughput:** 每秒处理多少条记录，批处理系统关心它。
  Records processed per second; batch systems care about this.
- ⏱️ **响应时间 Response time:** 客户端从发请求到收到响应等了多久，在线服务关心它。
  How long the client waits from sending a request to getting the response; online services care about this.
- 📊 **响应时间是分布 Response time is a distribution:** 同样的请求，每次快慢都不一样，所以不能只看一个数。
  The same request varies every time, so one number isn't enough.

**用百分位数，别用平均值 Use percentiles, not the mean:** 平均值会掩盖慢请求，也不能告诉你有多少用户真的等了这么久。
The mean hides slow requests and doesn't tell you how many users actually waited that long.

- 🎯 **中位数 p50 Median p50:** 一半请求比它快，代表典型用户的体验。
  Half of requests are faster; it's the typical user's experience.
- 🐢 **尾延迟 p95 / p99 / p999 Tail latency p95 / p99 / p999:** 最慢的 5%、1%、0.1% 的请求。
  The slowest 5%, 1% and 0.1% of requests.
- 💰 **为什么关心尾延迟 Why tail latency matters:** 最慢的请求往往来自数据最多的客户，也就是最值钱的客户。亚马逊用 p999 定内部服务的响应时间要求。
  The slowest requests often belong to customers with the most data, who are the most valuable. Amazon sets internal service response-time requirements at p999.
- 📉 **尾延迟放大 Tail latency amplification:** 一个用户请求要并行调 10 个后端服务，只要其中一个慢，整个请求就慢。调用越多，碰上慢调用的概率越大。
  If one user request calls 10 backend services in parallel, it's slow whenever any one of them is. The more calls, the more likely one is slow.
- 🚧 **队头阻塞 Head-of-line blocking:** 几个慢请求堵在队列前面，后面的快请求也跟着等，所以要在客户端测响应时间。
  A few slow requests at the front of a queue hold up the fast ones behind them, so measure response time on the client side.

> [!example] 尾延迟放大有多严重 How bad amplification gets
> 每个后端调用有 1% 的概率超过 p99。一个请求扇出到 100 个调用时，至少碰上一个慢调用的概率约为 63%。
> Each backend call has a 1% chance of exceeding p99. With 100 calls per request, the chance of hitting at least one slow call is about 63% (1 − 0.99¹⁰⁰).

### 4.3 怎么应对负载 How to Cope with Load

| 方式 Approach                 | 做法 How | 取舍 Trade-off |
| ----------------------------- | -------- | -------------- |
| 纵向扩展 Scale up             | 换更强的机器 Move to a bigger machine | 简单，但有上限，越往上越贵 Simple, but there's a ceiling and cost grows fast |
| 横向扩展 Scale out            | 加更多机器，无共享架构 Add machines, shared-nothing | 能扩很大，但分布式系统更复杂 Scales far, but distributed systems are more complex |
| 弹性伸缩 Elastic              | 负载上来时自动加机器 Add machines automatically as load rises | 适合负载难预测的场景 Good when load is unpredictable |

- 🪶 **无状态好扩展 Stateless is easy:** 无状态服务加机器就行；**有状态的数据库**横向扩展难得多，所以传统做法是数据库先纵向扩展，直到不得不分布式。
  Stateless services scale by adding machines; **stateful databases** are much harder to scale out, so the traditional approach was to scale the database up until forced to distribute it.
- 🧩 **没有万能架构 No one-size-fits-all:** 先弄清哪些操作常见、哪些少见（即负载参数），再设计。
  Know which operations are common and which are rare (the load parameters), then design.

## 5. 🔧 可维护性 Maintainability

软件的大部分成本不在开发，而在**之后的维护**：修 bug、改需求、适配新平台、还技术债。
Most software cost is not building it but **maintaining it afterwards**: fixing bugs, changing features, adapting to new platforms, paying down tech debt.

| 原则 Principle         | 含义 Meaning | 手段 How |
| ---------------------- | ------------ | -------- |
| 可运维 Operability     | 让运维团队容易让系统平稳运行 Easy for operations to keep the system running smoothly | 好的监控、文档、合理默认值、自动化，不依赖单台机器 Good monitoring, docs, sensible defaults, automation, no dependence on a single machine |
| 简单 Simplicity        | 去掉**意外复杂度**，即实现方式带来的、而非问题本身的复杂度 Remove **accidental complexity**, which comes from the implementation rather than the problem | 好的**抽象**，比如 SQL 隐藏了磁盘结构和并发细节 Good **abstractions**; SQL, for example, hides on-disk structures and concurrency |
| 可演进 Evolvability    | 让以后改起来容易，因为需求一定会变 Make future change easy, since requirements will change | 保持简单、好的抽象、敏捷实践如重构和测试驱动开发 Keep it simple, use good abstractions, and agile practices such as refactoring and TDD |

**工作联系 At work:** 在一个十几年的 Java 加 Oracle 老系统里，最痛的往往不是性能，而是“没人敢改的老代码”，这就是可维护性差。
In a decade-old Java and Oracle system, the biggest pain is often not performance but "old code nobody dares to touch". That's poor maintainability.

> [!tip] 面试用法 Interview use
> 系统设计面试开头讲非功能需求（可用性、p99 延迟、扩展性）时，直接用这一章的词：负载参数、读写比、扇出、p99、纵向与横向扩展。
> When stating non-functional requirements at the start of a design interview (availability, p99 latency, scalability), use this chapter's vocabulary: load parameters, read/write ratio, fan-out, p99, scaling up vs out.

## 6. ⚠️ 对原文笔记的澄清 Clarifications to the Source Notes

- **响应时间与延迟 Response time vs latency:** 书里区分了这两个词。响应时间是客户端看到的总时间（含网络和排队）；延迟是请求等待被处理的时间。日常常混用，面试里说清楚更好。
  The book separates the two. Response time is the total the client sees (including network and queueing); latency is how long a request waits to be handled. They're often used interchangeably, but saying it precisely helps in an interview.
- **“硬件故障彼此独立” "Hardware faults are independent":** 书里说的是**弱相关**，不是完全独立，同一机架的机器可能因为温度或电源一起出问题。
  The book says **weakly correlated**, not fully independent: machines in one rack can fail together from heat or power problems.
- **“读比写多两个数量级” "Reads outnumber writes by two orders of magnitude":** 300k 对 4.6k 约是 65 倍，书里的说法是“将近”两个数量级。
  300k vs 4.6k is about 65×; the book says "almost" two orders of magnitude.
- **“亚马逊用 p999 定 SLA” "Amazon sets SLAs on p999":** 书里说的是亚马逊内部服务的响应时间要求用 p999 描述，不是对外的 SLA。
  The book says Amazon describes response-time requirements for internal services at p999, not external customer SLAs.
- **推特的数据 The Twitter numbers:** 都是 2012 年的数据，用来说明思路，不代表今天的规模或架构。
  They're from 2012 and illustrate the reasoning, not today's scale or architecture.
- **版本 Edition:** 这些笔记按第 1 版。第 2 版（2025 年）重新组织了开头几章，例如把非功能需求单独成章。
  These notes follow the 1st edition. The 2nd edition (2025) reorganizes the opening chapters, for example giving nonfunctional requirements a chapter of their own.

## 7. 🧩 复习题 Review Questions

**Q1.** 故障和失效有什么区别？ What's the difference between a fault and a failure?

> [!success]- 答案 Answer
> 故障是某个组件出问题；失效是整个系统不能给用户提供服务。容错就是不让故障变成失效。
> A fault is one component going wrong; a failure is the whole system no longer serving users. Fault tolerance stops faults from becoming failures.

**Q2.** 为什么软件故障比硬件故障更危险？ Why are software faults more dangerous than hardware faults?

> [!success]- 答案 Answer
> 硬件故障大多随机、弱相关，一台坏了别的通常还好；软件 bug 是相关的，会让所有节点同时出问题。
> Hardware faults are mostly random and weakly correlated; a software bug is correlated and hits every node at once.

**Q3.** 推特为什么用混合方案？ Why did Twitter use a hybrid approach?

> [!success]- 答案 Answer
> 读时间线远多于发推，所以大部分用户用写时扇出；名人粉丝太多，写时扇出太贵，所以名人的推改成读时合并。
> Timeline reads vastly outnumber tweets, so most users get fan-out on write; celebrities have too many followers for that, so their tweets are merged on read.

**Q4.** 为什么用 p99 而不是平均响应时间？ Why p99 rather than the mean response time?

> [!success]- 答案 Answer
> 平均值会掩盖慢请求。p99 告诉你最慢 1% 的用户等多久，而他们常常是数据最多、最重要的客户；再加上尾延迟放大，后端的 p99 会决定很多用户请求的体验。
> The mean hides slow requests. p99 shows how long the slowest 1% wait, and they're often the customers with the most data; with tail latency amplification, backend p99 shapes many user requests.

**Q5.** 纵向扩展和横向扩展怎么选？ How do you choose between scaling up and scaling out?

> [!success]- 答案 Answer
> 纵向扩展简单但有上限且贵；横向扩展能扩很大但更复杂。无状态服务容易横向扩展，有状态的数据库难，通常先纵向扩展，实在不够再分布式。实际系统常常两者结合。
> Scaling up is simple but capped and expensive; scaling out goes further but is more complex. Stateless services scale out easily and stateful databases don't, so databases usually scale up until they must be distributed. Real systems often mix both.

**Q6.** 可维护性的三个原则是什么？ What are the three maintainability principles?

> [!success]- 答案 Answer
> 可运维（容易运行）、简单（用抽象去掉意外复杂度）、可演进（以后好改）。
> Operability (easy to run), simplicity (remove accidental complexity with abstraction), evolvability (easy to change later).

## 8. 🔗 相关 Related

- ➡️ 下一章 Next: 第 2 章 数据模型与查询语言 Ch2 Data Models and Query Languages（阅读中 in progress）
- [[Design Requirements|设计需求 Design Requirements]]: 可用性、SLA/SLO、吞吐量与延迟 → availability, SLA/SLO, throughput and latency
- [[Application Architecture|应用架构 Application Architecture]]: 纵向与横向扩展、负载均衡 → scaling up vs out, load balancing
- [[📌 数据密集型应用总览|数据密集型应用总览 DDIA Overview]]
