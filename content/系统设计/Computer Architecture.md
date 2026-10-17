---
title: "Computer Architecture"
aliases:
  - 计算机架构
  - Computer Components
  - Memory Hierarchy
tags:
  - System-Design
  - Computer-Architecture
  - Interview-Prep
created: 2026-10-17
---
# 🖥️ Computer Architecture

> [!abstract] One-line summary
> Storage is a trade-off: **the faster the memory, the smaller and more expensive it is**. The CPU sits in the middle and moves data between the layers.

## 1. TL;DR

- 💾 **Disk** (HDD/SSD): huge (TBs), cheap, slow, **persistent**.
- ⚡ **RAM**: medium (GBs), fast, **volatile**. It holds running programs and their variables.
- 🚀 **CPU cache** (L1/L2/L3): tiny (KBs to tens of MBs), fastest, checked first on every read.
- 🧠 **CPU**: executes instructions and moves data between RAM and disk. RAM and disk never talk directly.
- 📈 **Moore's Law**: transistor counts double about every 2 years. Clock speed has plateaued.

## 2. Units Refresher

A **bit** (0 or 1) is the smallest unit. 1 **byte** = 8 bits.

| Size unit | Bytes | Example |
| --- | --- | --- |
| KB (kilobyte) | $10^3$ | CPU L1 cache |
| MB (megabyte) | $10^6$ | CPU L3 cache |
| GB (gigabyte) | $10^9$ (one billion) | RAM, USB drive |
| TB (terabyte) | $10^{12}$ (one trillion) | Disk |

| Time unit | Seconds | Typical for |
| --- | --- | --- |
| Millisecond (ms) | $1/10^3$ | Disk access |
| Microsecond (µs) | $1/10^6$ | Writing 1 MB to RAM |
| Nanosecond (ns) | $1/10^9$ | RAM access, CPU instruction, cache hit |

## 3. How the Parts Connect

```mermaid
flowchart LR
    RAM["⚡ RAM<br/>Volatile working memory<br/>GBs · µs"]
    subgraph CPU["🧠 CPU — fetch, decode, execute"]
        Cache["🚀 L1 / L2 / L3 cache<br/>On the CPU die · fastest"]
    end
    Disk["💾 Disk (HDD / SSD)<br/>Persistent storage<br/>TBs · ms"]

    RAM <-- data --> CPU
    CPU <-- data --> Disk
    RAM -. "❌ no direct link" .- Disk
```

> [!important] Key rule
> RAM and disk **never talk directly**. Every transfer between them goes through the CPU.

On a read, the CPU checks **cache → RAM → disk**, in that order.

## 4. Components

### 4.1 💾 Disk

The disk is the computer's primary **persistent** storage. Data survives whether the machine is on or off. Modern disks hold TBs. A USB drive holds GBs.

| | HDD (hard disk drive) | SSD (solid-state drive) |
| --- | --- | --- |
| How it works | Mechanical: spinning platters + a read/write head | Electronic, no moving parts (similar to RAM) |
| Speed | Slower | Much faster |
| Aging | Wear and tear slows it down over time | No mechanical wear |
| Cost | Cheaper per GB | Costs more |
| Popularity | Declining | Now the common default |

### 4.2 ⚡ RAM (Random Access Memory)

RAM is the fast, **volatile** working memory where running programs live. Its contents are erased when the computer shuts down, which is why you save work to disk.

- **Size:** typically 1 GB to 128 GB. It is much more expensive per byte than disk.
- **Speed:** writing 1 MB takes microseconds in RAM vs milliseconds on disk, about **1,000× faster**.
- **Holds:** open applications and the variables your program allocates.

> [!note]
> These numbers are rough estimates and change as hardware improves.

### 4.3 🧠 CPU (Central Processing Unit)

The CPU is the "brain" of the computer. It does every computation and reads and writes both RAM and disk.

When you run code, it is translated into binary instructions stored in RAM. The CPU then repeats one cycle:

```mermaid
flowchart LR
    F["1️⃣ Fetch<br/>next instruction from RAM"] --> D["2️⃣ Decode<br/>into an operation"] --> E["3️⃣ Execute<br/>read/write RAM or disk"]
    E -- repeat --> F
```

