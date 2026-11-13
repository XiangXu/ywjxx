---
title: "队列 Queue"
aliases:
  - 队列
  - Queue
  - FIFO
  - 先进先出
  - 双端队列
  - Deque
  - 环形数组
  - Circular Array
tags:
  - DSA
  - Data-Structures
  - Queue
  - Interview-Prep
created: 2026-10-31
publish: true
---

# 🚶 队列 Queue

> [!abstract] TL;DR
> 队列是**先进先出 FIFO** 的容器：从**队尾**进（offer），从**队头**出（poll），看队头（peek），三个操作都是（均摊）O(1)。题目里出现“排队 / 按到达顺序处理 / 一层一层往外扩（BFS）”时，先想队列。Java 里用 `Queue<Integer> queue = new ArrayDeque<>()`。
> A queue is a **first in, first out** container: you add at the **back** (offer), remove from the **front** (poll), and look at the front (peek), each in (amortized) O(1). When a problem says "line up", "process in arrival order" or "expand level by level (BFS)", think queue first. In Java use `Queue<Integer> queue = new ArrayDeque<>()`.

## 1. 🎯 核心概念 Overview

### 1.1 先进先出 FIFO

| 操作 Operation | 作用 What it does |
| --- | --- |
| `offer(x)` | 放到队尾 Add `x` at the back |
| `poll()` | 删除并返回队头 Remove and return the front |
| `peek()` | 只看队头，不删除 Look at the front without removing it |
| `isEmpty()` / `size()` | 是否为空 / 元素个数 Whether it's empty / how many elements |

### 1.2 底层实现 How it's built

队列两端都要动：队尾进、队头出。普通数组在队头删除要把后面的元素全部前移，O(n)，所以要换个办法：
A queue touches both ends: add at the back, remove at the front. A plain array has to shift everything after the front on removal, O(n), so we need something else:

- **环形数组 Circular array:** 用 `head` 和 `tail` 两个下标，出队只是 `head` 往后挪一格，走到末尾就用 `% capacity` 绕回开头（和 [[Concatenation of Array|1929]] 的 `i % n` 是同一个技巧）。`ArrayDeque` 就是这个思路，满了会扩容。
  Keep two indices, `head` and `tail`. Dequeuing just moves `head` forward one slot, wrapping to the start with `% capacity` (the same trick as `i % n` in 1929). `ArrayDeque` works this way and grows when full.
- **链表 Linked list:** 队头删除、队尾追加，再加一个尾指针，两端都是 O(1)（见 [[Design Singly Linked List|设计单链表 Design Singly Linked List]] 的 `tail`）。
  Remove at the head and append at the tail with a tail pointer, both O(1) (see the `tail` in Design Singly Linked List).

```
环形数组 Circular array（capacity = 5）

下标 index:  0    1    2    3    4
           [ 7 ][   ][   ][ 4 ][ 5 ]
                 ▲         ▲
                tail      head        队列内容 contents: 4, 5, 7
                                      下一个 offer 写到 index 1 the next offer writes index 1
```

### 1.3 Java 里用哪个 Which one in Java

| 写法 Code | 说明 Notes |
| --- | --- |
| `Queue<Integer> q = new ArrayDeque<>();` | ✅ 推荐，环形数组，通常最快 Recommended: a circular array, usually the fastest |
| `Queue<Integer> q = new LinkedList<>();` | 也能用，但每个元素一个节点，更占内存、缓存不友好；能存 `null` Works, but one node per element means more memory and worse cache behavior; allows `null` |
| `PriorityQueue<Integer> pq = new PriorityQueue<>();` | ⚠️ 不是先进先出！按优先级出队，是堆 Not FIFO! It dequeues by priority; it's a heap |

### 1.4 双端队列：栈和队列都能当 Deque: a stack or a queue

