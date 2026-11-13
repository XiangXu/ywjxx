---
title: "超文本传输协议 HTTP"
aliases:
  - 超文本传输协议
  - HTTP
  - HTTPS
  - HTTP 方法 HTTP Methods
  - HTTP 状态码 HTTP Status Codes
  - 客户端-服务器模型 Client-Server Model
  - 远程过程调用 RPC
  - TLS
tags:
  - System-Design
  - Networking
  - Interview-Prep
created: 2026-11-13
---
# 🌍 HTTP

> [!abstract] 一句话总结 One-line summary
> **HTTP** 是通常建立在 TCP 之上的请求/响应协议：客户端发请求（方法 + URL + 头 + 可选的正文），服务器返回状态码、头和正文。**HTTPS** 就是加了 TLS 加密的 HTTP。
> **HTTP** is a request/response protocol that usually runs on top of TCP: the client sends a request (method + URL + headers + optional body), and the server returns a status code, headers, and a body. **HTTPS** is simply HTTP with TLS encryption.

## 1. 太长不看 TL;DR

- 🙋 **客户端与服务器 Client and server:** 客户端发起请求（调用方），服务器响应（被调用方）。同一台机器可以同时扮演两种角色。
  The client starts the request (the caller) and the server responds (the callee). One machine can play both roles.
- 📞 **RPC:** 调用远程机器上的函数，看起来像本地调用。
  Calling a function on another machine as if it were a local call.
- 🧱 **分层 Layering:** HTTP 在 TCP 之上，TCP 在 IP 之上。HTTP/3 例外，它改用基于 UDP 的 QUIC。
  HTTP sits on TCP, which sits on IP. HTTP/3 is the exception: it uses QUIC over UDP instead.
- 🔧 **方法 Methods:** GET 读取，POST 创建，PUT 整体替换（更新），DELETE 删除。
  GET reads, POST creates, PUT replaces (updates), and DELETE deletes.
- 🚦 **状态码 Status codes:** 2xx 成功，3xx 重定向，4xx 客户端错，5xx 服务器错。
  2xx is success, 3xx redirection, 4xx client error, and 5xx server error.
- 🔒 **HTTPS:** HTTP 加 TLS，防止中间人偷看或篡改。系统设计里我们只需要知道这个层面。
  HTTP plus TLS, which stops a man in the middle from reading or changing traffic. That level of detail is enough for system design.

## 2. 🤝 客户端-服务器模型与远程过程调用 Client-Server Model and RPC

| 角色 Role | 是什么 What it is | 例子 Example |
| --- | --- | --- |
| 客户端 Client | 访问服务的应用或设备，通常由它**发起**通信 An app or device that uses a service, and usually **starts** the conversation | 浏览器、手机 App、邮件软件 A browser, a phone app, an email client |
| 服务器 Server | 等待请求并提供资源或服务的机器或程序 A machine or program that waits for requests and provides resources or services | Web 服务器、邮件服务器、数据库服务器 A web server, a mail server, a database server |

- **角色是相对的 Roles are relative:** 浏览器请求 `google.com` 时，Google 的服务器可能又去请求第三方服务，这时它就是客户端。纯 P2P 网络里的每个节点同时是客户端和服务器。
  When a browser requests `google.com`, Google's server may in turn call a third-party service, and then it is the client. In a pure P2P network, every node is both client and server.
- **RPC（远程过程调用） RPC (remote procedure call):** 让程序调用另一台机器上的函数。在 YouTube 搜索时，`listVideos('neetcode')` 看似在浏览器里执行，其实代码在 YouTube 的服务器上，浏览器通过网络调用它。
  Lets a program run a function on another machine. When searching on YouTube, `listVideos('neetcode')` looks like it runs in the browser, but the code lives on YouTube's servers and the browser calls it over the network.

