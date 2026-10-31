---
title: "域名系统与 URL DNS and URLs"
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
> **DNS** is the internet's phone book: it translates easy-to-remember domain names (`google.com`) into the IP addresses computers use to find each other. A **URL** adds to the domain which protocol to use, which port to connect to, and which resource to fetch.

## 1. 太长不看 TL;DR

- 📖 **电话簿 Phone book:** 人记名字，计算机认 IP。DNS 是一个分布式、分层的命名系统，负责“名字 → IP”的查询。
  People remember names; computers need IPs. DNS is a distributed, hierarchical naming system that answers "name → IP" lookups.
- 🏬 **谁管域名 Who runs domains:** ICANN 负责全局协调，注册局运营各个顶级域（如 `.com`），我们通过 ICANN 认证的注册商（如 GoDaddy、Namecheap）注册域名。
  ICANN coordinates globally, registries run each top-level domain (like `.com`), and we register names through ICANN-accredited registrars (like GoDaddy or Namecheap).
- 📇 **记录 Records:** 域名的信息存在 DNS 记录里。**A 记录**把域名映射到 IPv4 地址，AAAA 映射 IPv6，CNAME 指向另一个域名。
  A domain's information lives in DNS records. An **A record** maps a name to an IPv4 address, AAAA to IPv6, and CNAME to another name.
- 🗄️ **缓存 Caching:** 查询结果会在浏览器、操作系统和解析器里缓存，缓存多久由记录的 **TTL** 决定。
  Answers are cached by the browser, the OS, and the resolver, for as long as the record's **TTL** says.
- 🔗 **URL 结构 URL anatomy:** `https://domains.google.com:443/get-started?ref=x#faq` = 协议 + 子域名 + 主域名 + 顶级域 + 端口 + 路径 + 查询 + 片段。
  Scheme + subdomain + registered domain + TLD + port + path + query + fragment.
- 🚪 **默认端口 Default ports:** HTTP 默认 80，HTTPS 默认 443，所以 URL 里通常不写端口；用非标准端口（如 8080）时必须写上。
  HTTP defaults to 80 and HTTPS to 443, so URLs usually leave the port out. A non-standard port (like 8080) must be written.

## 2. 📖 什么是 DNS What DNS Is

我们手机里存联系人，就不用背几百个电话号码。DNS 也一样：在浏览器里输入 `google.com`，DNS 把它翻译成一个 IP 地址（比如 `142.251.211.238`），计算机才知道该把请求发到哪里。
We keep contacts in our phones so we don't have to memorize hundreds of numbers. DNS works the same way: when you type `google.com` into a browser, DNS translates it into an IP address (such as `142.251.211.238`), so your computer knows where to send the request.

> [!note] 一个名字，多个地址 One name, many addresses
> 大网站的域名通常对应**很多**个 IP，而且会随地区和时间变化。DNS 会返回离你近或负载低的那些地址，所以 DNS 本身也是一种简单的负载均衡和流量调度手段。
> A big site's name usually maps to **many** IPs, and they change by region and over time. DNS hands back addresses that are close to you or lightly loaded, so DNS itself doubles as simple load balancing and traffic steering.

### 2.1 🌲 域名的层级 The naming hierarchy

域名从右往左读，越往右层级越高。最右边其实还有一个看不见的**根**（`.`）：
Domain names are read right to left, and the further right, the higher the level. At the far right there's an invisible **root** (`.`):

```text
                     .            根 root
                     │
        ┌────────────┼────────────┐
       com          io           org        顶级域 TLD
        │            │
     google       neetcode                  二级域 second-level domain
        │
     domains                                子域名 subdomain

  domains.google.com.   ← 完整写法，最后的点就是根 fully qualified, the final dot is the root
```

### 2.2 🔎 一次 DNS 查询怎么走 How a lookup works

课程原文没讲查询过程，但面试常问。浏览器要找 `domains.google.com` 时：
The lesson skips how a lookup actually happens, but interviews ask about it often. When the browser needs `domains.google.com`:

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
- **传输协议 Transport:** DNS 查询默认走 **UDP 53 端口**，响应太大时改用 TCP。见 [[TCP and UDP|TCP 与 UDP TCP and UDP]]。
  DNS lookups use **UDP port 53** by default and fall back to TCP when a response is too large. See [[TCP and UDP|TCP 与 UDP TCP and UDP]].
