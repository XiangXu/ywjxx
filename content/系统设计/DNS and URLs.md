---
title: "域名系统与 URL 基础 DNS and URLs"
aliases:
  - 域名系统与 URL
  - 域名系统 Domain Name System
  - DNS
  - DNS 记录 DNS Records
  - DNS 解析 DNS Resolution
  - 域名注册商 Domain Registrar
  - URL 结构 Anatomy of a URL
tags:
  - System-Design
  - Networking
  - Interview-Prep
created: 2026-10-31
---
# 📖 DNS and URLs

> [!abstract] 一句话总结 One-line summary
> **DNS** 是互联网的电话簿：它把好记的域名（`google.com`）翻译成计算机用来寻址的 IP 地址。**URL** 则在域名之外，还说明了用什么协议、连哪个端口、要哪个资源。
> **DNS** is the internet's phone book: it translates easy-to-remember domain names (`google.com`) into the IP addresses computers use to find each other. Beyond the domain, a **URL** says which protocol to use, which port to connect to, and which resource to fetch.

## 1. 太长不看 TL;DR

- 📖 **电话簿 Phone book:** 人记名字，计算机认 IP。DNS 是一个分布式、分层的命名系统，负责“名字 → IP”的查询。
  People remember names; computers need IPs. DNS is a distributed, hierarchical naming system that answers "name → IP" lookups.
- 🏬 **谁管域名 Who runs domains:** ICANN 负责全局协调，注册局运营各个顶级域（如 `.com`），我们通过 ICANN 认证的注册商（如 GoDaddy、Namecheap）注册域名。
  ICANN coordinates globally, registries run each top-level domain (like `.com`), and we register names through ICANN-accredited registrars (like GoDaddy or Namecheap).
- 📇 **记录 Records:** 域名的信息存在 DNS 记录里。**A 记录**把域名映射到 IPv4 地址，AAAA 映射 IPv6，CNAME 指向另一个域名。
  A domain's information lives in DNS records. An **A record** maps a name to an IPv4 address, AAAA to IPv6, and CNAME to another name.
- 🗄️ **缓存 Caching:** 查询结果会在浏览器、操作系统和解析器里缓存，缓存多久由记录的 **TTL** 决定。
  Answers are cached by the browser, the OS, and the resolver, for as long as the record's **TTL** says.
- 🔗 **URL 结构 URL anatomy:** `https://domains.google.com:443/get-started?ref=nav#faq` = 协议 + 子域名 + 二级域 + 顶级域 + 端口 + 路径 + 查询 + 片段。
  `https://domains.google.com:443/get-started?ref=nav#faq` = scheme + subdomain + second-level domain + TLD + port + path + query + fragment.
- 🚪 **默认端口 Default ports:** HTTP 默认 80，HTTPS 默认 443，所以 URL 里通常不写端口；用非标准端口（如 8080）时必须写上。
  HTTP defaults to 80 and HTTPS to 443, so URLs usually leave the port out. A non-standard port (like 8080) must be written.

## 2. 📖 DNS 查询 DNS Lookups

域名从右往左读，越往右层级越高：根（`.`，通常不写）→ 顶级域 `com` → 二级域 `google` → 子域名 `domains`。没有任何一台服务器存着所有域名，每一层只负责自己那一段，既能分摊负载，又能各自管理。
Domain names are read right to left, and the further right, the higher the level: the root (`.`, usually left out) → the TLD `com` → the second-level domain `google` → the subdomain `domains`. No single server holds every name; each level only answers for its own part, which spreads the load and lets each part be managed separately.

