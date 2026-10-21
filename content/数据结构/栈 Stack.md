---
title: "栈 Stack"
aliases:
  - 栈
  - Stack
  - LIFO
  - 后进先出
  - 辅助栈
  - Auxiliary Stack
tags:
  - DSA
  - Data-Structures
  - Stack
  - Interview-Prep
created: 2026-10-21
publish: true
---

# 📚 栈 Stack

> [!abstract] TL;DR
> 栈是**后进先出 LIFO** 的容器：只能在**栈顶**放入（push）、取出（pop）、查看（peek），三个操作都是 O(1)。题目里出现“和前一个配对 / 撤销上一步 / 最近的那个”时，先想栈。Java 里用 `Deque<Integer> stack = new ArrayDeque<>()`，而不是老的 `Stack` 类。
> A stack is a **last in, first out** container: you push, pop and peek only at the **top**, each in O(1). When a problem says "match with the previous one", "undo the last step" or "the most recent one", think stack first. In Java use `Deque<Integer> stack = new ArrayDeque<>()` rather than the legacy `Stack` class.

## 1. 🎯 核心概念 Overview

### 1.1 后进先出 LIFO

像一摞盘子：最后放上去的最先被拿走，中间和底部的元素在上面的被拿走之前都碰不到。
Like a pile of plates: the last one put on is the first one taken off, and nothing below the top can be reached until everything above it is gone.

```
push 1, push 2, push 3          pop() → 3          peek() → 2

   │ 3 │ ← top                    │   │
   │ 2 │                          │ 2 │ ← top           │ 2 │ ← top（不删除 not removed）
   │ 1 │                          │ 1 │                 │ 1 │
   └───┘                          └───┘                 └───┘
```

| 操作 Operation | 作用 What it does |
| --- | --- |
| `push(x)` | 放到栈顶 Put `x` on top |
| `pop()` | 删除并返回栈顶 Remove and return the top |
| `peek()` / `top()` | 只看栈顶，不删除 Look at the top without removing it |
| `isEmpty()` | 是否为空 Whether the stack is empty |

### 1.2 底层实现 How it's built

栈只在一端操作，所以用**数组**实现最自然：栈顶就是数组末尾（概念上；`ArrayDeque` 实际是循环数组），push / pop 就是在末尾追加 / 删除，正好是数组最擅长的 O(1) 操作（见 [[数组 Array|数组 Array]]）。也可以用链表，在头部插入删除。
A stack only touches one end, so an **array** is the natural fit: the top is the end of the array (conceptually; `ArrayDeque` is a circular array internally), and push/pop are append/remove-last, exactly the O(1) operations arrays are good at (see [[数组 Array|Array]]). A linked list with insert/remove at the head also works.

| | 数组实现 Array-backed | 链表实现 Linked-list-backed |
| --- | --- | --- |
| push / pop | O(1)（扩容时 O(n)，均摊 O(1) amortized） | O(1) |
| 内存 Memory | 连续，缓存友好 contiguous, cache-friendly | 每个节点多一个指针 an extra pointer per node |
| Java | `ArrayDeque`、自己用 `int[]` + `size` | `LinkedList`（也实现了 `Deque` also implements `Deque`） |

### 1.3 Java 里用哪个 Which one in Java

| 写法 Code | 说明 Notes |
| --- | --- |
| `Deque<Integer> s = new ArrayDeque<>();` | ✅ 推荐。官方文档建议用 `Deque` 做栈 Recommended; the Javadoc suggests `Deque` for stacks |
| `Stack<Integer> s = new Stack<>();` | ⚠️ JDK 1.0 的遗留类，继承 `Vector`，大部分方法都加了 `synchronized`；还暴露了 `get(i)`、`add(i, x)` 等，能绕过栈的规则 Legacy: extends `Vector`, most methods synchronized, and exposes `get(i)` / `add(i, x)` that break stack discipline |
| `int[] st = new int[n]; int size = 0;` | ⚡ 知道最大容量时通常最快，没有装箱 Usually the fastest when the max size is known; no boxing |

