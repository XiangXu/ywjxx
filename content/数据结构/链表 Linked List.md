---
title: "链表 Linked List"
aliases:
  - 链表
  - Linked List
  - 单链表
  - Singly Linked List
  - 双向链表
  - Doubly Linked List
  - ListNode
  - Dummy Head
  - 哑节点
tags:
  - DSA
  - Data-Structures
  - Linked-List
  - Interview-Prep
created: 2026-10-26
publish: true
---

# 🔗 链表 Linked List

> [!abstract] TL;DR
> 链表是一串**节点**，每个节点存一个值和一个指向下一个节点的 `next` 引用，最后一个节点的 `next` 是 `null`。节点在内存里是分散的，所以**按下标访问是 O(1) 做不到**，要从头走 O(n)；但只要手里有某个节点，在它后面**插入或删除只要改指针，O(1)**。链表题的核心是**改指针之前别把后面的节点弄丢**。
> A linked list is a chain of **nodes**, each holding a value and a `next` reference; the last node's `next` is `null`. Nodes are scattered in memory, so **indexed access takes O(n)** from the head, but given a node, **inserting or deleting after it is O(1)**: just rewire pointers. The core of every linked-list problem is **not losing the rest of the list while you rewire**.

## 1. 🎯 核心概念 Overview

### 1.1 节点和指针 Nodes and pointers

```
head
 │
 ▼
┌───┬───┐   ┌───┬───┐   ┌───┬───┐
│ 1 │ ●─┼──►│ 2 │ ●─┼──►│ 3 │ ∅ │   ∅ = null
└───┴───┘   └───┴───┘   └───┴───┘
 val next
```

```java
// LeetCode 定义的简化版（省略了无参构造）Simplified LeetCode definition (no-arg constructor omitted)
public class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
```

- **`head`** 是唯一的入口。丢了 `head`（或者某个节点之后的引用），那部分链表就再也找不到了，Java 里会被 GC 回收。
  `head` is the only entry point. Lose it (or the reference past some node) and that part of the list is unreachable; in Java it gets garbage-collected.
- Java 的 `next` 是**引用**，相当于 C 里的指针。`a.next = b` 只是让箭头指向 `b`，不复制任何节点。
  In Java `next` is a **reference**, the equivalent of a C pointer. `a.next = b` points the arrow at `b`; nothing is copied.

### 1.2 单向、双向、循环 Singly, doubly, circular

| 类型 Type | 每个节点 Each node | 特点 Notes |
| --- | --- | --- |
| 单链表 Singly linked | `val`, `next` | LeetCode 最常见；只能往后走 most common on LeetCode; forward only |
| 双向链表 Doubly linked | `val`, `prev`, `next` | 给定节点可 O(1) 删除自己；Java 的 `LinkedList` 就是它 can delete itself in O(1); Java's `LinkedList` is one |
| 循环链表 Circular | 尾巴指回头 tail points back to head | 环形缓冲、约瑟夫问题 ring buffers, Josephus problem |

### 1.3 和数组比较 Compared with an array

| | [[数组 Array\|数组 Array]] | 链表 Linked List |
| --- | --- | --- |
| 内存 Memory | 连续 contiguous | 分散，每个节点多一个指针 scattered, an extra pointer per node |
| 按下标访问 Access by index | O(1) | O(n)，从头走 walk from the head |
| 头部插入/删除 Insert/delete at front | O(n)，要平移 shifting | O(1) |
| 已知节点后插入/删除 Insert/delete after a known node | O(n)，要平移 shifting | O(1) |
| 末尾追加 Append | 均摊 O(1) amortized | 有 `tail` 指针时 O(1)，否则 O(n) O(1) with a tail pointer, else O(n) |
| 缓存 Cache | 友好 friendly | 每个节点都可能 cache miss each node may miss |