```text
 浏览器 Browser
   │ 1. 查浏览器缓存、操作系统缓存和 hosts 文件
   │    check the browser cache, OS cache, and hosts file
   ▼
 递归解析器 Recursive resolver   (ISP、8.8.8.8、1.1.1.1 / your ISP, 8.8.8.8, 1.1.1.1)
   │ 2. 有缓存就直接返回；没有就替你一层层去问
   │    answer from cache if it can, otherwise ask level by level for you
   ├──▶ 根服务器 Root server        "com 归谁管？ who handles com?"   → .com 服务器 the .com servers
   ├──▶ 顶级域服务器 TLD server      "google.com 呢？ and google.com?" → ns1.google.com
   └──▶ 权威服务器 Authoritative     "domains.google.com 的 A 记录？ its A record?" → 142.251.x.x
   │ 3. 把答案按 TTL 缓存，再返回给浏览器
   │    cache the answer for its TTL, then return it to the browser
   ▼
 浏览器拿到 IP，直接连服务器 The browser connects straight to the server at that IP
```

- **递归和迭代 Recursive vs iterative:** 你的电脑只问解析器一次，由解析器跑完全程（递归查询）；解析器问根、顶级域和权威服务器时，每一层只告诉它“下一步去问谁”（迭代查询）。
  Your computer asks the resolver once and the resolver does the whole walk (a recursive query). When the resolver asks the root, TLD, and authoritative servers, each one only says "ask this server next" (iterative queries).
- **传输协议 Transport:** DNS 查询默认走 **UDP 53 端口**，响应太大时改用 TCP。见 [[TCP and UDP|TCP 与 UDP 协议 TCP and UDP]]。
  DNS lookups use **UDP port 53** by default and fall back to TCP when a response is too large. See [[TCP and UDP|TCP 与 UDP 协议 TCP and UDP]].

> [!note] 一个名字，多个地址 One name, many addresses
> 大网站的域名通常对应**很多**个 IP，而且会随地区和时间变化。DNS 可以按地区或负载返回不同的地址，所以 DNS 也常被当作简单的负载均衡和流量调度手段。
> A big site's name usually maps to **many** IPs, and they change by region and over time. DNS can return different addresses by region or load, so it's often used as simple load balancing and traffic steering.

## 3. 🏬 ICANN、注册局和注册商 ICANN, Registries, and Registrars

| 角色 Role | 做什么 What it does | 例子 Example |
| --- | --- | --- |
| ICANN | 制定规则、协调全局，认证注册商 Sets the rules, coordinates globally, accredits registrars | 全球唯一 The one global body |
| 注册局 Registry | 运营一个顶级域，维护它下面所有域名的数据库 Runs one TLD and keeps the database of every name under it | Verisign 运营 `.com` Verisign runs `.com` |
| 注册商 Registrar | 帮你查询、注册和续费域名 Helps you search, register, and renew names | GoDaddy, Namecheap, Cloudflare |
| 注册人 Registrant | 注册了域名的你，可以设置它的 DNS 记录 You, the name's holder, free to set its DNS records | 你 You |

- **是租不是买 Rent, not buy:** 一个域名只能有一个注册人，而且是按期（通常按年）租用。到期不续费也不会立刻释放，要先经过宽限期和赎回期，之后别人才能再注册。
  A name can have only one registrant, and you really rent it for a term (usually yearly). If you don't renew, it isn't released at once: it goes through a grace period and a redemption period first, and only then can someone else register it.

## 4. 📇 DNS 记录 DNS Records

注册域名后，你在 DNS 服务商那里为它（和它的子域名）添加记录，权威服务器就用这些记录回答查询。
After registering a domain, you add records for it (and its subdomains) at your DNS provider, and the authoritative servers answer lookups from those records.

| 类型 Type | 作用 What it maps | 例子 Example |
| --- | --- | --- |
| A | 域名 → IPv4 地址 Name → IPv4 address | `example.com → 203.0.113.10` |
| AAAA | 域名 → IPv6 地址 Name → IPv6 address | `example.com → 2001:db8::1` |
| CNAME | 域名 → 另一个域名（别名），不能和同名的其他记录共存 Name → another name (an alias); can't share its name with other records | `www.example.com → example.com` |
| MX | 这个域名的邮件服务器，数字越小越优先 The domain's mail servers, lower number first | `example.com → 10 mail.example.com` |
| TXT | 任意文本，常用于域名验证和邮件认证 Free text, often for domain verification and email authentication (SPF, DKIM, DMARC) | `v=spf1 include:_spf.google.com ~all` |
| NS | 哪些服务器对这个域名有权威 Which servers are authoritative for the domain | `google.com → ns1.google.com` |