- **为什么分层 Why a hierarchy:** 没有任何一台服务器存着所有域名。每一层只负责自己那一段，既能分摊负载，又能各自管理。
  No single server holds every name. Each level only answers for its own part, which spreads the load and lets each part be managed separately.

## 3. 🏬 ICANN、注册局和注册商 ICANN, Registries, and Registrars

谁决定 `google.com` 属于谁？为什么别人不能随便占用它？可以把它想成在商场里开店：
Who decides that `google.com` belongs to Google, and why can't someone else just claim it? Think of opening a store in a shopping mall:

| 角色 Role | 商场类比 Mall analogy | 做什么 What it does | 例子 Example |
| --- | --- | --- | --- |
| ICANN | 商场管理公司 Mall management | 制定规则、协调全局，认证注册商 Sets the rules, coordinates globally, accredits registrars | ICANN |
| 注册局 Registry | 某一层楼的总承租方 The company running one floor | 运营一个顶级域，维护它下面所有域名的数据库 Runs one TLD and keeps the database of every name under it | Verisign 运营 `.com` Verisign runs `.com` |
| 注册商 Registrar | 租赁中介 Leasing agent | 帮你查询、注册和续费域名 Helps you search, register, and renew names | GoDaddy, Namecheap, Cloudflare |
| 注册人 Registrant | 租户 The tenant | 注册了域名的你，可以设置它的 DNS 记录 You, the name's holder, free to set its DNS records | 你 You |

- **先到先得 First come, first served:** 一个域名在注册局的数据库里只能有一个注册人。`google.com` 已经被注册并持续续费，所以别人注册不了。
  A name can have only one registrant in the registry's database. `google.com` is registered and kept renewed, so nobody else can take it.
- **是租不是买 Rent, not buy:** 注册一个域名其实是按年租用，到期不续费就会被释放，别人可以再注册。
  Registering a domain is really renting it by the year. If you don't renew, it's released and someone else can register it.

## 4. 📇 DNS 记录 DNS Records

注册域名后，你在 DNS 服务商那里为它（和它的子域名）添加记录，权威服务器就用这些记录回答查询。
After registering a domain, you add records for it (and its subdomains) at your DNS provider, and the authoritative servers answer lookups from those records.

| 类型 Type | 作用 What it maps | 例子 Example |
| --- | --- | --- |
| A | 域名 → IPv4 地址 Name → IPv4 address | `neetcode.io → 192.158.1.39` |
| AAAA | 域名 → IPv6 地址 Name → IPv6 address | `example.com → 2606:2800:220:1::` |
| CNAME | 域名 → 另一个域名（别名） Name → another name (an alias) | `www.example.com → example.com` |
| MX | 这个域名的邮件服务器 The domain's mail servers | `example.com → mail.example.com` |
| TXT | 任意文本，常用于验证和防伪邮件 Free text, often for verification and email anti-spoofing | `v=spf1 include:_spf.google.com ~all` |
| NS | 哪些服务器对这个域名有权威 Which servers are authoritative for the domain | `google.com → ns1.google.com` |

### 4.1 🗄️ TTL 和缓存 TTL and caching

每条记录都带一个 **TTL**（生存时间，单位秒），告诉解析器和客户端这个答案可以缓存多久。缓存期间再访问同一个网站，就不用重新查询。
Every record carries a **TTL** (time to live, in seconds) that tells resolvers and clients how long they may cache the answer. Until it expires, visiting the same site again needs no new lookup.

> [!important] 改 IP 前先调低 TTL Lower the TTL before moving
> TTL 是一把双刃剑：长 TTL 查询少、速度快，但改了 IP 以后，旧地址会在各地缓存里留到过期为止。迁移服务器之前，通常先把 TTL 调低（比如 60 秒），等旧缓存过期后再切换。
> TTL cuts both ways: a long TTL means fewer, faster lookups, but after you change the IP, the old address lingers in caches until they expire. Before moving a server, people usually lower the TTL first (say, to 60 seconds) and switch once the old caches have expired.

