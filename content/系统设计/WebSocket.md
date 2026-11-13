---
title: "网络套接字协议 WebSocket"
aliases:
  - 网络套接字协议
  - WebSocket
  - WebSockets
  - WSS
  - 轮询 Polling
  - 长轮询 Long Polling
  - 服务器推送事件 Server-Sent Events
tags:
  - System-Design
  - Networking
  - Interview-Prep
created: 2026-11-13
---
# 🔌 WebSocket

> [!abstract] 一句话总结 One-line summary
> **WebSocket** 先用一次 HTTP 请求升级协议，之后在同一条 TCP 连接上让客户端和服务器随时互相推送消息，适合聊天、直播弹幕、实时游戏这类实时场景。
> **WebSocket** upgrades a plain HTTP request once, and then lets the client and server push messages to each other at any time over the same TCP connection. It fits real-time cases such as chat, live-stream comments, and online games.

## 1. 太长不看 TL;DR

- 🐌 **HTTP 的问题 The HTTP problem:** 请求-响应是单向的，服务器不能主动推送，客户端只能靠**轮询**反复询问。
  Request-response is one-way: the server can't push, so the client has to keep asking by **polling**.
- ⚖️ **轮询的两难 The polling dilemma:** 间隔太长消息延迟，间隔太短请求太多、白白浪费服务器资源。
  A long interval delays messages; a short one floods the server with requests that mostly return nothing.
- 🔄 **WebSocket:** 通过 HTTP `Upgrade` 握手，服务器返回 **101**，之后是持久的**全双工**连接。
  It starts with an HTTP `Upgrade` handshake, the server answers **101**, and from then on the connection is persistent and **full duplex**.
- 🚪 **端口 Ports:** `ws://` 默认 80，`wss://`（TLS 加密）默认 443。
  `ws://` defaults to port 80, and `wss://` (TLS encrypted) to 443.
- 🧰 **代价 The cost:** 连接是有状态的、长期占用资源，扩展和负载均衡比无状态 HTTP 更难。
  The connection is stateful and long-lived, so scaling and load balancing are harder than with stateless HTTP.

## 2. 😩 问题：用 HTTP 做聊天 The Problem: Chat over HTTP

HTTP 适合无状态数据：客户端请求页面，服务器返回页面。聊天室要的是**实时**，服务器必须能在新消息到来时立刻通知客户端。
HTTP suits stateless data: the client asks for a page and the server returns it. A chat room needs **real time**: the server must tell the client the moment a new message arrives.

| 方案 Approach | 做法 How it works | 缺点 Drawback |
| --- | --- | --- |
| 短轮询 Short polling | 客户端每隔 N 秒发一次请求 The client sends a request every N seconds | 延迟最多 N 秒；大多数请求返回空 Up to N seconds of delay; most requests return nothing |
| 长轮询 Long polling | 服务器把请求挂起，有新消息才响应，客户端收到后立刻再发一个 The server holds the request open and replies only when there is news; the client immediately sends another | 每条消息仍要一次完整的 HTTP 往返，请求头开销大 Every message still costs a full HTTP round trip with headers |
| 服务器推送事件 Server-Sent Events (SSE) | 一条 HTTP 长连接，服务器单向推送文本 One long-lived HTTP connection with one-way text pushes from the server | 只能服务器到客户端 Server-to-client only |
| WebSocket | 一条持久的双向连接 One persistent two-way connection | 有状态，需要管理连接 Stateful, so connections need managing |

## 3. 🤝 建立连接 Establishing a Connection

WebSocket 从一个普通的 HTTP 请求开始，双方都支持时才“升级”：
WebSocket starts as an ordinary HTTP request and is "upgraded" only if both sides support it:

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

1. **握手请求 Handshake request:** 客户端发出带 `Upgrade: websocket` 等头的 HTTP 请求。
   The client sends an HTTP request with `Upgrade: websocket` and a few special headers.