`Deque`（双端队列）的 `pop` / `poll` / `peek` 都从**头部**取，区别只在放的位置：`push` 放头部，就是栈；`offer` 放尾部，就是队列。
A `Deque`'s `pop` / `poll` / `peek` all take from the **front**; only where you add differs: `push` adds at the front (a stack), `offer` at the back (a queue).

```
依次放入 1、2、3 Add 1, 2, 3 in order

push:   front → [3, 2, 1]    pop()  → 3   （栈 stack）
offer:  front → [1, 2, 3]    poll() → 1   （队列 queue）
```

| 失败时抛异常 Throws | 失败时返回特殊值 Returns `false` / `null` | 作用 What it does |
| --- | --- | --- |
| `add(x)` | `offer(x)` | 尾部放入 Add at the back |
| `push(x)` | — | 头部放入（栈） Add at the front (stack) |
| `remove()` / `pop()` | `poll()` | 头部取出 Remove from the front |
| `element()` | `peek()` | 只看头部 Look at the front |

> [!tip] 记忆要点 Key points
> - **栈 Stack:** 用 `push` / `pop` / `peek`，变量声明为 `Deque`；推荐 `ArrayDeque`，不用老的 `Stack` 类（见 [[栈 Stack|栈 Stack]]）。
>   Use `push` / `pop` / `peek` with a variable declared as `Deque`; prefer `ArrayDeque` over the legacy `Stack` class.
> - **队列 Queue:** 用 `offer` / `poll` / `peek`，变量声明为 `Queue`，这样调用不到 `push` / `pop`，防止误用（[[Implement Stack using Queues|225]]）。
>   Use `offer` / `poll` / `peek` with a variable declared as `Queue`, which can't call `push` / `pop` and so prevents mix-ups (225).
> - **`ArrayDeque` 不会满 `ArrayDeque` is never full:** 它会自动扩容，放入永远不会失败（`offer` 总是返回 `true`），两列的区别只在空队列时取元素；“满了失败”针对的是 `LinkedBlockingDeque` 这类有容量上限的实现。
>   It grows automatically, so adding never fails (`offer` always returns `true`) and the two columns differ only when taking from an empty queue; "fails when full" applies to capacity-bounded implementations such as `LinkedBlockingDeque`.
> - **两端都能取 Both ends:** `pollLast()`、`peekLast()`、`removeLast()` 从尾部取，上表只是最常用的简写。
>   `pollLast()`, `peekLast()` and `removeLast()` take from the back; the table shows only the common shorthands.

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - **排队模拟 Simulating a line:** 排到队头才处理，没处理完回到队尾 handle whoever is at the front; unfinished ones go to the back → [[Number of Students Unable to Eat Lunch|1700]], 2073
  - **用队列搭别的结构 Building another structure on a queue:** 转一格 `offer(poll())` 能把任意元素转到队头 rotating with `offer(poll())` brings any element to the front → [[Implement Stack using Queues|225]]
  - **广度优先搜索 BFS:** 一层一层往外扩，如树的层序遍历、网格最短路 expand level by level, as in tree level-order traversal or grid shortest paths → 102, 994
  - **最近一段时间 A recent time window:** 新的从队尾进，过期的从队头出 new items join at the back, expired ones leave from the front → 933
  - **滑动窗口最大值 Sliding window max:** 单调双端队列 a monotonic deque → 239
- ❌ 要“最近的先处理”（配对、撤销）用栈；要“最小 / 最大的先处理”用优先队列（堆）
  Need the most recent first (matching, undo)? Use a stack. Need the smallest or largest first? Use a priority queue (heap).

> [!tip] 先想想顺序重不重要 Ask whether the order matters
> 模拟题照题意写队列通常没错，但有时可以先问一句：结果真的依赖顺序吗？[[Number of Students Unable to Eat Lunch|1700]] 里学生会一直转圈，顺序无关，队列就能换成两个计数器，O(n²) 降到 O(n)。
> Simulating with a queue as described is usually correct, but first ask: does the result really depend on the order? In 1700 the students keep cycling, so order doesn't matter and the queue becomes two counters, O(n²) down to O(n).