> [!note] `Stack` 和 `ArrayDeque` 的方法对照 Method comparison
> | 操作 | `Stack` | `ArrayDeque`（当栈用 as a stack） |
> | --- | --- | --- |
> | 压栈 push | `push(x)` | `push(x)`（= `addFirst`） |
> | 出栈 pop | `pop()`，空栈抛 `EmptyStackException` | `pop()`，空栈抛 `NoSuchElementException` |
> | 看栈顶 peek | `peek()`，空栈抛 `EmptyStackException` | `peek()`，空栈返回 `null` returns `null` |
> | 存 `null` | 可以 allowed | ❌ 抛 `NullPointerException` throws NPE |
> | 遍历顺序 Iteration order | 栈底 → 栈顶 bottom → top | 栈顶 → 栈底 top → bottom |
>
> 在 LeetCode 上把 `Stack` 换成 `ArrayDeque` 基本只要改声明那一行，但要注意上表的空栈行为和遍历顺序；`Stack` 的 `empty()`、`search()`、`get(i)` 在 `Deque` 上不存在。
> Swapping `Stack` for `ArrayDeque` is usually a one-line change, but mind the empty-stack behavior and iteration order above; `Stack`'s `empty()`, `search()` and `get(i)` don't exist on `Deque`.

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - **配对 / 嵌套 Matching and nesting:** 括号、标签、表达式 brackets, tags, expressions → [[Valid Parentheses|20]]
  - **撤销 / 删除上一个 Undo / delete the previous one:** 退格、作废上一次得分 backspace, cancel the last score → [[Baseball Game|682]]
  - **随时知道“到目前为止”的某个值 Track a "so far" value per level:** 最小值、最大值 min / max → [[Min Stack|155]]
  - **“下一个更大 / 更小” Next greater / smaller element:** 单调栈 monotonic stack（739、496、84）
  - **后缀表达式求值 Evaluate postfix (RPN):** 数字压栈，遇到运算符弹出两个 push numbers, pop two on an operator（150）
  - **把递归改成迭代 Turn recursion into a loop:** DFS、树的遍历 DFS, tree traversal。递归本身就是用**调用栈 call stack** 实现的 Recursion itself runs on the call stack
- ❌ 需要先进先出（按到达顺序处理，如 BFS）→ 用队列 Need first in, first out (e.g. BFS) → use a queue

## 3. ⚙️ 原理 How It Works

### 3.1 为什么栈能解决“配对”问题 Why stacks solve matching

嵌套结构里，**最后打开的必须最先关闭**。栈顶永远是“最近一个还没处理完的”，所以新来的元素只需要和栈顶比较。
In nested structures, **the last one opened must close first**. The top is always the most recent unfinished item, so each new element only needs to compare with the top.

```
s = "([])"                 栈 stack（底 → 顶 bottom → top）
'('  push ')'             )
'['  push ']'             )  ]
']'  pop ']'，相等 match ✓  )
')'  pop ')'，相等 match ✓  （空 empty）→ valid ✅
```

### 3.2 辅助栈：给每一层存一份快照 Auxiliary stack: a snapshot per level

栈只从顶部变化，所以**某一层下面的元素，在这一层存在期间不会变**。push 时把“到这一层为止”的信息（如最小值）算好，和元素一起存，pop 时一起扔掉，就能 O(1) 查询。这就是 [[Min Stack|155. Min Stack]] 的做法。
A stack only changes at the top, so **everything below a level stays fixed while that level exists**. Compute "so far" info (like the minimum) on push, store it with the element, and drop it on pop, and queries become O(1). That's how 155 works.

## 4. 💻 模板代码 Code Template

```java
// ① 基本用法 Basic usage
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
int peeked = stack.peek();       // 2，不删除 not removed
int x = stack.pop();             // 2
boolean empty = stack.isEmpty(); // false，还有 1 still has 1

// ② 数组 + 指针实现 Array + pointer (max size known)
int[] st = new int[n];
int size = 0;                    // 元素个数，也是下一个空位 count, also the next free slot
st[size++] = 5;                  // push
int t = st[size - 1];            // peek
int y = st[--size];              // pop

// ③ 配对模板 Matching template（压入期望的右括号 push the expected closer）
Deque<Character> brackets = new ArrayDeque<>();
for (char c : s.toCharArray()) {
    if (isOpen(c)) {
        brackets.push(closerOf(c));   // '(' → ')'
    } else {
        if (brackets.isEmpty() || brackets.pop() != c) return false; // 先判空 check empty first
    }
}
return brackets.isEmpty();       // 别忘了：剩下没配对的也算错 leftovers are unmatched too
```

## 5. ⏱️ 复杂度 Complexity

| 操作 Operation | ⏱️ Time | 🗄️ Space |
| --- | --- | --- |
| `push` | O(1)（数组实现扩容时 O(n)，均摊 O(1) amortized with resizing） | O(1) |
| `pop` / `peek` / `isEmpty` | O(1) | O(1) |
| 查找任意元素 Search for a value | O(n) | O(1) |
| 整个栈 The whole stack | | O(n) |

用栈的算法常见是 **O(n) 时间**：每个元素最多 push 一次、pop 一次，所以即使循环里有 `while (!stack.isEmpty() && ...) pop()`，总共也只有 O(n) 次 pop（单调栈就是这样分析的）。
Stack algorithms are commonly **O(n) time**: each element is pushed once and popped at most once, so even a `while (...) pop()` inside the loop adds up to O(n) pops in total. That's how monotonic stacks are analyzed.

## 6. ⚠️ 常见坑 Common Pitfalls

