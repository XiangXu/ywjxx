---
title: "TCP 与 UDP TCP and UDP"
aliases:
  - TCP 与 UDP
  - TCP vs UDP
  - 传输层协议
  - Transport Layer Protocols
  - 三次握手 Three-Way Handshake
  - 用户数据报协议 User Datagram Protocol
tags:
  - System-Design
  - Networking
  - Interview-Prep
created: 2026-10-31
---
# 🚚 TCP and UDP

> [!abstract] 一句话总结 One-line summary
> **TCP** 先握手建立连接，再用确认和重传保证数据可靠、按顺序到达，代价是更多开销和延迟；**UDP** 不建立连接、不重传、不排序，只管把数据报发出去，换来更低的延迟和开销。
> **TCP** sets up a connection with a handshake, then uses acknowledgments and retransmission so data arrives reliably and in order, at the cost of more overhead and latency. **UDP** has no connection, no retransmission, and no ordering: it just sends datagrams, which buys lower latency and overhead.

## 1. 太长不看 TL;DR

- 🤝 **三次握手 Handshake:** TCP 发数据前要先交换三个段（SYN → SYN-ACK → ACK），建立一条双向的连接。
  Before sending data, TCP exchanges three segments (SYN → SYN-ACK → ACK) to set up a connection that works in both directions.
- 🔁 **确认和重传 ACK & retransmit:** 发出去的数据如果迟迟等不到确认，TCP 就认为它丢了，重新发送。
  If sent data isn't acknowledged in time, TCP assumes it was lost and sends it again.
- 🐢 **代价 The cost:** 握手、确认、重传等待和顺序重组都会增加开销和延迟。
  The handshake, acknowledgments, retransmission waits, and in-order reassembly all add overhead and latency.
- ⚡ **UDP 的思路 UDP's approach:** 不握手、不确认、不重传、不排序，丢了就丢了，由应用自己决定怎么办。
  No handshake, no acknowledgments, no retransmission, no reordering. Lost data stays lost, and the app decides what to do.
- 🎮 **怎么选 How to choose:** 数据必须完整正确（网页、API、文件、支付）用 TCP；“晚到不如不到”的实时数据（视频通话、游戏状态）常用 UDP。
  Use TCP when data must be complete and correct (web pages, APIs, files, payments). Real-time data where late is as bad as lost (video calls, game state) often uses UDP.

## 2. 🤝 TCP 可靠传输 TCP: Reliable Delivery

上一篇讲过，数据会被切成很多包发送，路上可能丢包、乱序或重复。**TCP**（传输控制协议）的任务就是在不可靠的 IP 之上，给应用提供一条**可靠、有序的字节流**。
As the last note covered, data is split into many packets, which can be lost, reordered, or duplicated on the way. **TCP** (Transmission Control Protocol) gives apps a **reliable, ordered byte stream** on top of unreliable IP.

### 2.1 🤝 三次握手 The three-way handshake

发送任何数据之前，客户端和服务器要先“对上暗号”，交换各自的初始序列号：
Before any data is sent, the client and server agree on a connection by exchanging their initial sequence numbers:

```text
 Client                                   Server
   │ ── SYN (seq = x) ───────────────────▶ │   1. 我想连接，我从 x 开始编号
   │                                        │      I want to connect, my bytes start at x
   │ ◀── SYN-ACK (seq = y, ack = x+1) ──── │   2. 好的，我从 y 开始编号，收到你的 x
   │                                        │      OK, mine start at y, got your x
   │ ── ACK (ack = y+1) ─────────────────▶ │   3. 收到你的 y，连接建立
   │                                        │      Got your y, connection established
   │ ◀═════ 双向传输数据 data both ways ═════▶ │
```

- **为什么是三次 Why three:** 双方都要发出自己的序列号，**并**确认对方的序列号。第二步把“服务器的 SYN”和“对客户端的 ACK”合并成一个段，所以四件事三步就够了。
  Each side has to send its own sequence number **and** acknowledge the other's. Step 2 combines the server's SYN with its ACK of the client, so four jobs fit into three steps.
