---
title: "递归 Recursion"
aliases:
  - 递归
  - Recursion
  - Base Case
  - 递归出口
  - Recursive Leap of Faith
  - 调用栈
  - Call Stack
  - 递归树
  - Recursion Tree
tags:
  - DSA
  - Algorithms
  - Recursion
  - Interview-Prep
created: 2026-10-26
publish: true
---

# 🌀 递归 Recursion

> [!abstract] TL;DR
> 递归就是函数调用自己去解决**规模更小的同一个问题**。写递归只回答三个问题：**① 函数的合同是什么**（输入什么、返回什么）、**② 最小的情况怎么直接回答**（base case）、**③ 拿到子问题的结果后，本层怎么得出自己的结果**。写的时候**相信子调用按合同返回**，不要在脑子里展开每一层。在 Java 里空间至少是 O(递归深度)，因为每层都占[[栈 Stack|调用栈]]的一帧。
> Recursion is a function calling itself on **a smaller instance of the same problem**. Writing one means answering three questions: **① what's the contract** (input, return value), **② how is the smallest case answered directly** (the base case), and **③ given the subproblem's result, how does this level produce its own**. While writing, **trust the child call to keep the contract** instead of unrolling every level in your head. In Java, space is at least O(depth), since each level takes a frame on the call stack.

## 1. 🎯 核心概念 Overview

### 1.1 两部分 Two parts

| 部分 Part | 作用 What it does | 在 [[Reverse Linked List\|206]] 里 In 206 |
| --- | --- | --- |
| **递归出口 Base case** | 不再调用自己，直接返回答案 answers directly, no further call | `head == null \|\| head.next == null` → `return head` |
| **递归步骤 Recursive case** | 调用自己解决更小的问题，再结合本层 call itself on a smaller problem, then combine | `reverseList(head.next)`，再把自己接到尾巴 then attach itself at the tail |

每次递归调用都必须**更接近** base case（链表变短、`n` 变小、树变矮），否则永远停不下来。
Every recursive call must move **closer** to the base case (a shorter list, a smaller `n`, a shallower tree), or it never stops.

> [!tip] 🎁 礼物盒比喻 The gift box analogy
> 你收到一个礼物盒，打开后里面不是礼物，而是两个小盒子。打开这两个小盒子，一个里面是礼物，另一个里面还有更小的盒子……盒子只有两种：
> You open a gift box and find two smaller boxes instead of a gift. Open those: one holds the gift, the other holds yet another box. There are only two kinds of boxes:
>
> - **直接装着礼物的盒子 = base case:** 打开就有答案，不用再拆 the answer is right there; stop unwrapping
> - **装着更多盒子的盒子 = recursive case:** 要继续拆小盒子，拆完才知道里面是什么 keep unwrapping the smaller boxes before you know what's inside
>
> 盒子一层比一层小，最后一定会拆到礼物，这就是“每次调用都要更接近 base case”。如果盒子永远拆不完，礼物就永远找不到，程序里就是 `StackOverflowError`。
> Each box is smaller than the last, so you eventually reach a gift: that's "every call moves closer to the base case". If the boxes never ended, you'd never find the gift; in code, that's a `StackOverflowError`.

### 1.2 相信合同 Trust the contract (recursive leap of faith)

这是最难但最重要的一点。站在某一层看，子调用就是一个**已经写好、能用的函数**：只关心它的**结果**，不关心它的**过程**。
This is the hardest and most important part. From any one level, the child call is **a finished function that works**: care about its **result**, not its **process**.

> [!important] “只管自己这一层”是什么意思 What "only handle your own level" means
> 不是“不关心下面传上来的东西”，而是**按合同使用子调用的结果，不去追踪它怎么算出来**。
> Not "ignore what comes back from below", but **use the child's result according to the contract, without tracing how it was computed**.
>
> 例如 [[Reverse Linked List|206]]：`newHead` 是“子链表反转后的头”。本层把自己接到**尾巴**上，头不受影响，所以本层自己推出“整条链表的新头还是 `newHead`”，于是 `return newHead`。它看起来像从最底层一路传上来，其实每一层都在做同样的推理。
> In 206, `newHead` is "the head of the reversed sublist". This level attaches itself at the **tail**, so the head is unaffected; the level concludes for itself that the whole list's new head is still `newHead` and returns it. It looks like a value passed straight up, but every level makes the same deduction.