> [!tip] Java 类比 Java analogy
> `InetAddress.getByName("neetcode.io")` 会走一遍 DNS 查询。JVM 自己也缓存查询结果，时长由 `networkaddress.cache.ttl` 安全属性控制，默认大约 30 秒，具体取决于 JDK 实现。长期运行的服务如果把它设成“永久缓存”，就看不到 DNS 的变化。
> `InetAddress.getByName("neetcode.io")` performs a DNS lookup. The JVM also caches answers, for as long as the `networkaddress.cache.ttl` security property says, by default about 30 seconds depending on the JDK. A long-running service that caches forever won't see DNS changes.

## 5. 🔗 URL 的结构 Anatomy of a URL

**URL**（统一资源定位符）告诉浏览器“用什么方式、去哪台机器、拿什么东西”。把课程的例子补全一下：
A **URL** (Uniform Resource Locator) tells the browser how to fetch what, from which machine. Here is the lesson's example with every part filled in:

```text
  https://domains.google.com:443/get-started?ref=nav#faq
  └─┬─┘   └──┬──┘ └─┬──┘ └┬┘ └┬┘└────┬────┘ └──┬──┘ └┬┘
  协议     子域名  主域名 顶级域 端口  路径       查询   片段
  scheme  sub-    regis- TLD  port path       query frag-
          domain  tered                              ment
          └──────── 主机 host ────────┘
```

### 5.1 🧭 协议 Scheme

URL 开头的 `https://` 叫**协议**或 **scheme**，告诉客户端用哪种协议访问资源。网页上 HTTPS 已经是主流。
The `https://` at the start is the **scheme**, which says which protocol to use to reach the resource. On the web, HTTPS is now the norm.

| 协议 Scheme | 用途 Used for | 例子 Example |
| --- | --- | --- |
| `https://` | 加密的网页和 API Encrypted web pages and APIs | `https://neetcode.io` |
| `http://` | 未加密的网页，多见于本地开发 Unencrypted pages, mostly local development | `http://localhost:8080` |
| `ftp://` | 在服务器之间传文件 Transferring files between machines | `ftp://ftp.example.com/pub/file.txt` |
| `ssh://` | 安全的远程登录，Git 也用它 Secure remote login, also used by Git | `ssh://username@example.com:22` |

- **FTP 例子 The FTP example:** 用 FTP 协议连接 `ftp.example.com`，下载 `pub` 目录下的 `file.txt`。
  Connect to `ftp.example.com` over FTP and download `file.txt` from the `pub` directory.
- **SSH 例子 The SSH example:** 用户名是 `username`，服务器是 `example.com`，`:22` 是 SSH 的默认端口。
  The username is `username`, the server is `example.com`, and `:22` is SSH's default port.

### 5.2 🏷️ 域名 Domain

`domains.google.com` 分成三部分：
`domains.google.com` has three parts:

| 部分 Part | 本例 Here | 说明 What it means |
| --- | --- | --- |
| 子域名 Subdomain | `domains` | 网站里一个独立的分区，可以指向完全不同的服务器 A separate section of the site, which can point to a completely different server |
| 主域名 Registered domain | `google.com` | 网站的核心身份，在注册商那里注册的就是它 The site's core identity, the part you register at a registrar |
| 顶级域 Top-level domain | `.com` | 层级最高的部分（根之下） The highest level (just below the root) |

- **子域名不是路径 Subdomain vs path:** `domains.google.com` 和 `google.com/domains` 完全不同。子域名是 DNS 里的另一个名字，可以有自己的记录和服务器；路径只是同一台主机上的不同位置。
  `domains.google.com` and `google.com/domains` are completely different. A subdomain is another name in DNS, with its own records and servers; a path is just a location on the same host.
- **拥有主域名 Owning the registered domain:** 注册了 `google.com`，就能自由创建任意多个子域名（`mail.`、`docs.`……）和路径，不需要再找注册商。
  Once you register `google.com`, you can create as many subdomains (`mail.`, `docs.`, …) and paths as you like, without going back to the registrar.
- **顶级域的种类 Kinds of TLDs:** 通用顶级域如 `.com`、`.org`、`.dev`；国家和地区顶级域如 `.uk`、`.cn`。`.io` 本来是英属印度洋领地的国家域名，因为读起来像 “I/O”，很受科技公司欢迎。
  Generic TLDs like `.com`, `.org`, and `.dev`; country-code TLDs like `.uk` and `.cn`. `.io` is actually the country code for the British Indian Ocean Territory, popular with tech companies because it reads like "I/O".