- **空栈 pop / peek Popping an empty stack:** `Stack` 抛 `EmptyStackException`；`ArrayDeque.pop()` 抛 `NoSuchElementException`，`peek()` 返回 `null`（再拆箱成 `int` 就是 NPE）。先判 `isEmpty()` → check `isEmpty()` first.
- **忘了最后检查栈是否为空 Forgetting the final emptiness check:** 配对题里，循环结束后栈里还有东西也是无效的，如 `"(("` → leftovers mean unmatched openers, see [[Valid Parentheses|20]].
- **`Integer` 用 `==` 比较 Comparing `Integer`s with `==`:** 两个 `Integer` 比较的是引用，默认只有 -128 到 127 有缓存，超出范围通常就错。用 `.equals()` 或先拆箱成 `int` → only -128..127 is cached by default; use `.equals()` or unbox first, see [[Min Stack|155]].
- **`ArrayDeque` 遍历顺序 Iteration order:** `for (int x : deque)` 是从栈顶到栈底，和 `Stack` 相反；打印调试时别看反了 → top to bottom, the opposite of `Stack`.
- **`ArrayDeque` 不能存 `null`** `ArrayDeque` rejects `null`: 需要“空”标记时用别的值 → use a sentinel value instead.
- **递归太深 Recursion too deep:** 调用栈有大小限制，递归深度很大（比如 10⁵ 层的链状树）可能 `StackOverflowError`，可以改成显式栈 → the call stack is limited; very deep recursion can overflow, so switch to an explicit stack.

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么数组很适合实现栈？ Why is an array a good fit for a stack?

> [!success]- Answer
> 栈只在一端操作。把数组末尾当栈顶，push / pop 就是末尾追加 / 删除，都是 O(1)，不需要平移元素，而且内存连续、缓存友好。
> A stack works at one end only. With the array's end as the top, push/pop are append/remove-last, both O(1) with no shifting, and the memory is contiguous and cache-friendly.

**Q2.** Java 里为什么推荐 `ArrayDeque` 而不是 `Stack`？ Why prefer `ArrayDeque` over `Stack` in Java?

> [!success]- Answer
> `Stack` 继承自 `Vector`，大部分方法都同步，单线程下有不必要的同步开销（通常很小）；还暴露了 `get(i)`、`add(i, x)` 等方法，可以绕过栈的规则。`ArrayDeque` 没有同步开销，官方文档也推荐用 `Deque` 做栈。
> `Stack` extends `Vector`: most methods are synchronized (unnecessary, though usually small, overhead single-threaded) and it exposes `get(i)` / `add(i, x)` that bypass stack rules. `ArrayDeque` has no locking, and the Javadoc recommends `Deque` for stacks.

**Q3.** 循环里有一个 `while` 不断 pop，为什么单调栈仍然是 O(n)？ With a `while` popping inside the loop, why is a monotonic stack still O(n)?

> [!success]- Answer
> 看总工作量：每个元素最多被 push 一次、pop 一次，所以所有 `while` 加起来最多 pop n 次，总共 O(n)。
> Count total work: each element is pushed once and popped at most once, so all the `while` loops together pop at most n times. O(n) overall.

**Q4.** 栈和队列分别适合什么场景？ When do you use a stack vs a queue?

> [!success]- Answer
> 栈后进先出，适合“最近的先处理”：配对、撤销、DFS。队列先进先出，适合“按到达顺序处理”：BFS、任务调度。
> A stack (LIFO) handles the most recent first: matching, undo, DFS. A queue (FIFO) handles things in arrival order: BFS, task scheduling.

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices | 难度 |
| --- | --- | --- |
| ✅ [[Baseball Game\|682. Baseball Game]] | 栈模拟，撤销上一个 stack simulation, undo the last one | Easy |
| ✅ [[Valid Parentheses\|20. Valid Parentheses]] | 括号配对 bracket matching | Easy |
| ✅ [[Min Stack\|155. Min Stack]] | 辅助栈 auxiliary stack | Medium |
| 844. Backspace String Compare | `#` 删除前一个字符 `#` deletes the previous char | Easy |
| 232. Implement Queue using Stacks | 两个栈实现队列 a queue from two stacks | Easy |
| 150. Evaluate Reverse Polish Notation | 数字压栈，运算符弹两个 push numbers, pop two on an operator | Medium |
| 739. Daily Temperatures | 单调栈 monotonic stack | Medium |
| 84. Largest Rectangle in Histogram | 单调栈进阶 advanced monotonic stack | Hard |

## 9. 🔗 相关 Related

- [[📌 数据结构总览]]
- 底层实现 Built on: [[数组 Array|数组 Array]]（也是 [[Design Dynamic Array|动态数组]] 的典型用途 a classic use of a dynamic array）
- 复杂度 Complexity: [[复杂度分析 Big-O|复杂度分析 Big-O]]（均摊分析 amortized analysis）