At the lowest level, every instruction is just bytes. The CPU also contains a **cache** on the same chip (die).

### 4.4 🚀 Caches

A cache keeps a small copy of frequently used data in faster storage, so most reads skip the slow trip.

**CPU caches (L1, L2, L3)**
- Much faster than RAM, but they store only KBs to tens of MBs. L1 is the smallest and fastest; L3 is the largest and slowest.
- On a read, the cache is checked before RAM and disk. A **cache hit** (the data is present and still valid) avoids going to RAM.
- They are fast partly because they sit on the CPU die and partly because they are built from **SRAM**. Main memory uses DRAM.

**Caching beyond hardware**
- A web browser caches HTML, CSS, JavaScript, and images so repeat visits load faster.
- The browser's cache lives on **disk**. Disk is slow next to RAM but fast next to a network request.

> [!tip] General pattern
> Cache = put the data **one level closer** than the slow source.

### 4.5 🧱 L1 / L2 / L3 Cache at a Glance

Modern CPUs have several **cores**, and the three cache levels are arranged around them. Each core has its own small, fast L1 and L2. All cores share one larger L3.

```mermaid
flowchart TB
    subgraph CPU["🧠 CPU chip"]
        direction TB
        subgraph C1["Core 1"]
            direction TB
            L1a["L1 (private)<br/>instructions + data"] --> L2a["L2 (private)"]
        end
        subgraph C2["Core 2"]
            direction TB
            L1b["L1 (private)<br/>instructions + data"] --> L2b["L2 (private)"]
        end
        L2a --> L3["L3 (shared by all cores)"]
        L2b --> L3
    end
    L3 --> RAM["⚡ RAM"]
```

| Level | Typical size | Typical latency | Shared? | Role |
| --- | --- | --- | --- | --- |
| **L1** | ~32–64 KB per core | ~1 ns (a few cycles) | Private to one core | Split into an instruction cache and a data cache. Holds what the core is using right now |
| **L2** | ~256 KB–2 MB per core | ~4 ns | Private to one core | Backup for L1. Catches most of what L1 misses |
| **L3** | ~8–64 MB per chip | ~10–40 ns | Shared by all cores | Last stop before RAM. Lets cores share data without a trip to memory |

> [!note]
> Sizes and latencies are typical modern values and vary a lot by CPU model.

**How a lookup works**

```mermaid
flowchart LR
    Req["CPU needs data"] --> L1{"In L1?"}
    L1 -- hit --> Done["✅ Use it"]
    L1 -- miss --> L2{"In L2?"}
    L2 -- hit --> Done
    L2 -- miss --> L3{"In L3?"}
    L3 -- hit --> Done
    L3 -- miss --> RAM["Fetch from RAM<br/>and copy into the caches"] --> Done
```

**Key ideas**
- **Hit vs miss:** a *hit* finds the data at that level. A *miss* falls through to the next, slower level. A miss all the way to RAM costs about 100× an L1 hit.
- **Cache line:** data moves between levels in fixed blocks, usually **64 bytes**, not one byte at a time. Reading one value also brings its neighbors along.
- **Locality** is why caches work:
    - *Temporal*: data used recently is likely to be used again soon, such as a loop counter.
    - *Spatial*: data near recently used data is likely next, such as the next element of an array.
- **Managed by hardware:** programs don't choose what goes in L1/L2/L3. The CPU decides and evicts old data automatically.

> [!example] Why programmers care
> Iterating an array in order is fast: each 64-byte cache line serves several elements (spatial locality). Jumping randomly through memory, such as following linked-list pointers, causes many misses and can be several times slower for the same amount of work.

## 5. The Memory Hierarchy

```mermaid
flowchart TB
    L1["L1 cache · ~64 KB · ~1 ns"] --> L2["L2 cache · ~1 MB · ~4 ns"]
    L2 --> L3["L3 cache · ~32 MB · ~30 ns"]
    L3 --> RAM["RAM · 8–128 GB · ~100 ns"]
    RAM --> SSD["SSD · ~1 TB · ~100 µs"]
    SSD --> HDD["HDD · 1–20 TB · ~10 ms"]

    classDef fast fill:#0071e31a,stroke:#0071e3
    classDef slow fill:#ff3b301a,stroke:#ff3b30
    class L1,L2,L3 fast
    class SSD,HDD slow
```