### 5.3 🛣️ 路径、查询和片段 Path, query, and fragment

| 部分 Part | 本例 Here | 说明 What it means |
| --- | --- | --- |
| 路径 Path | `/get-started` | 用 `/` 分隔，指向网站里的某个页面或资源 Separated by `/`, it points to a page or resource on the site |
| 查询 Query | `?ref=nav` | 以 `?` 开头的 `key=value` 参数，用 `&` 连接 `key=value` parameters after `?`, joined by `&` |
| 片段 Fragment | `#faq` | 页面内的位置，**不会**发给服务器，由浏览器自己处理 A spot inside the page, **not** sent to the server; the browser handles it |

### 5.4 🚪 端口 Port

上一篇 [[Networking Basics|网络基础 Networking Basics]] 讲过，URL 里可以写端口，但通常省略，因为协议有默认端口：HTTP 是 **80**，HTTPS 是 **443**。输入 `https://neetcode.io`，浏览器就会连 443 端口。
As [[Networking Basics|网络基础 Networking Basics]] covered, a URL can include a port, but it's usually left out because each scheme has a default: **80** for HTTP and **443** for HTTPS. Type `https://neetcode.io` and the browser connects to port 443.

用非标准端口时必须写出来，比如本地开发服务器 `http://localhost:8080`：本机上有一个进程在 8080 端口监听 HTTP 请求，而不是默认的 80。
A non-standard port has to be written, as with a local dev server at `http://localhost:8080`: a process on your machine listens for HTTP requests on port 8080 instead of the default 80.

> [!tip] Java 类比 Java analogy
> `java.net.URI` 能把 URL 拆开：`URI.create("https://domains.google.com/get-started")` 的 `getScheme()` 是 `"https"`，`getHost()` 是 `"domains.google.com"`，`getPath()` 是 `"/get-started"`。没写端口时 `getPort()` 返回 `-1`，表示“用协议的默认端口”。
> `java.net.URI` splits a URL into parts: for `URI.create("https://domains.google.com/get-started")`, `getScheme()` is `"https"`, `getHost()` is `"domains.google.com"`, and `getPath()` is `"/get-started"`. With no port written, `getPort()` returns `-1`, meaning "use the scheme's default".

## 6. 🗺️ 把一切串起来 Putting It Together

浏览器打开 `https://neetcode.io/practice` 时：
When a browser opens `https://neetcode.io/practice`:

1. 🔗 **解析 URL Parse the URL:** 协议是 HTTPS，主机是 `neetcode.io`，没写端口所以用 443，路径是 `/practice`。
   The scheme is HTTPS, the host is `neetcode.io`, no port is written so it's 443, and the path is `/practice`.
2. 🔎 **DNS 查询 DNS lookup:** 先查缓存；没有的话由解析器经过根、`.io` 和权威服务器拿到 A 记录。
   Check the caches first; on a miss, the resolver walks the root, `.io`, and authoritative servers to get the A record.
3. 🤝 **建立连接 Connect:** 和这个 IP 的 443 端口做 TCP 握手和 TLS 握手。
   Do the TCP and TLS handshakes with port 443 at that IP.
4. 📤 **发送请求 Send the request:** `GET /practice`，并在 `Host` 头里带上 `neetcode.io`，让同一个 IP 上的服务器知道你要哪个网站。
   `GET /practice`, with `neetcode.io` in the `Host` header so a server hosting several sites on one IP knows which one you want.
5. 📥 **返回响应 Respond:** 服务器返回页面，浏览器再按 `#片段` 滚动到对应位置（如果有的话）。
   The server returns the page, and the browser scrolls to the `#fragment` if there is one.

## 7. ⚠️ 对课程原文的澄清 Clarifications to the Lesson Text

- **“ICANN 管理域名的运营” "ICANN manages the operation of domain names":** ICANN 是**协调者**：它制定政策、管理根区和认证注册商。每个顶级域由各自的**注册局**运营（比如 Verisign 运营 `.com`），注册商再把域名卖给我们。课程只讲了 ICANN 和注册商，漏掉了中间的注册局。
  ICANN is a **coordinator**: it sets policy, oversees the root zone, and accredits registrars. Each TLD is run by its own **registry** (Verisign runs `.com`, for example), and registrars sell names to us. The lesson covers ICANN and registrars but skips the registry in between.