> [!note] 链表的 O(1) 插入有前提 The O(1) insert has a catch
> “链表插入 O(1)”的前提是**已经拿到了那个位置的节点**。如果要先找到第 i 个位置，找的过程就是 O(n)。实际中由于缓存局部性，很多场景数组仍然更快（见 [[数组 Array|数组 Array]]）。
> "O(1) insert" assumes you **already hold the node** at that position. Finding position i first is O(n). Thanks to cache locality, arrays are often faster in practice anyway.

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - **题目直接给 `ListNode`** The input is a `ListNode`: 反转、合并、删除、找中点、判环 reverse, merge, delete, find the middle, detect a cycle → [[Reverse Linked List|206]]
  - **频繁在头部或中间插入删除，且已经拿到节点** Frequent inserts/deletes at the front or middle, with the node in hand
  - **哈希表 + 双向链表** Hash map + doubly linked list: O(1) 移动到最前 / 删除最旧的，LRU 缓存（146） → O(1) move-to-front and evict-oldest, the LRU cache
  - **实现栈或队列** Implementing a stack or queue: 头部插入删除都是 O(1)（见 [[栈 Stack|栈 Stack]]） → O(1) at the head
- ❌ 需要按下标随机访问、二分查找 → 用数组 Need random access or binary search → use an array

## 3. ⚙️ 原理 How It Works

### 3.1 改指针的顺序 The order of rewiring

所有链表操作都是改 `next`。规则只有一条：**先连上新的，再断开旧的**；要覆盖 `x.next` 之前，确认后面的节点还有别的引用指着。
Every operation rewires `next`. One rule: **connect the new link before breaking the old one**; before overwriting `x.next`, make sure something else still references the nodes after it.

```
在 a 后插入 x Insert x after a:          删除 a 的下一个 Delete the node after a:

  x.next = a.next;   ① 先连 connect first     a.next = a.next.next;   跳过它 skip it
  a.next = x;        ② 再改 then rewire

  a ──► b      →      a ──► x ──► b           a ──► b ──► c   →   a ─────► c
```

如果反过来先写 `a.next = x`，`b` 以及后面的节点就丢了。[[Reverse Linked List|206. 反转链表 Reverse Linked List]] 里先存 `next` 也是同一个道理。
Do `a.next = x` first and `b` (and everything after) is lost. Saving `next` first in 206 follows the same rule.

### 3.2 反转：三个指针 Reversal: three pointers

把链表看成两段：`prev` 开头的是**已反转**的，`curr` 开头的是**还没处理**的。每一步从未处理段的头上摘一个节点，调头接到已反转段前面。
Think of two lists: the **reversed** part starting at `prev`, and the **untouched** part starting at `curr`. Each step takes one node off the untouched part and puts it in front of the reversed part.

```
prev        curr   next
  ∅    1 ──► 2 ──► 3 ──► ∅          开始 start

∅ ◄── 1      2 ──► 3 ──► ∅          第 1 步后 after step 1
      prev   curr

∅ ◄── 1 ◄── 2 ◄── 3                结束 end: curr = ∅，prev = 3 是新头 is the new head
                  prev
```

### 3.3 哑节点 Dummy head

头节点可能被删除或替换时，在前面放一个假节点 `dummy`，所有节点（包括原来的头）就都有了“前一个节点”，不用单独处理头。最后返回 `dummy.next`。
When the head might be removed or replaced, put a fake `dummy` node in front so every node, the old head included, has a predecessor. No special case for the head; return `dummy.next`.

**拼一条新链表**时也一样：哑节点当作初始尾巴，配一个 `tail` 指针不断往后接，不用特判“结果还是空的”（[[Merge Two Sorted Lists|21. 合并两个有序链表 Merge Two Sorted Lists]]）。
The same goes for **building a new list**: the dummy is the first tail, and a `tail` pointer keeps appending, with no "result is still empty" special case.