## 3. ⚙️ 原理 How It Works

### 3.1 BFS 为什么用队列 Why BFS uses a queue

先进先出保证了**先发现的先处理**。起点的邻居（第 1 层）全部出队之前，第 2 层的节点只会排在它们后面，所以节点是按距离从近到远处理的，第一次发现（入队）某个点时走的就是最短步数（无权图，入队时就标记已访问）。
FIFO means **discovered first, processed first**. Level-2 nodes wait behind every level-1 node, so nodes are processed in order of distance, and the first time you discover (enqueue) a node is by the fewest steps (in an unweighted graph, marking nodes visited when enqueued).

## 4. 💻 模板代码 Code Template

```java
// ① 基本用法 Basic usage
Queue<Integer> queue = new ArrayDeque<>();
queue.offer(1);
queue.offer(2);
int front = queue.peek();        // 1，不删除 not removed
int x = queue.poll();            // 1
boolean empty = queue.isEmpty(); // false，还有 2 still has 2

// ② 排队转圈 Rotate the line（1700, 225）
queue.offer(queue.poll());       // 队头排到队尾 front goes to the back

// ③ 按层 BFS Level-by-level BFS
Queue<TreeNode> q = new ArrayDeque<>();
q.offer(root);                   // 假设 root 不为 null assumes root is not null
while (!q.isEmpty()) {
    int levelSize = q.size();    // 先存下来，循环里 size 会变 save it first; size changes inside the loop
    for (int i = 0; i < levelSize; i++) {
        TreeNode node = q.poll();
        if (node.left != null) q.offer(node.left);
        if (node.right != null) q.offer(node.right);
    }
}

// ④ 环形数组实现 Circular array implementation (fixed capacity)
int[] data = new int[capacity];
int head = 0, size = 0;
data[(head + size) % capacity] = 5; size++;      // offer（先检查没满 check it's not full first）
int y = data[head]; head = (head + 1) % capacity; size--;   // poll（先检查非空 check it's not empty first）
```

## 5. ⏱️ 复杂度 Complexity

| 操作 Operation | ⏱️ Time | 🗄️ Space |
| --- | --- | --- |
| `offer` | 均摊 O(1)，扩容的那一次是 O(n) Amortized O(1); O(n) for the offer that resizes | O(1) |
| `poll` / `peek` / `isEmpty` / `size` | O(1) | O(1) |
| 查找或删除任意元素 Search or remove a value | O(n) | O(1) |
| 整个队列 The whole queue | | O(n) |

广度优先搜索里每个节点最多入队、出队各一次，所以总时间是 O(V + E)（图）或 O(n)（树）。
In BFS each node is enqueued and dequeued at most once, so the total is O(V + E) for a graph or O(n) for a tree.

## 6. ⚠️ 常见坑 Common Pitfalls

- **空队列取元素 Polling an empty queue:** `poll()` 返回 `null`，赋给 `int` 时自动拆箱就是 NPE；先判 `isEmpty()` → `poll()` returns `null`, and unboxing it into an `int` throws an NPE; check `isEmpty()` first.
- **循环条件用 `size()` Using `size()` in the loop condition:** 按层 BFS 时写 `for (i < q.size())`，`size` 一边循环一边变，层就乱了；先存到变量里 → in level-order BFS, `size()` changes as you add children, so save it to a variable first.
- **`Integer` 用 `==` 比较 Comparing `Integer`s with `==`:** 两个 `queue.peek()` 比较的是引用，超出 -128 到 127 通常就错；和 `int` 比较时会拆箱，没问题 → two `peek()` results compare references, which usually fails outside the cached range -128 to 127; comparing with an `int` unboxes and is fine, see [[Number of Students Unable to Eat Lunch|1700]].
- **用 `ArrayList` 当队列 Using an `ArrayList` as a queue:** `remove(0)` 是 O(n)，要平移所有元素 → `remove(0)` shifts every element, O(n).
- **`ArrayDeque` 不能存空值 `ArrayDeque` rejects `null`:** `offer(null)` 直接抛 NPE，所以 `poll()` 返回 `null` 就表示队列空了 → `offer(null)` throws, so `poll()` returning `null` means "empty" (a `LinkedList` can hold `null`).

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么不能直接用普通数组的 `remove(0)` 当出队？ Why not dequeue with a plain array's `remove(0)`?