- **双向连接 Two-way connection:** 握手完成后，双方都能同时发送和接收（全双工）。
  After the handshake, both sides can send and receive at the same time (full duplex).
- **关闭连接 Closing:** 结束时通常各自发一个 FIN 并被对方确认，一共四个段（四次挥手）。
  To close, each side usually sends a FIN that the other acknowledges, four segments in all (the four-way teardown).

### 2.2 🔁 确认和重传 Acknowledgments and retransmission

连接建立后，接收方会告诉发送方“我已经收到到哪个字节了”（ACK）。发送方给每段数据计时，**超时还没收到确认**就重传。
Once connected, the receiver tells the sender which bytes it has received so far (the ACK). The sender times each segment and **retransmits it when no acknowledgment arrives in time**.

```text
 Client                                   Server
   │ ── seg 1 (bytes 1–1000) ────────────▶ │
   │ ◀────────────────────── ACK 1001 ──── │
   │ ── seg 2 (bytes 1001–2000) ──── ✗ 丢失 lost
   │      ⏱️ 超时 timeout, 没有 ACK no ACK
   │ ── seg 2 (重传 retransmit) ─────────▶ │
   │ ◀────────────────────── ACK 2001 ──── │
```

| 机制 Mechanism | 作用 What it does |
| --- | --- |
| 序列号 Sequence numbers | 给字节编号，接收方据此去重并按顺序重组 Number the bytes so the receiver can drop duplicates and reassemble in order |
| 累计确认 Cumulative ACK | “我已经连续收到这个字节之前的所有数据” "I have everything up to this byte" |
| 超时重传 Timeout retransmit | 等不到确认就重发 Resend when no ACK arrives in time |
| 快速重传 Fast retransmit | 连续收到三个重复 ACK 就不等超时，立即重发 Resend right away after three duplicate ACKs, without waiting for the timeout |
| 流量控制 Flow control | 接收方告诉发送方自己还能收多少（窗口） The receiver advertises how much more it can take (the window) |
| 拥塞控制 Congestion control | 网络拥堵时主动降速 The sender slows down when the network is congested |

> [!example] 挂号信 Registered mail
> TCP 像挂号信：每封都要对方签收，没签收就补寄。寄得慢一点，但你知道对方一定收齐了（或者明确知道寄不到）。
> TCP is like registered mail: each letter needs a signature, and unsigned ones get sent again. It's slower, but you know the recipient got everything (or you find out clearly that delivery failed).

### 2.3 🐢 TCP 的代价 What TCP costs

| 开销 Overhead | 说明 Why it costs |
| --- | --- |
| 握手延迟 Handshake latency | 发第一个字节前要等一个往返时间 One round trip before the first byte of data |
| 更大的头部 Bigger header | 头部至少 20 字节，UDP 只有 8 字节 A header of at least 20 bytes, versus 8 for UDP |
| 连接状态 Connection state | 两端都要维护缓冲区、序列号和计时器 Both ends keep buffers, sequence numbers, and timers |
| 队头阻塞 Head-of-line blocking | 一个段丢了，后面已经到达的数据也要等它重传完才能交给应用 One lost segment holds back later data that already arrived until the retransmit lands |

> [!tip] Java 类比 Java analogy
> TCP 对应 Java 里的 `Socket` / `ServerSocket`：先 `accept()` 建立连接，再用 `InputStream` / `OutputStream` 读写一条字节流。UDP 对应 `DatagramSocket`：没有连接，每次 `send()` / `receive()` 一个独立的 `DatagramPacket`。
> TCP maps to Java's `Socket` / `ServerSocket`: you `accept()` a connection, then read and write a byte stream through `InputStream` / `OutputStream`. UDP maps to `DatagramSocket`: no connection, and each `send()` / `receive()` handles one standalone `DatagramPacket`.