这和数学归纳法是同一个思路：证明 n = 1 成立（base case），再证明“如果 n − 1 成立，那么 n 也成立”（递归步骤），就对所有 n 成立。
It's the same idea as mathematical induction: prove the base case, prove "if it holds for n − 1, it holds for n", and it holds for every n.

### 1.3 调用栈 The call stack

每次调用都会在[[栈 Stack|调用栈]]上压一帧（参数、局部变量、返回地址），返回时弹出。所以递归有两个阶段：**“递”**（一路调用下去，直到 base case）和**“归”**（一层层返回）。
Each call pushes a frame (parameters, locals, return address) onto the call stack, popped on return. So recursion has two phases: going **down** until the base case, and **unwinding** back up.

```
reverseList(1)                      ┐
  reverseList(2)                    │ 递 going down：一层层压栈 frames pushed
    reverseList(3) → 触底，返回 3    ┘ base case
  ← 2 这层：3.next = 2，返回 3       ┐ 归 unwinding：一层层弹栈 frames popped
← 1 这层：2.next = 1，返回 3         ┘ 206 的活都在这里做 206 does its work here
```

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - **数据结构本身是递归的** The structure is recursive: 链表 = 一个节点 + 一条更短的链表；树 = 根 + 左子树 + 右子树 → a list is a node plus a shorter list; a tree is a root plus two subtrees → [[Reverse Linked List|206]]、104、226
  - **问题能拆成同样的小问题** The problem splits into smaller copies of itself: 分治（归并排序、快速幂） divide and conquer (merge sort, fast power)
  - **要枚举所有可能** Enumerate all possibilities: 回溯（子集、排列） backtracking (subsets, permutations)
  - **递推公式** A recurrence: `f(n) = f(n-1) + f(n-2)` → 递归 + 记忆化，再往后就是动态规划 recursion + memoization, which leads to DP
- ❌ 深度可能很大（如十万个节点的链表）且有简单循环写法 → 用迭代，避免栈溢出 Very deep and a simple loop exists → iterate to avoid stack overflow

## 3. ⚙️ 原理 How It Works

### 3.1 写递归的三步 Three steps to write one

1. **定合同 Define the contract:** 用一句话写下函数做什么、返回什么。如 “`reverseList(x)` 反转从 `x` 开始的链表，返回新头”。
   Write one sentence: what it does and returns, e.g. "`reverseList(x)` reverses the list starting at `x` and returns the new head".
2. **找出口 Find the base case:** 最小的、能直接回答的输入是什么？通常是 `null`、空、`n == 0` 或只剩一个元素。**要覆盖所有最小输入**（206 里空链表和单节点都要处理）。
   What's the smallest input you can answer directly? Usually `null`, empty, `n == 0` or one element. **Cover every minimal input** (in 206, both the empty list and a single node).
3. **写本层 Write this level:** 假设子调用已经按合同返回了结果，本层怎么用它加上自己，得到符合合同的结果？
   Assuming the child returned a correct result, how does this level combine it with itself to keep the contract?

### 3.2 前序 vs 后序：活在哪做 Pre-order vs post-order: where the work happens

| | 在递归调用之前干活 Work before the call | 在递归调用之后干活 Work after the call |
| --- | --- | --- |
| 叫法 Name | 前序 / 自顶向下 pre-order, top-down | 后序 / 自底向上 post-order, bottom-up |
| 信息流向 Information flows | 父 → 子，靠参数传下去 parent → child via parameters | 子 → 父，靠返回值交上来 child → parent via the return value |
| 例子 Example | 打印链表、带 `prev` 参数的反转写法 print a list, the reversal with a `prev` parameter | [[Reverse Linked List\|206]] 的 `newHead` 写法、104 maxDepth |