### 4.1 🗄️ TTL 和缓存 TTL and caching

每条记录都带一个 **TTL**（生存时间，单位秒），告诉解析器和客户端这个答案可以缓存多久。
Every record carries a **TTL** (time to live, in seconds) that tells resolvers and clients how long they may cache the answer.

> [!important] 先调低 TTL 再迁移 Lower the TTL before moving
> TTL 是一把双刃剑：长 TTL 查询少、速度快，但改了 IP 以后，旧地址会在各地缓存里留到过期为止。迁移服务器之前，通常先把 TTL 调低（比如 60 秒），至少等一个旧 TTL 的时间，让旧缓存过期后再切换。
> TTL cuts both ways: a long TTL means fewer, faster lookups, but after you change the IP, the old address lingers in caches until they expire. Before moving a server, people usually lower the TTL first (say, to 60 seconds), wait at least one old TTL so the old caches expire, and then switch.

> [!tip] Java 类比 Java analogy
> `InetAddress.getByName("neetcode.io")` 会走一遍 DNS 查询。JVM 自己也缓存查询结果，时长由 `networkaddress.cache.ttl` 安全属性控制，默认大约 30 秒，具体取决于 JDK 实现。长期运行的服务如果把它设成“永久缓存”，就看不到 DNS 的变化。
> `InetAddress.getByName("neetcode.io")` performs a DNS lookup. The JVM also caches answers, for as long as the `networkaddress.cache.ttl` security property says, by default about 30 seconds depending on the JDK. A long-running service that caches forever won't see DNS changes.

## 5. 🔗 URL 的结构 Anatomy of a URL

**URL**（统一资源定位符）告诉浏览器“用什么方式、去哪台机器、拿什么东西”：
A **URL** (Uniform Resource Locator) tells the browser how to fetch what, from which machine:

```text
  https://domains.google.com:443/get-started?ref=nav#faq
  └─┬─┘   └──┬──┘ └─┬──┘ └┬┘ └┬┘└────┬─────┘└──┬───┘└┬─┘
    │        │      │     │   │      │         │     └─ fragment 片段
    │        │      │     │   │      │         └─ query 查询
    │        │      │     │   │      └─ path 路径
    │        │      │     │   └─ port 端口
    │        │      │     └─ TLD 顶级域
    │        │      └─ second-level domain 二级域
    │        └─ subdomain 子域名
    └─ scheme 协议
```

| 部分 Part | 本例 Here | 说明 What it means |
| --- | --- | --- |
| 协议 Scheme | `https://` | 用哪种协议访问资源；网页上 HTTPS 已是主流，`http://` 多见于本地开发 Which protocol to use; HTTPS is the norm on the web, and `http://` is mostly local development |
| 子域名 Subdomain | `domains` | 网站里一个独立的分区，可以指向完全不同的服务器 A separate section of the site, which can point to a completely different server |
| 二级域 Second-level domain | `google` | 网站的核心身份，加上顶级域就是你在注册商那里注册的**注册域名** `google.com` The site's core identity; with the TLD it forms the **registered domain** `google.com`, the part you register at a registrar |
| 顶级域 Top-level domain | `.com` | 层级最高的部分（根之下） The highest level (just below the root) |
| 端口 Port | `:443` | 通常省略，因为协议有默认端口（HTTP **80**，HTTPS **443**）；非标准端口必须写，如 `http://localhost:8080` Usually left out because each scheme has a default (**80** for HTTP, **443** for HTTPS); a non-standard port must be written, as in `http://localhost:8080` |
| 路径 Path | `/get-started` | 用 `/` 分隔，指向网站里的某个页面或资源 Separated by `/`, it points to a page or resource on the site |
| 查询 Query | `?ref=nav` | 以 `?` 开头的 `key=value` 参数，用 `&` 连接 `key=value` parameters after `?`, joined by `&` |
| 片段 Fragment | `#faq` | 页面内的位置，**不会**发给服务器，由浏览器自己处理 A spot inside the page, **not** sent to the server; the browser handles it |