## 3. ⚡ UDP 轻量传输 UDP: Lightweight Delivery

**UDP**（用户数据报协议）几乎只在 IP 之上加了**端口**和**校验和**。每个数据报独立发送，协议本身不管它有没有到、按什么顺序到。
**UDP** (User Datagram Protocol) adds little more than **ports** and a **checksum** on top of IP. Each datagram is sent on its own, and the protocol doesn't track whether or in what order it arrives.

```text
 Client                                   Server
   │ ── datagram 1 ──────────────────────▶ │
   │ ── datagram 2 ──────────── ✗ 丢失 lost
   │ ── datagram 3 ──────────────────────▶ │   没有握手、ACK 或重传
   │ ── datagram 4 ──────────────────────▶ │   no handshake, ACK, or retransmit
```

| 特点 Trait | 结果 What it means |
| --- | --- |
| 无连接 Connectionless | 第一个数据报就带数据，没有握手延迟 The first datagram already carries data, no handshake delay |
| 不重传 No retransmission | 丢了的数据不会补，不会因为等待而卡住 Lost data isn't resent, so nothing stalls waiting for it |
| 不排序 No ordering | 先发的可能后到，应用自己处理 Earlier datagrams may arrive later, and the app handles it |
| 保留消息边界 Message boundaries | 一次发送就是一个完整的数据报 One send is one whole datagram |
| 没有拥塞控制 No congestion control | 发多快由应用决定，也要应用自己别把网络压垮 The app picks the rate and must avoid flooding the network |

### 3.1 🎮 为什么要用 UDP Why pick UDP

对实时数据来说，**过时的数据等于没用的数据**。视频通话里丢了一帧，与其停下来等它重传，不如直接播下一帧；游戏里角色的旧位置已经没意义了，下一个包会带来新位置。
For real-time data, **stale data is useless data**. If a video call loses a frame, it's better to play the next one than to freeze waiting for a resend. In a game, a character's old position no longer matters, because the next packet brings a new one.

| 场景 Use case | 常用协议 Usually | 原因 Why |
| --- | --- | --- |
| 网页和接口 Web pages, REST APIs | TCP / QUIC | 数据必须完整 Every byte must arrive |
| 文件传输、邮件 File transfer, email | TCP | 少一个字节文件就坏了 One missing byte corrupts the file |
| 数据库连接 Database connections | TCP | 查询和结果必须准确有序 Queries and results must be exact and ordered |
| 视频通话、语音 Video and voice calls | UDP (RTP / WebRTC) | 低延迟比完整更重要 Low latency beats completeness |
| 在线游戏 Online games | UDP 为主 Mostly UDP | 只要最新状态 Only the latest state matters |
| DNS 查询 DNS lookups | UDP 为主 Mostly UDP | 一问一答，丢了重问就行 One question, one answer, just ask again if lost |
| 直播 Live streaming | 都有 Both | 低延迟直播用 UDP，普通直播多用基于 HTTP 的 TCP Low-latency streams use UDP, typical ones use HTTP over TCP |

> [!important] UDP 上也能做可靠 Reliability can live on top of UDP
> UDP 不提供的功能，应用可以自己按需加上。游戏常常只对“开火”“拾取”这种关键事件做确认重传，位置更新则直接丢弃。**QUIC**（HTTP/3 的底层）就是在 UDP 上重新实现了可靠传输、加密和多路复用，避免了 TCP 的队头阻塞。
> Apps can add whatever UDP leaves out, as much as they need. Games often acknowledge and resend only key events like "fire" or "pick up", and just drop stale position updates. **QUIC** (the base of HTTP/3) rebuilds reliable delivery, encryption, and multiplexing on top of UDP, avoiding TCP's head-of-line blocking.

## 4. ⚖️ TCP 和 UDP 对比 TCP vs UDP at a Glance