⬇️ Going down: **bigger, cheaper per byte, slower**. The biggest jump is RAM → SSD, about **1,000×** slower.

> [!info] Source of these figures
> The latency and size figures are approximate values for a modern computer, added for context. The lesson itself only gave µs (RAM) vs ms (disk).

## 6. 📈 Moore's Law

Moore's Law is an observation, not a physical law: **the number of transistors on a chip doubles about every two years**. The curve looks linear on a log-scale chart, but the growth is exponential.

| Year | Chip | Transistors (approx.) |
| --- | --- | --- |
| 1971 | Intel 4004 | 2,300 |
| 1978 | Intel 8086 | 29,000 |
| 1985 | Intel 386 | 275,000 |
| 1989 | Intel 486 | 1.2M |
| 1993 | Pentium | 3.1M |
| 2000 | Pentium 4 | 42M |
| 2006 | Core 2 Duo | 291M |
| 2010 | Core i7-980X | 1.17B |
| 2020 | Apple M1 | 16B |
| 2023 | Apple M2 Ultra | 134B |

$$
N(t) \approx N_0 \times 2^{(t - t_0)/2}
$$

From 2,300 in 1971, that formula predicts about 150B by 2023. The actual M2 Ultra has about 134B, so the trend still holds.

> [!warning] What actually plateaued
> Since about 2005, **clock speed and single-core performance** have stopped climbing, not transistor count. Extra transistors now go into more cores and bigger caches. To go faster, you work in parallel or on more machines, which leads to distributed systems.

## 7. ⚠️ Corrections to the Lesson Text

- **"CPU computations take milliseconds."** Too slow by about a million. A single CPU instruction takes under a **nanosecond**; a modern CPU runs billions per second.
- **"The operating system decides what goes in the CPU cache."** L1/L2/L3 are managed by the **hardware** automatically. The OS manages other caches, such as the page cache for disk files.
- **"The cost of computers halves."** Moore's Law is about transistor count. Cheaper computing per transistor followed from it, but halving cost is not part of the law itself.

## 8. 🏗️ Why This Matters for System Design

The same trade-off between speed, size, cost, and durability appears again at the scale of whole systems:

| Computer level | System design equivalent | Principle |
| --- | --- | --- |
| Disk | Databases, object storage | Persist anything you can't lose |
| RAM | Redis, Memcached | Keep hot data in memory |
| CPU cache | CDN, browser cache | Cache close to the reader |
| Moore's Law slowdown | Distributed systems | Scale out when one machine stops getting faster |

## 9. 🧩 Review Questions

**Q1. Why can't RAM replace disk entirely?**

> [!success]- Answer
> RAM is volatile (it loses data on power off) and much more expensive per byte.

**Q2. What component moves data between RAM and disk?**

> [!success]- Answer
> The CPU. RAM and disk never communicate directly.

**Q3. In what order are cache, RAM, and disk checked on a read?**

> [!success]- Answer
> Cache → RAM → disk.

**Q4. Why does a browser cache to disk instead of RAM?**

> [!success]- Answer
> The cache must survive restarts, and disk is still far faster than a network request.

**Q5. Why is an SSD faster than an HDD?**

> [!success]- Answer
> An SSD reads and writes electronically. An HDD must physically move a read/write head over spinning platters.

**Q6. Which cache levels are private to a core, and which is shared?**

> [!success]- Answer
> L1 and L2 are private to each core. L3 is shared by all cores on the chip.

**Q7. Why is looping over an array in order faster than following linked-list pointers?**

> [!success]- Answer
> Data moves in 64-byte cache lines, so one fetch brings in several neighboring array elements (spatial locality). Linked-list nodes are scattered in memory, so almost every step is a cache miss.

## 10. 🔗 Related

- [[📌 系统设计总览]]
- Next up: application architecture and distributed systems