- **“注册后就拥有了域名” "We gain ownership of the domain":** 更准确地说是按年**租用**注册权，到期不续费就会失去它。
  More precisely, you **rent** the registration by the year, and you lose it if you don't renew.
- **注册商的例子 The registrar examples:** Google Domains 已在 2023 年卖给 Squarespace，不再存在；HostGator 主要是主机商。现在常见的注册商有 GoDaddy、Namecheap、Cloudflare Registrar 和 Squarespace Domains。
  Google Domains was sold to Squarespace in 2023 and no longer exists, and HostGator is mainly a hosting company. Common registrars today include GoDaddy, Namecheap, Cloudflare Registrar, and Squarespace Domains.
- **“DNS 服务器把请求路由到服务器” "The DNS server routes your request to the server":** DNS 只负责**返回 IP 地址**，不转发请求。拿到 IP 后，客户端直接连服务器，请求由路由器沿 IP 路由送达。
  DNS only **returns the IP address**; it doesn't forward the request. Once the client has the IP, it connects to the server directly, and routers deliver the packets by IP.
- **“服务器 IP 是静态的才会缓存” "Your computer caches the IP if the server's IP is static":** 是否缓存、缓存多久由记录的 **TTL** 决定，与 IP 是否静态无关。浏览器、操作系统和解析器都会缓存。
  Whether and how long an answer is cached depends on the record's **TTL**, not on whether the IP is static. The browser, the OS, and the resolver all cache.
- **“服务器是有公网 IP 和域名的计算机” "A server is a computer with a public IP and a domain name":** 服务器只是响应请求的程序或机器。很多服务器只有私网 IP（比如在负载均衡器或数据库后面），也不一定有域名。
  A server is just a program or machine that responds to requests. Many servers have only private IPs (behind a load balancer, or a database, for example) and no domain name.
- **“.com 表示商业网站” "`.com` signifies commercial websites":** 历史上是这样，但现在任何人都能注册 `.com`，顶级域基本不再代表网站类型（`.gov`、`.edu` 这类受限顶级域除外）。
  Historically yes, but anyone can register a `.com` today, and TLDs mostly no longer say what kind of site it is (except restricted ones like `.gov` and `.edu`).
- **“主域名 google.com” "The primary domain google.com":** 常用的叫法是**注册域名**或**根域名**（apex）。严格说，`google` 是二级域。对 `bbc.co.uk` 这种情况，注册域名是 `bbc.co.uk`，因为 `co.uk` 整体充当后缀。
  The usual terms are **registered domain** or **apex domain**. Strictly, `google` is the second-level domain. For something like `bbc.co.uk`, the registered domain is `bbc.co.uk`, because `co.uk` acts as the suffix as a whole.
- **协议和 FTP Schemes and FTP:** scheme 不一定是网络协议（`mailto:`、`file:` 也是 scheme）。另外主流浏览器已在 2021 年前后移除了 FTP 支持，FTP 也不加密，现在多用 SFTP 或 HTTPS 传文件。
  A scheme isn't always a network protocol (`mailto:` and `file:` are schemes too). Major browsers also dropped FTP support around 2021, and FTP is unencrypted, so files usually move over SFTP or HTTPS today.
- **“localhost 在 8080 端口监听” "Our localhost is listening on port 8080":** 监听端口的是本机上的某个**进程**（比如开发服务器），`localhost` 只是指向本机的名字（`127.0.0.1` 或 `::1`）。完整 URL 是 `http://localhost:8080`，地址栏里能省略协议只是浏览器帮你补全了。
  What listens is a **process** on your machine (a dev server, say); `localhost` is just a name for the machine itself (`127.0.0.1` or `::1`). The full URL is `http://localhost:8080`; you can drop the scheme in the address bar only because the browser fills it in.
- **URL 的组成 URL parts:** 课程漏了**查询字符串**（`?key=value`）和**片段**（`#section`），它们在 API 设计里很常见，已在 5.3 节补上。
  The lesson leaves out the **query string** (`?key=value`) and the **fragment** (`#section`), which come up often in API design. Section 5.3 adds them.

