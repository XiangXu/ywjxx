---
title: "API 范式 API Paradigms"
aliases:
  - API 范式
  - API Paradigms
  - REST API
  - RESTful
  - GraphQL
  - gRPC
  - Protocol Buffers
  - 过度获取与获取不足 Over-fetching and Under-fetching
tags:
  - System-Design
  - API
  - Interview-Prep
created: 2026-11-20
---
# 🧩 API 范式 API Paradigms

> [!abstract] 一句话总结 One-line summary
> **REST** 用 URL 表示资源、HTTP 方法表示操作，简单通用；**GraphQL** 让客户端在一个接口里精确声明要哪些字段；**gRPC** 用 Protobuf 二进制和 HTTP/2，适合服务之间的高性能调用。
> **REST** models resources as URLs and actions as HTTP methods, and is simple and universal. **GraphQL** lets the client declare exactly which fields it wants from one endpoint. **gRPC** uses binary Protobuf over HTTP/2 and suits fast service-to-service calls.

## 1. 太长不看 TL;DR

- 🔌 **API:** 客户端和服务器之间约定好的规则：能调用哪些操作、数据用什么格式。
  The agreed rules between a client and a server: which operations can be called and what format the data uses.
- 🧱 **REST:** 资源 + HTTP 方法 + 状态码，**无状态**，通常用 JSON，能直接利用 HTTP 缓存。
  Resources, HTTP methods and status codes; **stateless**; usually JSON; works with HTTP caching out of the box.