> [!note] 子域名不是路径 Subdomain vs path
> `domains.google.com` 和 `google.com/domains` 完全不同。子域名是 DNS 里的另一个名字，可以有自己的记录和服务器；路径只是同一台主机上的不同位置。注册了 `google.com`，就能自由创建任意多个子域名和路径。
> `domains.google.com` and `google.com/domains` are completely different. A subdomain is another name in DNS, with its own records and servers; a path is just a location on the same host. Once you register `google.com`, you can create as many subdomains and paths as you like.

## 6. 🗺️ 把一切串起来 Putting It Together

浏览器打开 `https://neetcode.io/practice` 时：
When a browser opens `https://neetcode.io/practice`:

1. 🔗 **解析网址 Parse the URL:** 协议是 HTTPS，主机是 `neetcode.io`，没写端口所以用 443，路径是 `/practice`。
   The scheme is HTTPS, the host is `neetcode.io`, no port is written so it's 443, and the path is `/practice`.
2. 🔎 **DNS 查询 DNS lookup:** 先查缓存；没有的话由解析器经过根、`.io` 和权威服务器拿到 A 记录。
   Check the caches first; on a miss, the resolver walks the root, `.io`, and authoritative servers to get the A record.
3. 🤝 **建立连接 Connect:** 通常和这个 IP 的 443 端口做 TCP 握手和 TLS 握手（HTTP/3 则用基于 UDP 的 QUIC）。
   Usually do the TCP and TLS handshakes with port 443 at that IP (HTTP/3 uses QUIC over UDP instead).
4. 📤 **发送请求 Send the request:** `GET /practice`，并在 `Host` 头里带上 `neetcode.io`，让同一个 IP 上的服务器知道你要哪个网站（TLS 握手时也会通过 SNI 发送域名）。
   `GET /practice`, with `neetcode.io` in the `Host` header so a server hosting several sites on one IP knows which one you want (TLS also sends the name via SNI).
5. 📥 **返回响应 Respond:** 服务器返回页面，浏览器再按 `#片段` 滚动到对应位置（如果有的话）。
   The server returns the page, and the browser scrolls to the `#fragment` if there is one.

## 7. ⚠️ 对课程原文的澄清 Clarifications to the Lesson Text

- **“ICANN 管理域名的运营” "ICANN manages the operation of domain names":** ICANN 是**协调者**：制定政策、协调根区（通过 IANA 职能）并认证注册商。每个顶级域由各自的**注册局**运营，课程漏掉了这一层。
  ICANN is a **coordinator**: it sets policy, coordinates the root zone (through the IANA function), and accredits registrars. Each TLD is run by its own **registry**, a layer the lesson skips.
- **“DNS 服务器把请求路由到服务器” "The DNS server routes your request to the server":** DNS 只负责**返回 IP 地址**，不转发请求。拿到 IP 后，客户端直接连服务器，请求由路由器沿 IP 路由送达。
  DNS only **returns the IP address**; it doesn't forward the request. Once the client has the IP, it connects to the server directly, and routers deliver the packets by IP.
- **“服务器 IP 是静态的才会缓存” "Your computer caches the IP if the server's IP is static":** 是否缓存、缓存多久由记录的 **TTL** 决定，与 IP 是否静态无关。浏览器、操作系统和解析器都会缓存。
  Whether and how long an answer is cached depends on the record's **TTL**, not on whether the IP is static. The browser, the OS, and the resolver all cache.