> [!tip] Java 类比 Java analogy
> RPC 好比调用一个接口方法，实现却在远程：Java RMI 和 gRPC 的客户端存根（stub）都是这个思路。区别在于远程调用会失败、会变慢，所以要处理超时和重试。
> RPC is like calling an interface method whose implementation is remote: the client stubs in Java RMI and gRPC work this way. The difference is that a remote call can fail or be slow, so you must handle timeouts and retries.

## 3. 🔬 HTTP 的位置与请求结构 Where HTTP Sits and Anatomy of a Request

IP 负责把数据包送到目的地（不保证顺序），TCP 保证按序可靠送达，HTTP 再在它之上定义“数据怎么格式化、服务器和浏览器怎么响应”。见 [[Networking Basics|网络基础 Networking Basics]] 和 [[TCP and UDP|TCP 与 UDP 协议 TCP and UDP]]。
IP delivers packets to the destination (with no ordering guarantee), TCP makes delivery reliable and in order, and HTTP, on top, defines how data is formatted and how servers and browsers respond. See [[Networking Basics|网络基础 Networking Basics]] and [[TCP and UDP|TCP 与 UDP 协议 TCP and UDP]].

```http
GET /results?search_query=neetcode HTTP/1.1
Host: www.youtube.com
Accept: text/html

HTTP/1.1 200 OK
Content-Type: text/html
Cache-Control: private, max-age=0
Set-Cookie: session=abc123; Secure; HttpOnly

<!doctype html>...
```

| 部分 Part | 作用 What it does |
| --- | --- |
| 方法 Method | 想对资源做什么：GET、POST、PUT、DELETE What to do with the resource: GET, POST, PUT, DELETE |
| URL | 往哪里请求，包含路径 `/results` 和查询参数 `?search_query=neetcode`，见 [[DNS and URLs\|域名系统与 URL 基础 DNS and URLs]] Where to send it, including the path `/results` and the query `?search_query=neetcode`; see [[DNS and URLs\|域名系统与 URL 基础 DNS and URLs]] |
| 请求头 Request headers | 附加信息，如 `Accept`（能接受的数据类型）和 `Host` Extra information, such as `Accept` (the data types the client can take) and `Host` |
| 响应头 Response headers | 关于响应的信息：`Content-Type`、`Cache-Control`（缓存策略）、`Set-Cookie` Information about the response: `Content-Type`, `Cache-Control` (caching rules), `Set-Cookie` |
| 正文 Body | POST 和 PUT 携带要发送的数据（载荷），GET 通常没有 POST and PUT carry the data to send (the payload); GET usually has none |

## 4. 🔧 HTTP 方法 HTTP Methods

| 方法 Method | 作用 Purpose | 幂等 Idempotent | 正文 Body |
| --- | --- | --- | --- |
| GET | 读取资源 Retrieve a resource | ✅ | 无 No |
| POST | 提交数据，通常用来创建资源 Submit data, usually to create a resource | ❌ | 有 Yes |
| PUT | 用提供的数据整体替换资源 Replace a resource with the data provided | ✅ | 有 Yes |
| PATCH | 只修改资源的部分字段 Change only some fields of a resource | 不一定 Not necessarily | 有 Yes |
| DELETE | 删除资源 Delete a resource | ✅ | 通常无 Usually no |

**幂等 Idempotent** 的意思是：同一个请求重复发送多次，对服务器状态的影响和发送一次一样。
**Idempotent** means that sending the same request several times has the same effect on the server's state as sending it once.

- **PUT:** 用同一个值把用户邮箱更新十次，结果还是那个邮箱。
  Updating a user's email to the same value ten times still leaves that email.
- **DELETE:** 第一次可能返回 200，之后返回 404，响应不同，但服务器状态一样（资源已经没了）。
  The first call may return 200 and later ones 404; the responses differ, but the server's state is the same (the resource is gone).