2. **握手响应 Handshake response:** 服务器同意就返回 **101 Switching Protocols**，其中 `Sec-WebSocket-Accept` 由客户端的 `Sec-WebSocket-Key` 计算得出，用来确认双方真的在说 WebSocket。
   If the server agrees, it returns **101 Switching Protocols**; `Sec-WebSocket-Accept` is derived from the client's `Sec-WebSocket-Key` and confirms both sides really speak WebSocket.
3. **数据传输 Data transfer:** 之后同一条 TCP 连接上不再有 HTTP，双方用轻量的**帧**随时互发消息，不需要反复建立连接和发送完整的请求头。
   After that the same TCP connection no longer carries HTTP; both sides send lightweight **frames** whenever they like, with no repeated connection setup or full request headers.

> [!tip] Java 类比 Java analogy
> 像从“每次调用都新开一个 `HttpURLConnection`”变成“持有一个 `Socket` 并在上面读写”，不同的是 WebSocket 的握手能穿过现有的 HTTP 基础设施（80/443 端口、代理）。
> It is like going from "open a new `HttpURLConnection` per call" to "hold one `Socket` and read and write on it", except the WebSocket handshake gets through existing HTTP infrastructure (ports 80/443, proxies).

## 4. 🌐 支持与实际场景 Support and Real-World Use

- **支持 Support:** Chrome、Firefox、Edge 等浏览器原生支持（`new WebSocket(url)`），服务端的 Node.js、Django、ASP.NET、Spring 等框架也都支持。
  Browsers such as Chrome, Firefox, and Edge support it natively (`new WebSocket(url)`), and server frameworks such as Node.js, Django, ASP.NET, and Spring do too.
- **网络也要允许 The network must allow it:** 设备支持还不够，过于严格的防火墙或代理可能拦截 WebSocket。使用 `wss://`（443 端口）通常更容易通过。
  Device support is not enough: a strict firewall or proxy may block WebSocket. Using `wss://` (port 443) usually gets through more easily.
- **例子 Example, Twitch:** 直播间的聊天几乎肯定用 WebSocket。在浏览器开发者工具的 Network 标签里筛选 `WS`，能看到状态码 **101** 的握手请求，以及不断收发的消息帧。
  Live-stream chat almost certainly uses WebSocket. In the browser dev tools' Network tab, filter by `WS` to see the handshake with status **101** and the stream of message frames.
- **其他场景 Other uses:** 在线协作编辑、行情推送、多人游戏、通知。
  Collaborative editing, live price feeds, multiplayer games, and notifications.

## 5. ⚖️ 与其他协议对比 Comparison with Other Protocols

| 协议 Protocol | 传输层 Transport | 方向 Direction | 典型用途 Typical use |
| --- | --- | --- | --- |
| HTTP/1.1 | TCP | 请求-响应 Request-response | 网页、REST API 接口 Web pages, REST APIs |
| HTTP/2 | TCP | 请求-响应，多路复用 Request-response, multiplexed | 同上，更快 Same, but faster |
| WebSocket | TCP | 全双工 Full duplex | 聊天、实时推送 Chat, live updates |
| WebRTC | 主要走 UDP 协议 Mostly UDP | 点对点 Peer to peer | 音视频通话 Audio and video calls |

> [!important] 扩展 WebSocket 的要点 Scaling WebSockets
> 每个连接都占用服务器内存和文件描述符。面试里常见的要点：负载均衡器要支持长连接（或用粘性会话），多台服务器之间用 Redis Pub/Sub 或消息队列转发消息，客户端要有**心跳（ping/pong）**和**断线重连**。
> Each connection holds server memory and a file descriptor. Common interview points: the load balancer must support long-lived connections (or use sticky sessions), servers relay messages to each other through Redis Pub/Sub or a message queue, and clients need a **heartbeat (ping/pong)** and **automatic reconnect**.

## 6. ⚠️ 对课程原文的澄清 Clarifications to the Lesson Text