| 方面 Aspect | TCP | UDP |
| --- | --- | --- |
| 连接 Connection | 面向连接，先握手 Connection-oriented, handshake first | 无连接 Connectionless |
| 可靠性 Reliability | 确认加重传 ACKs and retransmission | 不保证送达 No delivery guarantee |
| 顺序 Ordering | 按顺序交给应用 Delivered in order | 不保证顺序 No ordering |
| 数据形式 Data unit | 字节流（段） Byte stream (segments) | 独立的数据报 Independent datagrams |
| 头部大小 Header size | 至少 20 字节 At least 20 bytes | 固定 8 字节 Fixed 8 bytes |
| 流量和拥塞控制 Flow & congestion control | 有 Yes | 没有 No |
| 延迟 Latency | 较高 Higher | 较低 Lower |
| 典型应用 Typical uses | 网页、远程登录、邮件、数据库 Web, SSH, email, databases | 通话、游戏、域名查询、QUIC 底层 Calls, games, DNS, QUIC |

## 5. ⚠️ 对课程原文的澄清 Clarifications to the Lesson Text

- **“双向连接即三次握手” "A two-way connection, referred to as a 3-way handshake":** 这是两件事。连接是**双向**（全双工）的；**三次握手**是建立这条连接的过程，因为要交换三个段而得名。
  These are two different things. The connection is **two-way** (full duplex); the **three-way handshake** is how it's set up, named for the three segments exchanged.
- **“TCP 确保丢失的包被可靠送达” "TCP ensures lost packets are reliably delivered":** TCP 会**重传**丢失的数据，但如果网络一直不通，它最终只能报错断开，不能真正“确保”送达。另外重传靠的是确认和计时器，不是握手；握手只负责建立连接和同步序列号。
  TCP **retransmits** lost data, but if the network stays down it can only give up with an error, so it can't truly "ensure" delivery. Retransmission relies on ACKs and timers, not the handshake, which only sets up the connection and syncs sequence numbers.
- **“UDP 传输更快” "UDP boasts faster data transmission":** 比特在线路上跑得一样快。UDP 的优势是**延迟更低、开销更小**：没有握手往返，没有重传等待，没有队头阻塞。在带宽很大的批量传输里，TCP 的吞吐量并不差。
  Bits travel the wire at the same speed. UDP's edge is **lower latency and overhead**: no handshake round trip, no retransmission waits, no head-of-line blocking. For large bulk transfers, TCP's throughput is perfectly good.
- **“视频流用 UDP 协议” "Video streaming uses UDP":** 要分情况。YouTube、Netflix 这类点播视频主要走基于 HTTP 的 HLS / DASH，底层是 TCP，或者是 QUIC（虽然跑在 UDP 上，但本身是可靠的）。真正“丢帧就跳过”的是**实时**视频，比如视频通话和低延迟直播（WebRTC / RTP）。
  It depends. On-demand video like YouTube and Netflix mostly uses HTTP-based HLS / DASH over TCP, or over QUIC (which runs on UDP but is itself reliable). Skipping dropped frames is what **real-time** video does, such as video calls and low-latency live streams (WebRTC / RTP).
- **“在线游戏用 UDP 协议” "Online gaming uses UDP":** 快节奏的游戏（射击、竞速）通常用 UDP，并在上面自己做部分可靠性。也有不少游戏（回合制、部分 MMO）直接用 TCP。
  Fast-paced games (shooters, racing) usually use UDP with some reliability of their own on top. Many others (turn-based games, some MMOs) just use TCP.
- **“丢一帧” "Skip a dropped frame":** 一帧视频通常要拆成好几个数据报。丢的往往是其中一部分，播放器会跳过或修补这一帧，编码器也会设法减少影响。
  A single video frame usually spans several datagrams. What's lost is often part of a frame, which the player skips or conceals while the codec limits the damage.