- **POST:** 每次都可能新建一条记录，所以重复提交会创建重复数据。支付和下单要用**幂等键**防止重复。
  Each call may create a new record, so a retry can create duplicates. Payments and orders use an **idempotency key** to prevent that.

> [!tip] Java 类比 Java analogy
> 幂等像 `Set.add(x)`：加十次和加一次结果一样；POST 像 `List.add(x)`：每次都多一个元素。
> Idempotence is like `Set.add(x)`: adding ten times equals adding once. POST is like `List.add(x)`: every call adds another element.

## 5. 🚦 状态码 Status Codes

状态码告诉客户端请求的结果，按第一位数字分类：
Status codes tell the client how the request went, grouped by the first digit:

| 范围 Range | 含义 Meaning | 常见代码 Common codes |
| --- | --- | --- |
| 1xx | 信息 Informational | 100 Continue, 101 Switching Protocols（例如升级到 WebSocket 协议 e.g. upgrading to WebSocket） |
| 2xx | 成功 Success | 200 OK, 201 Created（已创建新资源 a new resource was created） |
| 3xx | 重定向 Redirection | 301 Moved Permanently（永久搬家 moved for good）, 302 Found（临时跳转 a temporary redirect） |
| 4xx | 客户端错误 Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | 服务器错误 Server error | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

## 6. 🔒 HTTPS、TLS 与 HSTS 安全传输 HTTPS, TLS, and HSTS

- **问题 The problem:** 普通 HTTP 是明文，网络路径上的任何人都能看到和修改，这就是**中间人攻击（MITM）**。
  Plain HTTP is clear text: anyone along the path can read and change it. That is a **man-in-the-middle (MITM) attack**.
- **解决办法 The fix:** **TLS** 提供加密、完整性校验和服务器身份认证。HTTPS 就是在 TLS 之上运行的 HTTP。**SSL** 是 TLS 的前身，已经过时，只是名字还常被混用。
  **TLS** provides encryption, integrity checks, and server authentication. HTTPS is HTTP running over TLS. **SSL** is TLS's outdated predecessor, though the name is still used loosely.
- **HSTS:** 服务器通过 `Strict-Transport-Security` 响应头告诉浏览器“以后只用 HTTPS”，浏览器会自动把之后的 `http://` 请求升级成 `https://`。这是输入 `http://youtube.com` 会直接跳到 HTTPS 的原因之一。
  A server uses the `Strict-Transport-Security` response header to tell the browser "use only HTTPS from now on", and the browser upgrades later `http://` requests to `https://` by itself. That is one reason typing `http://youtube.com` lands on HTTPS.

## 7. ⚠️ 对课程原文的澄清 Clarifications to the Lesson Text

- **“GET 总是返回相同结果” "A GET always returns the same result":** 幂等说的是对服务器**状态**没有额外影响，不是响应永远一样，页面内容完全可以变。GET 还应该是**安全**的，即不修改数据。
  Idempotence is about having no extra effect on the server's **state**, not about identical responses: the page content can change. A GET should also be **safe**, meaning it doesn't modify data.
- **“POST 的载荷不放在 URL 里是为了防中间人攻击” "The payload stays out of the URL to prevent MITM attacks":** 防中间人靠的是 HTTPS。不把敏感数据放在 URL 里，是因为 URL 会被浏览器历史、服务器日志和 `Referer` 头记录下来。
  HTTPS is what stops MITM attacks. Sensitive data stays out of URLs because URLs end up in browser history, server logs, and the `Referer` header.
- **“PUT 用于更新” "PUT is for updating":** PUT 是用请求里的数据**整体替换**资源，只改部分字段应该用 PATCH。资源不存在时，PUT 也可以创建它；无论存在与否，结果状态都是请求里的那份数据，所以幂等。
  PUT **replaces** the whole resource with the data in the request; changing only some fields calls for PATCH. If the resource doesn't exist, PUT may create it; either way the end state is the data in the request, which is why it is idempotent.