### 3.3 子结果怎么用 Using the child's result

所有后序递归都是“**拿到子结果 → 结合自己 → 得出本层结果**”，区别只在加工多少：
Every post-order recursion is "**take the child's result → combine with yourself → this level's result**". They differ only in how much processing happens:

```java
return Math.max(left, right) + 1;   // 104 maxDepth: 加工 +1 processed
return newHead;                     // 206 reverseList: 不用加工 passed through unchanged
return l1.val + sum(l1.next);       // 链表求和 list sum: 加上自己 add yourself
```

## 4. 💻 模板代码 Code Template

```java
// 通用模板 General template
ReturnType solve(Input x) {
    // ① 出口：最小情况直接回答 base case: answer directly
    if (isSmallest(x)) return directAnswer(x);

    // ② 相信合同：子问题按定义返回正确结果 trust the contract for the smaller input
    ReturnType sub = solve(smaller(x));

    // ③ 结合自己，得出本层结果 combine with this level
    return combine(x, sub);
}

// 例 1：链表反转（后序）Example 1: reverse a list (post-order), 206
ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}

// 例 2：二叉树最大深度（后序）Example 2: max depth of a binary tree (post-order), 104
int maxDepth(TreeNode root) {
    if (root == null) return 0;
    int l = maxDepth(root.left);
    int r = maxDepth(root.right);
    return Math.max(l, r) + 1;
}

// 例 3：记忆化，避免重复子问题 Example 3: memoization to avoid repeated subproblems, 509
int fib(int n, int[] memo) {          // memo 长度 n + 1，初始全 0 memo has length n + 1, all zeros
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];  // 算过就直接用 reuse if computed
    return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}
```

## 5. ⏱️ 复杂度 Complexity

- **时间 Time ≈ 调用次数 × 每次调用的工作量** number of calls × work per call. 画出递归树来数调用次数。
  Draw the recursion tree to count calls.
- **空间 Space ≈ 最大递归深度 × 每帧大小** max depth × frame size, 再加上额外分配的内存 plus anything allocated. 即使没 `new` 任何对象，深度 d 也要 O(d)（见 [[复杂度分析 Big-O|复杂度分析 Big-O]]）。
  Even with no `new`, depth d costs O(d).

| 例子 Example | 调用次数 Calls | ⏱️ Time | 🗄️ Space（深度 depth） |
| --- | --- | --- | --- |
| [[Reverse Linked List\|206]] 反转链表 Reverse Linked List | n | O(n) | O(n) |
| 104 树的最大深度 Maximum Depth of Binary Tree | n（每个节点一次 once per node） | O(n) | O(h)，h 是树高（平衡时 O(log n)，链状时 O(n)） O(h) for tree height h (balanced O(log n), skewed O(n)) |
| 509 朴素斐波那契 Naive Fibonacci | 约 φⁿ ≈ 1.618ⁿ，通常写成上界 O(2ⁿ)，更紧的界是 O(φⁿ) About φⁿ ≈ 1.618ⁿ, usually written as the upper bound O(2ⁿ); the tighter bound is O(φⁿ) | O(2ⁿ) | O(n) |
| 509 记忆化 memoized | 每个 n 算一次 each n once | O(n) | O(n) |