把哑节点看成**下标 -1**：从它出发走 `i` 步，正好停在第 `i - 1` 个，也就是删除或插入第 `i` 个时需要站的位置（[[Design Singly Linked List|设计单链表 Design Singly Linked List]]）。
Treat the dummy as **index -1**: walking `i` steps from it lands on node `i - 1`, exactly where you must stand to remove or insert at position `i`.

### 3.4 尾指针 Tail pointer

多存一个指向最后一个节点的 `tail`，尾部追加就从 O(n) 变成 O(1)。代价是每个可能改变最后一个节点的操作都要维护它：往空链表插入时、删掉最后一个节点时（`tail` 退回前一个，删空了就退回哑节点）。忘了维护不会报错，新值会接到一个已经脱离链表的节点上，悄悄丢失。
Keeping a `tail` reference to the last node makes appending O(1) instead of O(n). The price: every operation that can change the last node must update it: inserting into an empty list and removing the last node (`tail` moves back to the predecessor, or to the dummy when the list becomes empty). Forgetting doesn't throw; new values get appended to a detached node and silently vanish.

### 3.5 快慢指针 Fast and slow pointers

链表不能用下标，找中点、找倒数第 k 个、判断有没有环都靠[[双指针 Two Pointers|双指针 Two Pointers]]：`slow` 每次走一步，`fast` 每次走两步。`fast` 到尾时 `slow` 在中间；有环的话两者一定会相遇（141）。
Without indices, finding the middle, the k-th from the end, or a cycle uses two pointers: `slow` moves one step, `fast` moves two. When `fast` reaches the end, `slow` is in the middle; if there's a cycle they must meet (141).

### 3.6 双向链表和双哨兵 Doubly linked list with two sentinels

每个节点多存一个 `prev`，头尾各放一个哨兵节点。真实节点的两个邻居永远存在，所以插入删除不用判断 `null`，也不用维护尾指针（最后一个节点就是 `dummyTail.prev`）。拿到一个节点就能 O(1) 删掉它自己，不用先找前一个（[[Design Linked List|707. 设计链表 Design Linked List]]，LRU 缓存 146）。
Each node also stores `prev`, and a sentinel sits at each end. A real node's two neighbors always exist, so inserts and deletes need no `null` checks and no tail pointer (the last node is just `dummyTail.prev`). Given a node, you can delete it in O(1) without finding its predecessor first (707, and the LRU cache in 146).

```
dummyHead ⇄ [1] ⇄ [2] ⇄ [3] ⇄ dummyTail
下标 -1                        下标 n
index -1                       index n

在 curr 前插入 node Insert node before curr:   删除 curr Delete curr:
  node.prev = curr.prev;                       curr.prev.next = curr.next;
  node.next = curr;                            curr.next.prev = curr.prev;
  curr.prev.next = node;
  curr.prev = node;     // 最后改 curr.prev last
```

把 `dummyTail` 看成下标 `n`：从第 0 个走 `i` 步，落在真实节点上才能读或删，落在 `dummyTail` 上可以插入（就是追加），走到 `null` 就是越界。
Treat `dummyTail` as index `n`: after `i` steps from node 0, reads and deletes need a real node, an insert may land on `dummyTail` (an append), and reaching `null` means out of bounds.

## 4. 💻 模板代码 Code Template

```java
// ①–④ 是互相独立的片段 ①–④ are independent snippets

// ① 遍历 Traverse
for (ListNode p = head; p != null; p = p.next) {
    // 用 p.val use p.val
}

// ② 反转（迭代）Reverse, iterative
ListNode prev = null, curr = head;
while (curr != null) {
    ListNode next = curr.next;   // 先存 save first
    curr.next = prev;            // 调头 flip
    prev = curr;
    curr = next;
}
// prev 是新头 prev is the new head

// ③ 哑节点：删除所有值为 val 的节点 Dummy head: remove every node equal to val (203)，val 是方法参数 val is the method parameter
ListNode dummy = new ListNode(0, head);
ListNode p = dummy;
while (p.next != null) {
    if (p.next.val == val) {
        p.next = p.next.next;    // 删除 p 的下一个，p 不动 delete p's next; p stays
    } else {
        p = p.next;
    }
}
return dummy.next;               // 头可能被删了，别返回 head the head may be gone; don't return head

// ④ 快慢指针找中点 Middle with fast/slow pointers (876)
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
}
// 偶数个节点时 slow 停在后半段的第一个 for an even count, slow is the second middle
```