- 😖 **REST 的痛点 REST's pain point:** 接口固定，容易**过度获取**（拿到用不上的字段）或**获取不足**（要调好几个接口）。
  Endpoints are fixed, so clients **over-fetch** (get fields they don't need) or **under-fetch** (need several calls).
- 🔍 **GraphQL:** 单一接口，客户端写查询指定字段，响应的形状和查询一致；代价是缓存更难、要防 N+1 和过重的查询。
  One endpoint; the client writes a query naming the fields, and the response mirrors its shape. The cost: harder caching, plus guarding against N+1 lookups and expensive queries.
- ⚡ **gRPC:** 用 `.proto` 定义服务和消息，生成各语言的代码；二进制 + HTTP/2，支持四种流式调用，主要用于**服务之间**通信。
  Services and messages are defined in `.proto` files and code is generated for each language. Binary over HTTP/2, with four call types including streaming; used mainly **between services**.

## 2. 🗺️ 三种范式一览 The Three Paradigms at a Glance

| 维度 Aspect | REST | GraphQL | gRPC |
| --- | --- | --- | --- |
| 核心思想 Core idea | 资源和 HTTP 方法 Resources and HTTP methods | 客户端声明要的数据 Client declares the data it needs | 像调用本地函数一样调用远程方法 Call remote methods like local functions |
| 接口 Endpoints | 每种资源一个 URL One URL per resource | 通常只有一个 `/graphql` 接口 Usually one `/graphql` endpoint | 每个 RPC 方法一个 One per RPC method |
| 数据格式 Format | 通常是 JSON Usually JSON | JSON | Protobuf 二进制 Binary Protobuf |
| 传输 Transport | HTTP/1.1 或 HTTP/2 皆可 Either HTTP/1.1 or HTTP/2 | 通常是 HTTP Usually HTTP | HTTP/2 |
| 契约 Contract | 可选的 OpenAPI 规范 Optional OpenAPI spec | 强类型模式 Strongly typed schema | 强类型 `.proto` 文件 Strongly typed `.proto` file |
| 缓存 Caching | 容易，按 URL 走 HTTP 缓存 Easy, HTTP caching by URL | 较难，需客户端缓存 Harder, needs client-side caching | 无内置 HTTP 缓存 No built-in HTTP caching |
| 流式 Streaming | 不原生支持 Not native | 订阅，通常基于长连接 Subscriptions, often over WebSocket | 原生支持双向流 Native, including bidirectional |
| 典型场景 Best for | 公开 API、通用 Web 服务 Public APIs, general web services | 字段需求多变的前端和移动端 Frontends and mobile apps with varied data needs | 内部微服务、低延迟调用 Internal microservices, low-latency calls |

> [!note] 其他范式 Other patterns
> **SOAP**：基于 XML 的老式协议，规范严格，在银行和企业系统里还很常见。**Webhook**：反过来由服务器在事件发生时回调你提供的 URL（如支付成功通知）。
> **SOAP** is an older XML-based protocol with a strict spec, still common in banking and enterprise systems. A **webhook** reverses the direction: the server calls a URL you registered when an event happens (for example, "payment succeeded").

## 3. 🧱 REST

**REST**（表述性状态转移）是一种架构风格，不是协议或标准。遵守它约束的服务叫 **RESTful**。
**REST** (Representational State Transfer) is an architectural style, not a protocol or standard. A service that follows its constraints is called **RESTful**.

### 3.1 关键约束 Key Constraints

| 约束 Constraint | 含义 Meaning |
| --- | --- |
| 客户端-服务器 Client-server | 两端分离，可以各自独立开发和部署 The two sides are separate and can be built and deployed independently |
| 无状态 Stateless | 每个请求自带全部所需信息，服务器不记住会话状态 Each request carries everything needed; the server keeps no session state |
| 可缓存 Cacheable | 响应要标明能否缓存（`Cache-Control`、`ETag`） Responses say whether they can be cached (`Cache-Control`, `ETag`) |
| 统一接口 Uniform interface | 用 URL 标识资源，用标准方法操作它 URLs identify resources and standard methods act on them |
| 分层系统 Layered system | 中间可以有负载均衡、CDN、网关，客户端无感知 Load balancers, CDNs and gateways can sit in between without the client knowing |

> [!important] 无状态为什么重要 Why statelessness matters
> 服务器不保存会话，任何一台都能处理任何请求，所以加机器就能**水平扩展**，负载均衡也不需要粘性会话。需要“记住”的东西要么由客户端每次带上（如 token、分页参数），要么存到数据库或共享缓存。
> With no session on the server, any instance can handle any request, so you **scale horizontally** by adding machines and the load balancer needs no sticky sessions. Anything that must be "remembered" is either sent by the client every time (a token, pagination parameters) or kept in a database or shared cache.

### 3.2 资源与方法 Resources and Methods

| 操作 Action | 请求 Request | 成功状态码 Success code |
| --- | --- | --- |
| 列出视频 List videos | `GET /videos` | 200 |
| 获取一个视频 Get one video | `GET /videos/42` | 200 |
| 创建视频 Create a video | `POST /videos` | 201 Created |
| 整体替换 Replace | `PUT /videos/42` | 200 / 204 |
| 部分更新 Partial update | `PATCH /videos/42` | 200 / 204 |
| 删除 Delete | `DELETE /videos/42` | 204 No Content |

URL 用**名词复数**表示资源（`/videos`），不要写动词（`/getVideos`）；动作由 HTTP 方法表达。
URLs name resources with **plural nouns** (`/videos`), not verbs (`/getVideos`); the HTTP method carries the action.

`GET`、`PUT`、`DELETE` 是幂等的（重复调用结果相同），`POST` 不是，所以重试 `POST` 要配幂等键（Idempotency-Key）。
`GET`, `PUT` and `DELETE` are idempotent (repeating the call has the same effect), `POST` is not, so retrying a `POST` needs an idempotency key.

### 3.3 分页：无状态的例子 Pagination: Statelessness in Practice

无限滚动加载视频时，服务器不记“这个用户已经看了几条”，而是客户端每次把位置带过来：
For an infinite-scroll video list, the server doesn't remember how many videos a user has seen; the client sends its position every time:

```http
GET /videos?offset=0&limit=10    # 第 1 页 page 1
GET /videos?offset=10&limit=10   # 第 2 页 page 2
```

| 方式 Approach | 优点 Pros | 缺点 Cons |
| --- | --- | --- |
| 偏移量 Offset (`offset`/`limit`) | 简单，可以跳页 Simple, can jump to any page | 深分页慢（数据库要跳过前面的行）；有新数据插入时会重复或漏项 Deep pages are slow (the database skips rows); inserts cause duplicates or gaps |
| 游标 Cursor (`after=<id>`) | 稳定、快，适合动态信息流 Stable and fast, suits live feeds | 不能直接跳到第 N 页 Can't jump straight to page N |

> [!tip] Java 类比 Java analogy
> Spring 的 `@RestController` + `@GetMapping("/videos/{id}")` 就是典型的 REST 接口；`Pageable` 参数对应偏移量分页。
> A Spring `@RestController` with `@GetMapping("/videos/{id}")` is a typical REST endpoint, and a `Pageable` parameter maps to offset pagination.

## 4. 📦 JSON

**JSON** 是文本格式的键值结构，支持嵌套对象和数组，是 REST 和 GraphQL 最常用的数据格式。
**JSON** is a text format of key-value pairs with nested objects and arrays, and the most common data format for REST and GraphQL.

```json
{
  "firstName": "John",
  "isAlive": true,
  "age": 27,
  "address": { "city": "New York", "postalCode": "10021-3100" },
  "phoneNumbers": [{ "type": "home", "number": "212 555-1234" }],
  "children": ["Catherine", "Thomas"],
  "spouse": null
}
```

- **键 Keys:** 必须是双引号字符串，单引号不合法。
  Must be double-quoted strings; single quotes are invalid.
- **值的类型 Value types:** 字符串、数字、布尔、`null`、对象、数组，共六种。上例中 `true`、`27`、`null` 都不加引号。
  Six types: string, number, boolean, `null`, object and array. In the example, `true`, `27` and `null` take no quotes.
- **缺点 Downsides:** 冗长（每条记录都重复键名）、文本解析慢、没有强制的模式。这正是 Protobuf 要解决的问题。
  Verbose (every record repeats the key names), slow to parse as text, and no enforced schema. These are exactly what Protobuf addresses.

## 5. 😖 REST 的问题 The Problems with REST

| 问题 Problem | 含义 Meaning | 例子 Example |
| --- | --- | --- |
| 过度获取 Over-fetching | 返回了用不上的字段，浪费带宽 The response has fields you don't need, wasting bandwidth | 显示评论只要头像和用户名，`/users/1` 却还返回国家、注册日期 Showing a comment needs only avatar and username, but `/users/1` also returns country and join date |
| 获取不足 Under-fetching | 一个接口给的不够，要多次请求 One endpoint isn't enough, so you make several calls | 先拿帖子，再给每条评论分别请求作者信息 Fetch a post, then call once per comment to get each author |

获取不足在移动端特别伤：每多一次往返就多一次网络延迟。常见的 REST 解法是加 `?fields=` 参数或专门给某个页面做聚合接口（BFF），但接口会越来越多。
Under-fetching hurts most on mobile, where every extra round trip adds network latency. Common REST fixes are a `?fields=` parameter or a dedicated aggregate endpoint per screen (Backend for Frontend), but the endpoints multiply.

## 6. 🔍 GraphQL

**GraphQL** 由 Facebook 提出：服务器公开一个强类型的**模式**，客户端在单个请求里写明要哪些字段，服务器按需组装，响应的结构和查询一一对应。
**GraphQL** came from Facebook. The server publishes a strongly typed **schema**, the client names the fields it wants in one request, and the server assembles exactly that, with a response shaped like the query.

```graphql
{
  launchesPast(limit: 10) {
    mission_name
    rocket { rocket_name }
  }
}
```

```json
{
  "data": {
    "launchesPast": [
      { "mission_name": "FalconSat", "rocket": { "rocket_name": "Falcon 1" } }
    ]
  }
}
```

| 操作 Operation | 作用 Purpose | REST 对应 REST equivalent |
| --- | --- | --- |
| 查询 Query | 读数据 Read data | `GET` |
| 变更 Mutation | 写数据 Write data | `POST` / `PUT` / `PATCH` / `DELETE` |
| 订阅 Subscription | 实时推送 Real-time updates | 没有，需要 WebSocket 或 SSE None; needs WebSocket or SSE |

> [!warning] GraphQL 的代价 GraphQL's trade-offs
> - **缓存 Caching:** 所有请求都发到同一个 URL（通常是 POST），HTTP 和 CDN 缓存基本用不上，要靠客户端缓存（如 Apollo）或持久化查询。
>   Every request goes to one URL (usually a POST), so HTTP and CDN caching mostly don't apply; you rely on client caches (such as Apollo) or persisted queries.
> - **N+1 问题 The N+1 problem:** 每个字段由一个解析器取数据，列表里每一项都查一次数据库。用 DataLoader 批量合并。
>   Each field has a resolver, so a list can trigger one database query per item. Batch them with DataLoader.
> - **重查询 Expensive queries:** 客户端能写很深的嵌套查询，要限制深度和复杂度，防止拖垮服务器。
>   Clients can write deeply nested queries, so limit depth and complexity to protect the server.
> - **错误处理 Errors:** 出错时常常仍返回 200，错误放在响应的 `errors` 数组里，监控不能只看状态码。
>   Failures often still return 200 with an `errors` array in the body, so monitoring can't rely on status codes alone.

## 7. ⚡ gRPC

**gRPC** 是 Google 开源的 RPC 框架（官方称 gRPC 是递归缩写，即 gRPC Remote Procedure Calls）。RPC 让程序像调用本地函数一样调用另一台机器上的方法。
**gRPC** is an RPC framework open-sourced by Google (officially a recursive acronym: "gRPC Remote Procedure Calls"; the "g" is also given a different word in each release). RPC lets a program call a method on another machine as if it were a local function.

### 7.1 Protobuf 与服务定义 Protobuf and Service Definitions

```proto
syntax = "proto3";

// 服务定义 Service definition
service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
  rpc SayHelloAgain (HelloRequest) returns (HelloReply) {}
}

// 请求和响应消息 Request and response messages
message HelloRequest {
  string name = 1;   // 1 是字段编号，不是默认值 1 is the field number, not a default
}

message HelloReply {
  string message = 1;
}
```

- **代码生成 Code generation:** 用 `protoc` 编译器从 `.proto` 生成各语言的消息类和客户端/服务端桩代码，两端共享同一份契约。
  The `protoc` compiler generates message classes plus client and server stubs for each language from the `.proto` file, so both sides share one contract.
- **字段编号 Field numbers:** 编码时只传编号不传字段名，所以数据小；已发布的编号不能改也不能复用，新增字段用新编号，这样新旧版本能兼容。
  The wire format carries the number instead of the field name, which keeps messages small. Never change or reuse a published number; add new fields with new numbers so old and new versions stay compatible.

```java
// Java 中生成的类用 Builder 构造 Generated Java classes use a builder
HelloRequest req = HelloRequest.newBuilder().setName("Xiang").build();
HelloReply reply = greeterStub.sayHello(req); // 看起来像本地调用 looks like a local call
```

> [!tip] Java 类比 Java analogy
> `.proto` 里的 `service` 像一个 Java `interface`，生成的桩代码像 Java RMI 或 Feign 客户端：调用方只看到方法，网络细节被隐藏了。
> A `service` in a `.proto` file is like a Java `interface`, and the generated stub is like Java RMI or a Feign client: the caller sees methods while the network details stay hidden.

### 7.2 四种调用方式 Four Call Types

| 类型 Type | 说明 Description | 例子 Example |
| --- | --- | --- |
| 一元 Unary | 一个请求，一个响应 One request, one response | 查询用户 Get a user |
| 服务端流 Server streaming | 一个请求，多个响应 One request, a stream of responses | 推送行情 Price feed |
| 客户端流 Client streaming | 多个请求，一个响应 A stream of requests, one response | 上传日志或文件分片 Upload log or file chunks |
| 双向流 Bidirectional streaming | 两边同时流式收发 Both sides stream at once | 聊天、实时协作 Chat, live collaboration |

### 7.3 为什么快，为什么主要在后端 Why It's Fast, and Why It's Mostly Server-Side

- **快的原因 Why fast:** Protobuf 二进制比 JSON 小且解析快；HTTP/2 在一条 TCP 连接上**多路复用**多个请求，并压缩头部。
  Binary Protobuf is smaller and faster to parse than JSON, and HTTP/2 **multiplexes** many requests over one TCP connection with header compression.
- **浏览器限制 Browser limits:** 浏览器的 API 拿不到 HTTP/2 的底层帧和 trailer，不能直接调 gRPC，要用 gRPC-Web 加代理（如 Envoy）。所以 gRPC 主要用于微服务之间，对外仍常用 REST。
  Browser APIs can't access raw HTTP/2 frames and trailers, so browsers can't call gRPC directly and need gRPC-Web plus a proxy (such as Envoy). That's why gRPC lives mostly between microservices, while public APIs usually stay REST.
- **错误码 Error codes:** gRPC 有自己的一套状态码（`OK`、`NOT_FOUND`、`UNAVAILABLE`、`DEADLINE_EXCEEDED` 等），放在响应的 trailer 里，HTTP 层通常是 200。
  gRPC has its own status codes (`OK`, `NOT_FOUND`, `UNAVAILABLE`, `DEADLINE_EXCEEDED` and others), sent in the response trailers, while the HTTP status is usually 200.
- **其他特性 Other features:** 内置**截止时间**（deadline）和取消，调用链里超时可以层层传递。
  Built-in **deadlines** and cancellation, so a timeout propagates down the call chain.

## 8. 🤔 怎么选 How to Choose

| 场景 Scenario | 推荐 Pick | 理由 Why |
| --- | --- | --- |
| 公开 API、第三方接入 Public or third-party API | REST | 人人都会用，工具多，缓存简单 Everyone knows it, tooling is everywhere, caching is simple |
| 多种前端、页面数据需求各不相同 Many frontends with different data needs | GraphQL | 一次请求拿到刚好需要的数据 One request returns exactly the data each screen needs |
| 内部微服务、高吞吐低延迟 Internal microservices, high throughput and low latency | gRPC | 二进制、强类型契约、流式 Binary, typed contracts, streaming |
| 浏览器实时双向通信 Real-time two-way in the browser | WebSocket | gRPC 双向流浏览器用不了 Browsers can't use gRPC bidirectional streams |

> [!example] 面试里常见的组合 A common interview answer
> 对外用 REST（或给移动端用 GraphQL 网关），网关后面的微服务之间用 gRPC，实时消息用 WebSocket。
> REST at the edge (or a GraphQL gateway for mobile), gRPC between the microservices behind the gateway, and WebSocket for real-time messages.

## 9. ⚠️ 对课程原文的澄清 Clarifications to the Lesson Text

- **全称 Full name:** 原文写成“Representation State Transfer”，正确的全称是 Representational State Transfer。
  The lesson spells it "Representation State Transfer"; the correct name is Representational State Transfer.
- **约束 Constraints:** 原文只讲了客户端-服务器和无状态两条，完整的约束还有可缓存、统一接口、分层系统，以及可选的按需代码。
  The lesson covers only client-server and statelessness; the full set also includes cacheable, uniform interface, layered system, and optional code on demand.
- **无状态 Statelessness:** 原文说无状态就不用管理会话或 cookie。准确地说，是服务器在两次请求之间不保存客户端的会话状态（放在内存还是 Redis 里都算）；客户端仍然可以每次带上 cookie 或 token 来认证。应用数据（用户、订单）当然还存在数据库里。
  The lesson says stateless means no sessions or cookies. More precisely, the server keeps no client session state between requests (in memory or in Redis alike); the client can still send a cookie or token with every request for auth. Application data (users, orders) of course still lives in a database.
- **值的类型 JSON values:** 原文说 JSON 的键和值都用双引号、都是字符串。其实只有键必须是字符串，值可以是数字、布尔、`null`、对象或数组，原文自己的例子里 `true`、`27`、`null` 就没有引号。
  The lesson says JSON keys and values are all double-quoted strings. Only keys must be strings; values can be numbers, booleans, `null`, objects or arrays, and the lesson's own example has unquoted `true`, `27` and `null`.
- **对象数组 Arrays of objects:** 原文说对象里的数组都叫“对象数组”，其实只有元素是对象时才这么叫，`children` 是字符串数组。
  The lesson calls any array in a JSON object an "array of objects", but that only applies when its elements are objects; `children` is an array of strings.
- **请求方法 GraphQL methods:** 原文说 GraphQL 用 POST 接口。通常是 POST，但查询也可以用 GET（便于缓存）。除了查询和变更，还有第三种操作：订阅。
  The lesson says GraphQL uses a POST endpoint. Usually it does, but queries can also use GET (which helps caching). Besides queries and mutations there is a third operation type: subscriptions.
- **服务器推送 Server push:** 原文说 gRPC 像 HTTP/2 一样提供服务器推送。gRPC 用的是 HTTP/2 的流，不是 HTTP/2 的 server push（浏览器已经移除了它），服务器向客户端推数据靠的是服务端流和双向流。
  The lesson says gRPC provides server push like HTTP/2. gRPC uses HTTP/2 streams, not HTTP/2 server push (which browsers have removed); server-to-client data comes from server streaming and bidirectional streaming.
- **错误码 Error codes:** 原文说 gRPC 不用 HTTP 错误码、要自己设计。前半句对，但不用自己设计：gRPC 自带一套标准状态码，还可以附带详细错误信息。
  The lesson says gRPC ignores HTTP error codes, so you build your own. The first half is right, but you don't invent your own: gRPC ships a standard set of status codes and supports attaching error details.
- **性能 Speed:** 原文说 gRPC 比 REST 快得多。通常更快（二进制、HTTP/2、长连接），但快多少取决于负载大小和场景，小请求、低流量时差别不大。
  The lesson says gRPC is much faster than REST. It is usually faster (binary, HTTP/2, persistent connections), but by how much depends on payload size and workload; for small, low-traffic calls the gap is small.
- **Python 示例 The Python example:** 原文的 `import protobuf` 和类写法不是真实代码。实际是 `protoc` 生成 `xxx_pb2.py`，再 `from search_pb2 import SearchRequest` 使用，不用手写类。
  The lesson's `import protobuf` class is not real code. In practice `protoc` generates `xxx_pb2.py` and you use `from search_pb2 import SearchRequest`; you don't hand-write the class.

## 10. 🧩 复习题 Review Questions

**Q1.** REST 的“无状态”是什么意思？为什么有利于扩展？ What does "stateless" mean in REST, and why does it help scaling?

> [!success]- 答案 Answer
> 每个请求自带处理所需的全部信息（认证 token、分页参数等），服务器不保存会话状态。因此任何一台服务器都能处理任何请求，加机器就能水平扩展，负载均衡不需要粘性会话。
> Each request carries everything needed (auth token, pagination parameters, and so on) and the server keeps no session state. Any server can handle any request, so you scale horizontally by adding machines and need no sticky sessions.

**Q2.** 什么是过度获取和获取不足？GraphQL 怎么解决？ What are over-fetching and under-fetching, and how does GraphQL solve them?

> [!success]- 答案 Answer
> 过度获取是接口返回了用不上的字段；获取不足是一个接口不够，要调多次。GraphQL 让客户端在一次查询里精确列出需要的字段，并能顺着关联对象一起取回。
> Over-fetching is getting fields you don't need; under-fetching is needing several calls because one endpoint isn't enough. GraphQL lets the client list exactly the fields it needs in one query, following related objects in the same request.

**Q3.** GraphQL 有哪些缺点？ What are GraphQL's downsides?

> [!success]- 答案 Answer
> 单一接口让 HTTP/CDN 缓存难用；解析器容易产生 N+1 查询（用 DataLoader 批量）；客户端可能发出很深的查询（需限制深度和复杂度）；错误常以 200 返回，监控更麻烦；服务端实现也比 REST 复杂。
> One endpoint makes HTTP/CDN caching hard; resolvers easily cause N+1 queries (batch with DataLoader); clients can send very deep queries (limit depth and complexity); errors often come back as 200, which complicates monitoring; and the server side is more complex than REST.

**Q4.** gRPC 为什么比 REST + JSON 快？为什么浏览器很少直接用它？ Why is gRPC faster than REST with JSON, and why do browsers rarely use it directly?

> [!success]- 答案 Answer
> Protobuf 是二进制，传字段编号而不是字段名，体积小、解析快；HTTP/2 多路复用和头部压缩减少了连接和头部开销。浏览器 API 拿不到 HTTP/2 的 trailer 等底层细节，必须经 gRPC-Web 和代理转换，所以 gRPC 多用于服务之间。
> Protobuf is binary and sends field numbers instead of names, so it's small and fast to parse; HTTP/2 multiplexing and header compression cut connection and header overhead. Browser APIs can't reach low-level HTTP/2 details such as trailers, so browsers need gRPC-Web plus a proxy, which is why gRPC is mostly used between services.

**Q5.** Protobuf 消息里的 `= 1` 是什么？改动时要注意什么？ What is `= 1` in a Protobuf message, and what should you watch when changing it?

> [!success]- 答案 Answer
> 那是字段编号，用来在二进制里标识字段。已发布的编号不能修改或复用（删除的字段用 `reserved` 保留），新字段用新编号，这样新旧客户端和服务端才能互相兼容。
> It is the field number that identifies the field in the binary encoding. Never change or reuse a published number (mark removed ones `reserved`), and give new fields new numbers so old and new clients and servers stay compatible.

**Q6.** 设计一个视频网站，对外 API 和内部服务分别用什么？ For a video site, what would you use for the public API and for internal services?

> [!success]- 答案 Answer
> 对外用 REST（通用、可缓存，例如 `GET /videos?cursor=...` 游标分页），移动端字段需求复杂时可以加 GraphQL 网关；内部微服务之间用 gRPC；评论和通知的实时推送用 WebSocket 或 SSE。
> REST for the public API (universal and cacheable, for example `GET /videos?cursor=...` with cursor pagination), optionally a GraphQL gateway if mobile data needs are complex; gRPC between internal microservices; WebSocket or SSE for real-time comments and notifications.

**Q7.** 用自己的话写 3 到 5 行，对比 REST、GraphQL 和 gRPC 各自适合什么场景。 In 3 to 5 lines of your own words, compare where REST, GraphQL and gRPC each fit best.

> [!success]- 答案 Answer
> - **REST:** 默认选择，适合公开 API 和通用 Web 服务；简单、人人都懂、能直接用 HTTP 缓存，但接口固定，容易多取或少取数据。
>   The default choice for public APIs and general web services: simple, widely understood and HTTP-cacheable, but fixed endpoints lead to over- or under-fetching.
> - **GraphQL:** 适合多种前端（网页、移动端）数据需求各不相同的产品；一次请求精确拿到所需字段，代价是缓存难、服务端更复杂。
>   Fits products whose frontends (web, mobile) need different data: one request gets exactly the needed fields, at the cost of harder caching and a more complex server.
> - **gRPC:** 适合内部微服务之间的高性能调用；二进制 Protobuf、HTTP/2、强类型契约和流式调用，但浏览器不能直接用。
>   Fits high-performance calls between internal microservices: binary Protobuf, HTTP/2, typed contracts and streaming, but browsers can't call it directly.
> - **一句话 In one line:** 对外用 REST，前端聚合用 GraphQL，内部服务用 gRPC。
>   REST at the edge, GraphQL for frontend aggregation, gRPC inside.

## 11. 🔗 相关 Related

- ⬅️ 上一篇 Previous: [[WebSocket|网络套接字协议 WebSocket]]
- [[HTTP|超文本传输协议 HTTP]]
- [[Application Architecture|应用架构 Application Architecture]]
- [[📌 系统设计总览|系统设计总览 System Design Overview]]