> [!success]- 答案 Answer
> 队头删除后，后面每个元素都要前移一位，O(n)。环形数组只是把 `head` 往后挪一格，O(1)，空出来的位置以后会被绕回来的 `tail` 重新使用。
> Removing the front shifts every later element, O(n). A circular array just moves `head` forward one slot, O(1), and the freed slot is reused later when `tail` wraps around.

**Q2.** BFS 为什么用队列，DFS 为什么用栈？ Why does BFS use a queue and DFS a stack?

> [!success]- 答案 Answer
> BFS 要先处理离起点近的，先发现的先处理，正好是先进先出。DFS 要沿着一条路一直走下去，最新发现的先处理，正好是后进先出（递归本身就跑在调用栈上）。
> BFS handles nearer nodes first: discovered first, processed first, which is FIFO. DFS goes deep along one path: the newest discovery first, which is LIFO (recursion itself runs on the call stack).

**Q3.** 按层 BFS 为什么要先把 `q.size()` 存下来？ In level-order BFS, why save `q.size()` first?

> [!success]- 答案 Answer
> 处理这一层时会把下一层的节点加进队列，`size()` 一直在变。先存下来，才能只处理这一层的节点，不把下一层混进来。
> Processing a level adds the next level's nodes, so `size()` keeps changing. Saving it first lets you process exactly this level without mixing in the next.

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices | 难度 Difficulty |
| --- | --- | --- |
| ✅ [[Number of Students Unable to Eat Lunch\|1700. 无法吃午餐的学生数量 Number of Students Unable to Eat Lunch]] | 排队模拟，或者看出顺序无关改成计数 queue simulation, or counting once you see order doesn't matter | Easy |
| 2073. 买票需要的时间 Time Needed to Buy Tickets | 排队转圈 a rotating line | Easy |
| 933. 最近的请求次数 Number of Recent Calls | 过期的从队头出 expired items leave from the front | Easy |
| 232. 用栈实现队列 Implement Queue using Stacks | 两个栈实现队列 a queue from two stacks | Easy |
| ✅ [[Implement Stack using Queues\|225. 用队列实现栈 Implement Stack using Queues]] | 一个队列，压入后转 `n - 1` 格 one queue, rotating `n - 1` steps after each push | Easy |
| 622. 设计循环队列 Design Circular Queue | 环形数组 a circular array | Medium |
| 102. 二叉树的层序遍历 Binary Tree Level Order Traversal | 按层 BFS 遍历 level-by-level BFS | Medium |
| 994. 腐烂的橘子 Rotting Oranges | 多源 BFS 遍历 multi-source BFS | Medium |
| 239. 滑动窗口最大值 Sliding Window Maximum | 单调双端队列 a monotonic deque | Hard |

## 9. 🔗 相关 Related

- [[📌 数据结构总览]]
- 对照 Compare with: [[栈 Stack|栈 Stack]]（后进先出 LIFO）
- 底层实现 Built on: [[数组 Array|数组 Array]]（环形数组 a circular array） 或 or [[链表 Linked List|链表 Linked List]]（加尾指针 with a tail pointer）
- 算法 Algorithms: [[一次遍历 One Pass|一次遍历 One Pass]]（`i % n` 绕回 wrapping around） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（均摊扩容 amortized resizing）