## 5. ⏱️ 复杂度 Complexity

| 操作 Operation | ⏱️ Time | 🗄️ Space |
| --- | --- | --- |
| 访问第 i 个 Access the i-th node | O(n) | O(1) |
| 查找值 Search for a value | O(n) | O(1) |
| 头部插入/删除 Insert/delete at head | O(1) | O(1) |
| 已知节点后插入/删除 Insert/delete after a known node | O(1) | O(1) |
| 反转（迭代 / 递归） Reverse (iterative / recursive) | O(n) | O(1) / O(n) 调用栈 call stack |
| 整个链表 The whole list | | O(n) |

## 6. ⚠️ 常见坑 Common Pitfalls

- **改指针前没存后面的节点 Losing the rest of the list:** 先 `next = curr.next` 再改 → save `curr.next` before overwriting it, see [[Reverse Linked List|206]].
- **`null.next` 空指针 NPE on `null.next`:** 访问 `p.next.next` 之前确认 `p.next != null`；快慢指针的循环条件是 `fast != null && fast.next != null` → check `p.next != null` before `p.next.next`.
- **空链表和单节点 Empty and single-node lists:** 每次写完都用 `[]`、`[1]`、`[1, 2]` 过一遍 → test with `[]`, `[1]` and `[1, 2]` every time.
- **忘了断开旧指针，形成环 Forgetting to cut the old pointer:** 反转、重排时新尾巴的 `next` 要设成 `null`，否则遍历死循环 → set the new tail's `next` to `null`, or traversal loops forever (206's `head.next = null`).
- **删除时停错了位置 Stopping in the wrong place to remove:** 要站在目标的**前一个**节点上改 `prev.next`；从哑节点出发走 `i` 步正好到第 `i - 1` 个 → stand on the node **before** the target; `i` steps from the dummy gets you there, see [[Design Singly Linked List|设计单链表 Design Singly Linked List]].
- **有尾指针却没维护 A tail pointer you forgot to update:** 删掉最后一个节点后 `tail` 要退回前一个 → after removing the last node, move `tail` back to the predecessor.
- **双向链表少改一个指针 One pointer short in a doubly linked list:** 插入要改四个指针、删除改两个，漏了 `prev` 正向遍历看不出来，但之后的插入会出错 → an insert updates four pointers and a delete two; a missed `prev` is invisible going forward but breaks later inserts, see [[Design Linked List|707]].
- **头节点可能变化却返回了 `head`** Returning `head` when the head changed: 用 dummy，返回 `dummy.next` → use a dummy and return `dummy.next`.
- **拼接时尾巴没前进 Not advancing the tail while building:** 每接一个节点都要 `tail = tail.next`，否则一直覆盖同一个 `next`（[[Merge Two Sorted Lists|21]]） → after each attach, `tail = tail.next`, or you keep overwriting the same `next`.
- **`LinkedList.get(i)` 是 O(n) 的 `LinkedList.get(i)` is O(n)**: 在循环里 `list.get(i)` 整体变 O(n²)；要遍历用迭代器或 for-each → looping with `get(i)` is O(n²); use an iterator or for-each.
- **递归太深 Recursion too deep:** 递归处理链表每个节点一层，很长的链表可能 `StackOverflowError` → one frame per node; very long lists can overflow, see [[递归 Recursion|递归 Recursion]].

## 7. ❓ 复习题 Review Questions

**Q1.** 链表“插入 O(1)”有什么前提？ When is a linked-list insert really O(1)?