- **“没有权限删除视频返回 401” "Deleting a video you aren't allowed to delete returns 401":** 401 表示**未认证**（没登录或凭证无效）。已登录但没有权限应该返回 **403 Forbidden**。
  401 means **unauthenticated** (not logged in or bad credentials). If you are logged in but not allowed, the right code is **403 Forbidden**.
- **“201 通常在 POST 或 PUT 之后” "201 comes after POST or PUT":** 创建成功时才返回 201，PUT 只是更新已有资源时，返回 200 或 204 更合适。
  201 is for a successful creation. When a PUT merely updates an existing resource, 200 or 204 fits better.
- **“HSTS 保证所有请求都升级” "HSTS upgrades every request":** 浏览器必须先通过 HTTPS 收到一次 HSTS 头才会生效，第一次访问仍可能走明文。浏览器内置的 HSTS 预加载列表可以补上这个缺口。
  The browser must first receive the HSTS header over HTTPS, so the very first visit can still go out in clear text. The browsers' built-in HSTS preload list closes that gap.

## 8. 🧩 复习题 Review Questions

**Q1.** 为什么 PUT 和 DELETE 是幂等的，而 POST 不是？ Why are PUT and DELETE idempotent but POST is not?

> [!success]- 答案 Answer
> 重复 PUT 会把资源设成同一个状态；重复 DELETE 之后资源都是“已删除”（即使响应从 200 变成 404）。重复 POST 通常每次都创建一个新资源，状态会不断变化。
> Repeating a PUT sets the resource to the same state, and after repeated DELETEs the resource is simply gone (even if the response changes from 200 to 404). Repeating a POST usually creates a new resource each time, so the state keeps changing.

**Q2.** 状态码 401 和 403 有什么区别？ What is the difference between 401 and 403?

> [!success]- 答案 Answer
> 401 是“你是谁我不知道”（没登录或凭证无效），登录后可以重试；403 是“我知道你是谁，但你没有权限”，重新登录也没用。
> 401 means "I don't know who you are" (not logged in or bad credentials), and logging in may fix it. 403 means "I know who you are, but you aren't allowed", and logging in again won't help.

**Q3.** 输入 `http://youtube.com` 为什么会自动变成 HTTPS？ Why does typing `http://youtube.com` end up on HTTPS?

> [!success]- 答案 Answer
> 浏览器记住了该站点的 HSTS 策略（或它在预加载列表里），于是在发请求之前就把 `http://` 升级成 `https://`。现代浏览器也会默认先尝试 HTTPS。没有 HSTS 时，也可能是服务器用 301 把你重定向到 HTTPS。
> The browser remembers the site's HSTS policy (or finds it on the preload list) and upgrades `http://` to `https://` before sending anything. Modern browsers also try HTTPS first by default. Without HSTS, the server may instead redirect you to HTTPS with a 301.

**Q4.** 敏感数据（如密码）为什么不能放在 GET 的查询参数里？ Why shouldn't sensitive data like a password go in a GET query string?

> [!success]- 答案 Answer
> URL 会被保存在浏览器历史、服务器、CDN 和反向代理的日志里，还可能通过 `Referer` 头泄露给其他网站。应该放在 POST 的正文里，并且全程使用 HTTPS。
> URLs are saved in browser history and in server, CDN, and reverse-proxy logs, and can leak to other sites through the `Referer` header. Put such data in a POST body, and use HTTPS throughout.

## 9. 🔗 相关 Related

- ⬅️ 上一篇 Previous: [[DNS and URLs|域名系统与 URL 基础 DNS and URLs]]
- ➡️ 下一篇 Next: [[WebSocket|网络套接字协议 WebSocket]]
- [[TCP and UDP|TCP 与 UDP 协议 TCP and UDP]]
- [[Networking Basics|网络基础 Networking Basics]]
- [[📌 系统设计总览|系统设计总览 System Design Overview]]