- **“把 google.com 称为主域名” "The primary domain google.com":** 常用叫法是**注册域名**或**裸域名**（apex）。对 `bbc.co.uk`，注册域名是整个 `bbc.co.uk`，因为 `co.uk` 是公共后缀。
  The usual terms are **registered domain** or **apex domain**. For `bbc.co.uk`, the registered domain is all of `bbc.co.uk`, because `co.uk` is a public suffix.

## 8. 🧩 复习题 Review Questions

**Q1.** 浏览器第一次访问 `www.example.com`，DNS 查询会经过哪些服务器？ The first time a browser visits `www.example.com`, which servers does the DNS lookup go through?

> [!success]- 答案 Answer
> 先查浏览器和操作系统缓存，都没有就问递归解析器。解析器缓存也没有的话，依次问根服务器（得到 `.com` 服务器）、`.com` 顶级域服务器（得到 `example.com` 的权威服务器）和权威服务器（得到 A 或 CNAME 记录），然后按 TTL 缓存结果并返回。实际中解析器通常已缓存了 `.com` 服务器，可以跳过根服务器。
> The browser and OS caches are checked first, then the recursive resolver. If the resolver has no cached answer, it asks a root server (which points to the `.com` servers), a `.com` TLD server (which points to `example.com`'s authoritative servers), and the authoritative server (which returns the A or CNAME record). It caches the answer for its TTL and returns it. In practice a resolver usually has the `.com` servers cached and skips the root.

**Q2.** 你要把网站迁到一台 IP 不同的新服务器，DNS 方面该怎么做才能少出问题？ You're moving a site to a new server with a different IP. What should you do with DNS to avoid trouble?

> [!success]- 答案 Answer
> 提前把 A 记录的 TTL 调低（比如从一天调到 60 秒），并至少等一个旧 TTL 的时间，让各处缓存里的旧值过期，再改 IP。切换期间新旧服务器都保持可用，因为有些客户端还会用缓存里的旧地址。稳定后再把 TTL 调回去。
> Lower the A record's TTL well ahead (say, from a day to 60 seconds), then wait at least one old TTL so caches holding the old value expire, and only then change the IP. Keep both servers up during the switch, since some clients will still use the cached old address. Raise the TTL again once things settle.

**Q3.** `blog.example.com` 和 `example.com/blog` 有什么区别？ How do `blog.example.com` and `example.com/blog` differ?

> [!success]- 答案 Answer
> `blog.example.com` 是子域名，是 DNS 里一个独立的名字，可以有自己的记录，指向完全不同的服务器。`example.com/blog` 是同一个主机上的路径，DNS 只解析 `example.com`，`/blog` 由那台服务器自己处理。
> `blog.example.com` is a subdomain, a separate name in DNS that can have its own records and point to a completely different server. `example.com/blog` is a path on the same host: DNS resolves only `example.com`, and that server handles `/blog` itself.

**Q4.** URL 里的 `#faq` 会发给服务器吗？ Is the `#faq` in a URL sent to the server?

> [!success]- 答案 Answer
> 不会。片段只在浏览器里使用，用来跳到页面里的某个位置，或者给单页应用做客户端路由。查询字符串 `?ref=nav` 则会发给服务器。
> No. The fragment stays in the browser, where it jumps to a spot on the page or drives client-side routing in single-page apps. The query string `?ref=nav`, by contrast, is sent to the server.

## 9. 🔗 相关 Related

- ⬅️ 上一篇 Previous: [[TCP and UDP|TCP 与 UDP 协议 TCP and UDP]]
- ➡️ 下一篇 Next: [[HTTP|超文本传输协议 HTTP]]
- [[Networking Basics|网络基础 Networking Basics]]
- [[📌 系统设计总览|系统设计总览 System Design Overview]]