- **“开发者很少需要了解这么深” "Developers rarely need to go this deep":** 日常写业务确实如此，但系统设计面试经常会问“这里用 TCP 还是 UDP”（比如设计视频通话或多人游戏），而且 HTTP/3 已经跑在 UDP 上的 QUIC 里。
  True for everyday app code, but system design interviews often ask "TCP or UDP here?" (say, when designing video calls or a multiplayer game), and HTTP/3 already runs on QUIC over UDP.

## 6. 🧩 复习题 Review Questions

**Q1.** 三次握手交换了哪三个段？为什么不是两次？ Which three segments make up the handshake, and why not just two?

> [!success]- 答案 Answer
> SYN → SYN-ACK → ACK。双方都要发出自己的初始序列号并确认对方的序列号。只有两次的话，服务器无法知道客户端是否收到了自己的序列号，也难以识别网络里迟到的旧 SYN。
> SYN → SYN-ACK → ACK. Each side must send its initial sequence number and acknowledge the other's. With only two, the server couldn't know the client received its sequence number, and it couldn't easily reject a stale, delayed SYN.

**Q2.** TCP 怎么知道一个段丢了？ How does TCP know a segment was lost?

> [!success]- 答案 Answer
> 发送方在超时时间内没收到这段数据的确认，或者连续收到三个重复的 ACK（快速重传），就认为它丢了并重传。
> The sender sees no ACK for it before the timeout, or it gets three duplicate ACKs (fast retransmit). Either way it assumes the segment was lost and resends it.

**Q3.** 什么是队头阻塞？为什么 UDP 没有这个问题？ What is head-of-line blocking, and why doesn't UDP have it?

> [!success]- 答案 Answer
> TCP 必须按顺序把数据交给应用，所以一个段丢了，后面已经到达的数据也只能等它重传。UDP 不保证顺序，每个数据报一到就交给应用。
> TCP must hand data to the app in order, so one lost segment makes later data that already arrived wait for the retransmit. UDP has no ordering, so each datagram goes to the app as soon as it arrives.

**Q4.** 设计一个视频通话应用，媒体流和聊天消息分别用什么协议？ Designing a video call app, which protocol would you use for the media and for the chat messages?

> [!success]- 答案 Answer
> 音视频用 UDP（如 WebRTC 的 RTP），低延迟比完整更重要；聊天消息用 TCP（如 WebSocket）或者可靠通道，因为每条消息都必须送到。
> Media over UDP (e.g. RTP in WebRTC), because low latency beats completeness. Chat over TCP (e.g. a WebSocket) or another reliable channel, because every message must arrive.

**Q5.** HTTP/3 跑在 UDP 上，那它是不是不可靠？ HTTP/3 runs on UDP, so is it unreliable?

> [!success]- 答案 Answer
> 不是。HTTP/3 跑在 QUIC 上，QUIC 在 UDP 之上自己实现了确认、重传、拥塞控制和加密。用 UDP 是为了绕开 TCP 的队头阻塞，并且能在用户态快速迭代协议。
> No. HTTP/3 runs on QUIC, which implements acknowledgments, retransmission, congestion control, and encryption itself on top of UDP. UDP is used to avoid TCP's head-of-line blocking and to let the protocol evolve quickly in user space.

**Q6.** UDP 为什么适合 DNS 查询？ Why does UDP suit DNS lookups?

> [!success]- 答案 Answer
> DNS 通常是一个小请求加一个小响应。用 UDP 省掉了握手往返，丢了就由客户端超时重问。响应太大时，DNS 会改用 TCP。
> A DNS lookup is usually one small request and one small response. UDP skips the handshake round trip, and the client simply retries after a timeout if something is lost. When a response is too large, DNS falls back to TCP.

## 7. 🔗 相关 Related

- ⬅️ 上一篇 Previous: [[Networking Basics|网络基础 Networking Basics]]
- [[Design Requirements|设计需求 Design Requirements]]
- [[📌 系统设计总览|系统设计总览 System Design Overview]]