> [!success]- 答案 Answer
> 已经拿到了插入位置的前一个节点（或用双向链表拿到了那个节点本身）。如果要先从头找到第 i 个位置，查找就是 O(n)。
> When you already hold the node before the insertion point (or, in a doubly linked list, the node itself). If you first have to find position i from the head, that search is O(n).

**Q2.** 在 `a` 后面插入 `x`，两行代码的顺序为什么不能反？ Why can't the two lines of "insert x after a" be swapped?

> [!success]- 答案 Answer
> 先写 `a.next = x` 的话，原来的 `a.next`（以及后面整段）就没有引用了，`x.next = a.next` 只会让 `x` 指向自己。必须先 `x.next = a.next` 再 `a.next = x`。
> With `a.next = x` first, the old `a.next` (and everything after) has no reference left, and `x.next = a.next` would make `x` point at itself. Do `x.next = a.next` first, then `a.next = x`.

**Q3.** 什么时候用哑节点？ When do you use a dummy head?

> [!success]- 答案 Answer
> 头节点可能被删除、替换，或者要从空开始拼一条新链表时（合并、过滤）。dummy 让头节点也有“前一个”，省掉特殊判断，最后返回 `dummy.next`。
> When the head might be deleted or replaced, or you're building a new list from scratch (merging, filtering). The dummy gives the head a predecessor, removing special cases; return `dummy.next`.

**Q4.** 链表和数组遍历都是 O(n)，为什么数组实际更快？ Both are O(n) to scan; why is an array faster in practice?

> [!success]- 答案 Answer
> 数组连续存放，一条 cache line 能带进多个元素，CPU 还能预取；链表节点分散，每走一步都可能是一次缓存未命中。
> Arrays are contiguous, so one cache line brings in several elements and the CPU can prefetch. Linked-list nodes are scattered, so each step may be a cache miss.

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices | 难度 Difficulty |
| --- | --- | --- |
| ✅ [[Reverse Linked List\|206. 反转链表 Reverse Linked List]] | 指针反转，迭代 + 递归 pointer reversal, iterative + recursive | Easy |
| ✅ [[Design Singly Linked List\|设计单链表 Design Singly Linked List]] | 哑节点 + 尾指针，停在前一个删除 dummy head + tail pointer, remove from the predecessor | Easy |
| ✅ [[Merge Two Sorted Lists\|21. 合并两个有序链表 Merge Two Sorted Lists]] | 哑节点拼新链表；递归版 dummy head to build a list; also recursive | Easy |
| ✅ [[Design Linked List\|707. 设计链表 Design Linked List]] | 双向链表加双哨兵，站在目标上删除 doubly linked list with two sentinels, delete by standing on the target | Medium |
| 203. Remove Linked List Elements | 哑节点删除 dummy head deletion | Easy |
| 876. Middle of the Linked List | 快慢指针 fast/slow pointers | Easy |
| 141. Linked List Cycle | 快慢指针判环 cycle detection | Easy |
| 234. Palindrome Linked List | 找中点 + 反转后半段 middle + reverse | Easy |
| 19. Remove Nth Node From End of List | 前后指针相隔 n 步 two pointers n apart | Medium |
| 92. Reverse Linked List II | 局部反转 partial reversal | Medium |
| 146. LRU Cache | 哈希表 + 双向链表 hash map + doubly linked list | Medium |

## 9. 🔗 相关 Related

- [[📌 数据结构总览]]
- 对比 Compare with: [[数组 Array|数组 Array]]（连续内存 vs 分散节点 contiguous vs scattered）
- 数据结构 Data structures: [[栈 Stack|栈 Stack]]（可以用链表实现 can be linked-list-backed）
- 算法 Algorithms: [[递归 Recursion|递归 Recursion]]（链表天然是递归结构 a list is a node plus a smaller list） · [[双指针 Two Pointers|双指针 Two Pointers]]（快慢指针 fast/slow） · [[复杂度分析 Big-O|复杂度分析 Big-O]]