- **“除 WebRTC 外所有应用层协议都用 TCP” "Every application-level protocol uses TCP except WebRTC":** 说得太绝对。DNS 主要用 UDP，HTTP/3 跑在基于 UDP 的 QUIC 上，WebRTC 的媒体流用 UDP 但信令通常走 HTTP 或 WebSocket。
  Too absolute. DNS mostly uses UDP, HTTP/3 runs on QUIC over UDP, and WebRTC sends media over UDP while its signaling usually goes through HTTP or WebSocket.
- **“HTTP 只能靠轮询” "HTTP can only poll":** 还有长轮询和 SSE，它们能缓解延迟，但不是真正的双向通信。
  Long polling and SSE also exist; they reduce the delay but are not true two-way communication.
- **“HTTP/2 多路复用不能完全取代 WebSocket” "HTTP/2 multiplexing is not a perfect replacement":** 方向是对的：多路复用只是让多个请求共用一条连接，服务器仍然不能主动发起请求（HTTP/2 的 server push 已被主流浏览器移除，且不是聊天用的）。
  The conclusion is right: multiplexing only lets several requests share one connection, and the server still can't start a message on its own (HTTP/2 server push has been removed from mainstream browsers and was never meant for chat).
- **“WebSocket 是 HTTP 的升级” "WebSocket is an upgrade of HTTP":** 只有握手是 HTTP，握手之后是另一个协议（帧格式），不再有请求和响应。
  Only the handshake is HTTP; after it, the connection speaks a different protocol (frames), with no more requests and responses.

## 7. 🧩 复习题 Review Questions

**Q1.** 为什么聊天应用不适合用 HTTP 短轮询？ Why is HTTP short polling a poor fit for a chat app?

> [!success]- 答案 Answer
> 间隔长则消息延迟，间隔短则产生大量没有新数据的请求，加重服务器负担。WebSocket 让服务器有消息时主动推送，没有消息时不产生流量。
> A long interval delays messages and a short one produces many requests that return nothing, loading the server. With WebSocket, the server pushes when there is a message and sends nothing otherwise.

**Q2.** WebSocket 连接是怎么建立的？状态码是什么？ How is a WebSocket connection established, and which status code is used?

> [!success]- 答案 Answer
> 客户端先发一个带 `Upgrade: websocket` 和 `Sec-WebSocket-Key` 的 HTTP 请求，服务器同意就返回 **101 Switching Protocols**，之后这条 TCP 连接改用 WebSocket 帧通信。
> The client sends an HTTP request with `Upgrade: websocket` and `Sec-WebSocket-Key`; if the server agrees it returns **101 Switching Protocols**, and the TCP connection then carries WebSocket frames.

**Q3.** 什么时候选 SSE 或长轮询而不是 WebSocket？ When would you pick SSE or long polling over WebSocket?

> [!success]- 答案 Answer
> 只需要服务器单向推送（通知、行情）时，SSE 更简单，还自带自动重连；需要兼容限制 WebSocket 的网络时，长轮询是兜底方案。需要频繁双向通信（聊天、游戏）才选 WebSocket。
> SSE is simpler and reconnects automatically when only one-way server pushes are needed (notifications, price feeds). Long polling is the fallback for networks that block WebSocket. Pick WebSocket when frequent two-way communication is needed (chat, games).

**Q4.** 扩展到上百万个 WebSocket 连接要考虑什么？ What matters when scaling to millions of WebSocket connections?

> [!success]- 答案 Answer
> 连接有状态且长期占用资源：用能处理长连接的负载均衡器，多台服务器之间通过 Redis Pub/Sub 或消息队列转发消息，加心跳检测死连接，客户端断线要重连，并注意文件描述符和内存上限。
> Connections are stateful and long-lived: use a load balancer that handles long connections, relay messages between servers via Redis Pub/Sub or a message queue, add heartbeats to detect dead connections, let clients reconnect, and watch file-descriptor and memory limits.

## 8. 🔗 相关 Related

- ⬅️ 上一篇 Previous: [[HTTP|超文本传输协议 HTTP]]
- [[TCP and UDP|TCP 与 UDP 协议 TCP and UDP]]
- [[Networking Basics|网络基础 Networking Basics]]
- [[📌 系统设计总览|系统设计总览 System Design Overview]]