## 8. 🧩 复习题 Review Questions

**Q1.** 浏览器第一次访问 `www.example.com`，DNS 查询会经过哪些服务器？ The first time a browser visits `www.example.com`, which servers does the DNS lookup go through?

> [!success]- 答案 Answer
> 先查浏览器和操作系统缓存，都没有就问递归解析器。解析器缓存也没有的话，依次问根服务器（得到 `.com` 服务器）、`.com` 顶级域服务器（得到 `example.com` 的权威服务器）和权威服务器（得到 A 或 CNAME 记录），然后按 TTL 缓存结果并返回。
> The browser and OS caches are checked first, then the recursive resolver. If the resolver has no cached answer, it asks a root server (which points to the `.com` servers), a `.com` TLD server (which points to `example.com`'s authoritative servers), and the authoritative server (which returns the A or CNAME record). It caches the answer for its TTL and returns it.

**Q2.** ICANN、注册局和注册商分别负责什么？ What do ICANN, a registry, and a registrar each do?

> [!success]- 答案 Answer
> ICANN 制定规则、协调全局并认证注册商；注册局运营一个顶级域，维护它下面所有域名的数据库；注册商面向用户，帮你注册和续费域名，并把信息提交给注册局。
> ICANN sets the rules, coordinates globally, and accredits registrars. A registry runs one TLD and keeps the database of every name under it. A registrar serves customers, registering and renewing names and passing the details to the registry.

**Q3.** 你要把网站迁到一台 IP 不同的新服务器，DNS 方面该怎么做才能少出问题？ You're moving a site to a new server with a different IP. What should you do with DNS to avoid trouble?

> [!success]- 答案 Answer
> 提前把 A 记录的 TTL 调低（比如从一天调到 60 秒），等旧 TTL 过期后再改 IP。切换期间新旧服务器都保持可用，因为有些客户端还会用缓存里的旧地址。稳定后再把 TTL 调回去。
> Lower the A record's TTL well ahead (say, from a day to 60 seconds), and change the IP after the old TTL has expired. Keep both servers up during the switch, since some clients will still use the cached old address. Raise the TTL again once things settle.

**Q4.** `blog.example.com` 和 `example.com/blog` 有什么区别？ How do `blog.example.com` and `example.com/blog` differ?

> [!success]- 答案 Answer
> `blog.example.com` 是子域名，是 DNS 里一个独立的名字，可以有自己的记录，指向完全不同的服务器。`example.com/blog` 是同一个主机上的路径，DNS 只解析 `example.com`，`/blog` 由那台服务器自己处理。
> `blog.example.com` is a subdomain, a separate name in DNS that can have its own records and point to a completely different server. `example.com/blog` is a path on the same host: DNS resolves only `example.com`, and that server handles `/blog` itself.

**Q5.** 为什么 `https://neetcode.io` 不用写端口，`http://localhost:8080` 却要写？ Why does `https://neetcode.io` need no port while `http://localhost:8080` does?

> [!success]- 答案 Answer
> 没写端口时浏览器用协议的默认端口，HTTPS 是 443、HTTP 是 80。`neetcode.io` 正好在 443 上提供服务，而本地开发服务器监听的是 8080，不是默认端口，所以必须写出来。
> With no port written, the browser uses the scheme's default: 443 for HTTPS and 80 for HTTP. `neetcode.io` serves on 443, but the local dev server listens on 8080, which isn't the default, so it has to be written.

**Q6.** URL 里的 `#faq` 会发给服务器吗？ Is the `#faq` in a URL sent to the server?

> [!success]- 答案 Answer
> 不会。片段只在浏览器里使用，用来跳到页面里的某个位置，或者给单页应用做客户端路由。查询字符串 `?ref=nav` 则会发给服务器。
> No. The fragment stays in the browser, where it jumps to a spot on the page or drives client-side routing in single-page apps. The query string `?ref=nav`, by contrast, is sent to the server.

## 9. 🔗 相关 Related

- ⬅️ 上一篇 Previous: [[TCP and UDP|TCP 与 UDP TCP and UDP]]
- [[Networking Basics|网络基础 Networking Basics]]
- [[📌 系统设计总览|系统设计总览 System Design Overview]]