> [!example] 递归树 Recursion tree: `F(5)`，`F(n) = F(n-1) + F(n-2)`，`F(0) = 0`，`F(1) = 1`
>
> ```
> F(5) = 3 + 2 = 5
> ├── F(4) = 2 + 1 = 3
> │   ├── F(3) = 1 + 1 = 2         ← 第一次算 F(3) first time
> │   │   ├── F(2) = 1 + 0 = 1
> │   │   │   ├── F(1) = 1  🎁
> │   │   │   └── F(0) = 0  🎁
> │   │   └── F(1) = 1  🎁
> │   └── F(2) = 1 + 0 = 1
> │       ├── F(1) = 1  🎁
> │       └── F(0) = 0  🎁
> └── F(3) = 1 + 1 = 2             ← 又算一次 F(3) computed again
>     ├── F(2) = 1 + 0 = 1
>     │   ├── F(1) = 1  🎁
>     │   └── F(0) = 0  🎁
>     └── F(1) = 1  🎁
> ```
>
> 🎁 = base case，直接返回。“递”是从上往下拆，“归”是从叶子往上把子结果加起来。
> 🎁 = base case, returned directly. Going down splits the problem; unwinding adds the child results back up from the leaves.
>
> - **时间 Time:** 一共 15 次调用，`F(3)` 算了 2 次、`F(2)` 算了 3 次。n 越大重复越多，调用次数指数增长；记忆化后每个 `F(k)` 只算一次。
>   15 calls: `F(3)` is computed twice and `F(2)` three times. Repeats grow with n, so calls grow exponentially; with memoization each `F(k)` is computed once.
> - **空间 Space:** 树有很多节点，但同一时刻调用栈上只有**一条从根到叶子的路径**，最长 5 层（`F(5) → F(4) → F(3) → F(2) → F(1)`），所以空间是 O(n)，不是 O(2ⁿ)。
>   The tree has many nodes, but the call stack only ever holds **one root-to-leaf path**, at most 5 frames deep, so space is O(n), not O(2ⁿ).

## 6. ⚠️ 常见坑 Common Pitfalls

- **没有出口或出口不全 Missing or incomplete base case:** 无限递归 → `StackOverflowError`；漏掉 `null` 的情况 → NPE。206 只写 `head.next == null` 的话，空链表输入就会 NPE → infinite recursion, or an NPE on a missed `null` case.
- **出口要覆盖子调用能走到的所有最小输入 Base cases must cover every input the calls can reach:** 斐波那契调用 `F(n-1)` 和 `F(n-2)`，所以 `F(0)` 和 `F(1)` 两个出口都要有。只写 `F(1) = 1` 的话，`F(2)` 会调用 `F(0)`，`F(0)` 又调用 `F(-1)`，一直往负数走下去直到栈溢出。`if (n <= 1) return n;` 一行就覆盖了两个 → Fibonacci calls `F(n-1)` and `F(n-2)`, so it needs both `F(0)` and `F(1)`. With only `F(1)`, `F(2)` calls `F(0)`, which calls `F(-1)`, and it runs into negatives until the stack overflows. `if (n <= 1) return n;` covers both in one line.
- **在脑子里展开每一层 Unrolling every level in your head:** 层数一多就乱了。写的时候只看一层，相信合同；验证时再用 2 到 3 个节点的小例子手推 → write one level and trust the contract; check with a 2–3 element example afterwards.
- **递归太深 Too deep:** 64 位 HotSpot 默认线程栈通常约 1 MB（取决于平台和 `-Xss`），大约能撑几千到几万层（取决于每帧大小）。Java **不做尾调用优化**，尾递归写法也一样会溢出；太深就改成循环或显式栈 → the default thread stack on 64-bit HotSpot is usually about 1 MB (it depends on the platform and `-Xss`), enough for a few thousand to tens of thousands of frames depending on frame size. Java does **not** optimize tail calls, so tail recursion overflows too; switch to a loop or an explicit stack.
- **重复子问题 Repeated subproblems:** 朴素 `fib(n)` 把同一个 `fib(k)` 算很多次，变成指数级。用记忆化（memo）或改成 DP → memoize or switch to DP.
- **共享的可变状态 Shared mutable state:** 递归里改了全局变量或传进来的集合，回来时没恢复（回溯里要“撤销选择”） → undo changes on the way back, as backtracking does.
- **子调用之后数据结构已经变了 The structure changed under you:** 206 里子调用会改 `head.next` 后面的指针，但不会改 `head.next` 本身，所以 `head.next.next = head` 才成立。用之前想清楚子调用改了什么 → know what the child call mutated before using it.

## 7. ❓ 复习题 Review Questions

**Q1.** 写递归要回答哪三个问题？ What three questions define a recursive function?

> [!success]- 答案 Answer
> ① 合同：函数做什么、返回什么；② 出口：最小输入怎么直接回答；③ 本层：拿到子问题结果后怎么结合自己得出本层结果。
> ① The contract: what it does and returns. ② The base case: how the smallest input is answered directly. ③ This level: how to combine the child's result with yourself.

**Q2.** 在 206 的递归里，`newHead` 看起来是从最底层一路传上来的，为什么说每一层都在“自己推理”？ In 206, why is `return newHead` each level's own reasoning, not just copying?

> [!success]- 答案 Answer
> 每一层只知道合同：子调用返回的是子链表反转后的头。本层把自己接在尾部，头部不受影响，所以整条链表的新头还是 `newHead`。如果本层改的是头部（比如把自己放在前面），返回值就要变。
> Each level only knows the contract: the child returns the reversed sublist's head. This level attaches at the tail, so the head is unaffected and the whole list's new head is still `newHead`. If the level changed the front instead, the return value would have to change.

**Q3.** 一个递归函数没有 `new` 任何对象，为什么空间不是 O(1)？ A recursive function allocates nothing; why isn't its space O(1)?

> [!success]- 答案 Answer
> 每层调用都在调用栈上占一帧（参数、局部变量、返回地址），最大深度是 d 就需要 O(d) 空间。206 的递归版深度是 n，所以是 O(n)。
> Each call takes a stack frame (parameters, locals, return address). Max depth d means O(d) space; 206's recursion is n deep, so O(n).

**Q4.** 尾递归在 Java 里能省栈空间吗？ Does tail recursion save stack space in Java?

> [!success]- 答案 Answer
> 不能。HotSpot JVM 不做尾调用优化，尾递归每层仍然占一帧，深度大时一样 `StackOverflowError`。需要 O(1) 空间就改写成循环。
> No. HotSpot doesn't do tail-call optimization, so each call still takes a frame and deep recursion still overflows. For O(1) space, rewrite it as a loop.

**Q5.** 为什么朴素递归的斐波那契很慢？怎么改？ Why is naive recursive Fibonacci slow, and how do you fix it?

> [!success]- 答案 Answer
> `fib(n)` 调用 `fib(n-1)` 和 `fib(n-2)`，同一个子问题被反复计算，调用次数随 n 指数增长。用数组记住算过的结果（记忆化），每个 `fib(k)` 只算一次，变成 O(n)；再进一步就是自底向上的动态规划。
> `fib(n)` calls `fib(n-1)` and `fib(n-2)`, recomputing the same subproblems, so calls grow exponentially. Memoize results so each `fib(k)` is computed once, giving O(n); going bottom-up from there is dynamic programming.

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices | 难度 Difficulty |
| --- | --- | --- |
| ✅ [[Reverse Linked List\|206. Reverse Linked List]] | 后序递归，相信合同 post-order, trust the contract | Easy |
| 21. Merge Two Sorted Lists | 小的那个节点 + 合并剩下的 smaller node + merge the rest | Easy |
| 104. Maximum Depth of Binary Tree | 子结果加工 `max + 1` processing the child results | Easy |
| 226. Invert Binary Tree | 树上的递归交换 swapping recursively on a tree | Easy |
| 509. Fibonacci Number | 重复子问题、记忆化 repeated subproblems, memoization | Easy |
| 24. Swap Nodes in Pairs | 和 206 类似，先处理后面再接自己 a similar shape to 206 | Medium |
| 50. Pow(x, n) | 分治，O(log n) divide and conquer | Medium |

## 9. 🔗 相关 Related

- [[📌 算法总览]]
- 运行机制 How it runs: [[栈 Stack|栈 Stack]]（调用栈 the call stack；递归可以改成显式栈 recursion can become an explicit stack）
- 数据结构 Data structures: [[链表 Linked List|链表 Linked List]]（天然递归的结构 a naturally recursive structure）
- 复杂度 Complexity: [[复杂度分析 Big-O|复杂度分析 Big-O]]（递归栈也算空间 the recursion stack counts as space）
- 对比 Compare with: [[一次遍历 One Pass|一次遍历 One Pass]]（206 的迭代写法 iterative version）
