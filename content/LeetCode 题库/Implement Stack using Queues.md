---
title: "225. 用队列实现栈 Implement Stack using Queues"
aliases:
  - 用队列实现栈
  - LeetCode 225
  - Implement Stack using Queues
tags:
  - LeetCode
  - Interview-Prep
  - Queue
  - Stack
  - Design
difficulty: Easy
pattern: "Queue / Design (Rotate on Push)"
link: https://leetcode.com/problems/implement-stack-using-queues/
status: 🟡 review
created: 2026-10-31
publish: true
last-reviewed: 2026-10-31
---

# 🔃 225. Implement Stack using Queues

> [!abstract] TL;DR
> 只用**一个队列**：`push(x)` 先把 `x` 放到队尾，再把它前面的 `n - 1` 个元素依次从队头拿出来、放回队尾。转完之后 `x` 就在队头，队列从头到尾正好是“栈顶到栈底”的顺序，`pop` / `top` 直接用队列的 `poll` / `peek`。
> Use **one queue**: `push(x)` adds `x` at the back, then moves the `n - 1` elements in front of it from the front to the back, one by one. After the rotation `x` is at the front, so the queue reads top-to-bottom of the stack, and `pop` / `top` are just the queue's `poll` / `peek`. ⏱️ `push` O(n), `pop` / `top` O(1) · 🗄️ O(n)

## 1. 📋 题目 Problem

只用**两个队列**实现一个后进先出的栈，支持下面四个操作：
Implement a last in, first out stack using only **two queues**, supporting these four operations:

| 方法 Method | 作用 What it does |
| --- | --- |
| `MyStack()` | 初始化 Initialize the stack |
| `push(int x)` | 把 `x` 压到栈顶 Push `x` onto the top |
| `pop()` | 删除并返回栈顶元素 Remove and return the top element |
| `top()` | 返回栈顶元素 Return the top element |
| `empty()` | 栈是否为空 Whether the stack is empty |

只能用队列的标准操作：从队尾加入、从队头查看和删除、`size`、`isEmpty`。
You may only use standard queue operations: add to the back, peek and remove from the front, `size` and `isEmpty`.

| 调用 Calls | 返回 Returns |
| --- | --- |
| `push(1)`, `push(2)`, `top()`, `pop()`, `empty()` | `null, null, 2, 2, false` |

约束 Constraints: `1 <= x <= 9`，最多调用 100 次，`pop` 和 `top` 调用时栈一定不为空。
`1 <= x <= 9`, at most 100 calls, and `pop` and `top` are only called on a non-empty stack.

**进阶 Follow-up:** 能只用**一个**队列吗？本题的解法就是。
  Can you do it with only **one** queue? This solution does.

## 2. 💡 思路 Intuition

- **关键矛盾 The conflict:** 队列只能从队头出，出的是**最早**进来的；栈要出的是**最晚**进来的。所以通常有一个操作要把队列“翻”一下，问题只是让 `push` 还是 `pop` 付这个代价。
  A queue only removes from the front, which is the **oldest** element; a stack must remove the **newest**. So one operation usually has to rearrange the queue, and the only question is whether `push` or `pop` pays for it.
- **关键观察 Key insight:** 把队头的元素拿出来再放回队尾，相当于把队列**转一格**，元素之间的相对顺序不变。新元素进来后转 `n - 1` 格，它就从队尾转到了队头，其他元素保持原来的顺序跟在后面。
  Polling the front and offering it to the back **rotates** the queue one step without changing the relative order. Rotate `n - 1` steps after adding a new element, and it moves from the back to the front, with everything else following in the same order.
- **套路 Pattern:** 用一种结构实现另一种（设计题），选好“哪个操作付 O(n)”。
  Build one structure from another (a design problem), and choose which operation pays O(n).

```
push(3) 之前 before:  front → [2, 1] ← back    （栈顶是 2 the top is 2）

offer(3):             front → [2, 1, 3]
转一格 rotate 1:       front → [1, 3, 2]
转两格 rotate 2:       front → [3, 2, 1]        ← 3 到了队头，就是栈顶 3 is at the front: the new top
```

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 两个队列，`push` 直接放进 `q1`，O(1)。`pop` 时把 `q1` 前面的 `n - 1` 个元素挪到 `q2`，剩下的最后一个就是栈顶，取出它后交换 `q1` 和 `q2`。`top` 也要挪一遍，或者用一个变量记住栈顶（`pop` 时挪动元素的同时更新它）。
  Two queues: `push` offers to `q1` in O(1). For `pop`, move the first `n - 1` elements of `q1` into `q2`; the one left is the top, so remove it and swap `q1` and `q2`. `top` either moves everything too, or reads a variable that tracks the top (updated during `pop`'s moves).
- ⏱️ **复杂度 Complexity:** 压入 O(1)、弹出 O(n)，空间 O(n)，多用一个队列。
  `push` O(1), `pop` O(n), and O(n) space with an extra queue.
- 和下面的解法同一量级，只是把代价放在了 `pop` 上，而且要维护两个队列，代码更长。
  The same order as the solution below, with the cost moved to `pop`, but it juggles two queues and takes more code.

## 4. 🚀 最优解 Optimal Solution

### 4.1 🔄 解法一：一个队列，压入时转圈 Solution 1 (mine): one queue, rotate on push

```java
class MyStack {

    private Queue<Integer> queue;                 // 只用队列的接口 only the Queue interface

    public MyStack() {
        queue = new ArrayDeque<>();
    }

    public void push(int x) {
        queue.offer(x);                           // 新元素先排到队尾 the new element joins at the back
        int n = queue.size() - 1;                 // 它前面有 n 个旧元素 n old elements in front of it
        for (int i = 0; i < n; i++) {
            queue.offer(queue.poll());            // 旧元素依次转到队尾 rotate each old element to the back
        }                                         // 转完 x 在队头 x is now at the front
    }

    public int pop() {
        return queue.poll();                      // 队头就是栈顶 the front is the top
    }

    public int top() {
        return queue.peek();
    }

    public boolean empty() {
        return queue.isEmpty();
    }
}
```

- ⏱️ Time: `push` 要转 `n - 1` 次，是 O(n)，其余操作都是常数时间 `push` rotates `n - 1` times, O(n); `pop` / `top` / `empty` are O(1)
- 🗄️ Space: O(n)，只有一个队列 just one queue

**为什么转 `n - 1` 次 Why `n - 1` rotations:** 加入 `x` 之后队列里有 `n` 个元素，`x` 在最后。把前面 `n - 1` 个旧元素各转一次，`x` 就到了队头。旧元素之间的顺序不变，所以它们仍然是“栈顶到栈底”的顺序，排在 `x` 后面。
After adding `x` the queue holds `n` elements with `x` last. Rotating each of the `n - 1` old elements once brings `x` to the front. The old elements keep their order, so they still read top to bottom, right behind `x`.

**不变量 Invariant:** 每次 `push` 结束时，队列从头到尾 = 栈从顶到底。`pop` 删除队头不会破坏它，所以 `pop` 和 `top` 不用做任何调整。
After every `push`, the queue front to back equals the stack top to bottom. `pop` removes the front without breaking that, so `pop` and `top` need no extra work.

> [!example] 走一遍 Trace: `push(1)`, `push(2)`, `push(3)`, `pop()`, `top()`
>
> | 调用 Call | `offer` 之后 After `offer` | 转几次 Rotations | 队列 Queue（队头在左 front left） | 返回 Returns |
> | --- | --- | --- | --- | --- |
> | `push(1)` | `[1]` | 0 | `[1]` | |
> | `push(2)` | `[1, 2]` | 1 | `[2, 1]` | |
> | `push(3)` | `[2, 1, 3]` | 2 | `[3, 2, 1]` | |
> | `pop()` | | | `[2, 1]` | `3` |
> | `top()` | | | `[2, 1]` | `2` |
> | `empty()` | | | `[2, 1]` | `false` |

> [!note] 其他写法 Alternatives
> **两个队列 Two queues, cost on push:** 新元素放进空的 `q2`，再把 `q1` 全部倒进 `q2`，然后交换两个队列。效果和单队列转圈一样，但多一个队列。
> Offer the new element to an empty `q2`, pour all of `q1` into `q2`, then swap the two. Same effect as the one-queue rotation, with an extra queue.
>
> **一个队列 One queue, cost on pop:** `push` 直接 `offer`，O(1)；`pop` 先把队头的前 `size - 1` 个转到队尾，再 `poll`。`top` 用一个字段记住最后压入的值，`pop` 之后要更新它。适合压入多、弹出少的场景。
> `push` just offers, O(1); `pop` rotates the first `size - 1` to the back, then polls. `top` reads a field holding the last pushed value, which `pop` must update. Better when pushes far outnumber pops.
>
> ```java
> // 其余字段和方法同上 other fields and methods as above
> private int topValue;                              // 最后压入的值 the last pushed value
>
> public void push(int x) {
>     queue.offer(x);                                 // O(1)
>     topValue = x;
> }
>
> public int top() {
>     return topValue;
> }
>
> public int pop() {
>     int n = queue.size() - 1;
>     for (int i = 0; i < n; i++) {
>         if (i == n - 1) topValue = queue.peek();   // 弹出后的新栈顶 the top after this pop
>         queue.offer(queue.poll());
>     }
>     return queue.poll();
> }
> ```
>
> **字段可以加 `final` Make the field `final`:** 写成 `private final Queue<Integer> queue = new ArrayDeque<>();`，构造器就不用写了，也防止被意外重新赋值。
> Write `private final Queue<Integer> queue = new ArrayDeque<>();` and the constructor body goes away, and the field can't be reassigned by accident.

| 写法 Approach | `push` | `pop` | `top` | 队列数 Queues |
| --- | --- | --- | --- | --- |
| 两个队列，pop 时倒（暴力） Two queues, cost on pop (brute force) | O(1) | O(n) | O(1)（记录栈顶 with a top field） | 2 |
| 两个队列，push 时倒 Two queues, cost on push | O(n) | O(1) | O(1) | 2 |
| 一个队列，push 时转（我的解法） One queue, rotate on push (mine) | O(n) | O(1) | O(1) | 1 |
| 一个队列，pop 时转 One queue, rotate on pop | O(1) | O(n) | O(1)（记录栈顶 with a top field） | 1 |
| 直接用双端队列（解法二） A `Deque` as the stack (solution 2) | O(1) | O(1) | O(1) | 一个双端队列（不合题意） One `Deque` (breaks the rules) |

**和 232 对比 Compared with 232:** 反过来用两个栈实现队列时，每个元素最多从一个栈倒到另一个栈一次，所以是**均摊 O(1)**。这个解法不行：每次 `push` 都要把全部旧元素转一遍，转过的元素下次还要再转，代价不会被摊掉，`n` 次 `push` 总共 O(n²)。
Going the other way, a queue from two stacks, each element moves between the stacks at most once, so it's **amortized O(1)**. Not with this approach: every `push` rotates all the old elements again, so the work never gets amortized away, and `n` pushes cost O(n²) in total.

### 4.2 🧰 解法二：直接用 Deque 当栈 Solution 2: a Deque as the stack

```java
class MyStack {
    private Deque<Integer> d = new ArrayDeque<>();
    public void push(int x) { d.push(x); }             // 放到头部 add at the front
    public int pop()  { return d.pop(); }               // 从头部取 remove from the front
    public int top()  { return d.peek(); }              // 看头部 look at the front
    public boolean empty() { return d.isEmpty(); }
}
```

栈为空时 `pop()` 抛 `NoSuchElementException`，`top()` 拿到 `null` 后拆箱成 `int` 会抛空指针异常；题目保证不会在空栈上调用。
On an empty stack `pop()` throws `NoSuchElementException`, and `top()` gets `null` and throws an NPE when unboxing to `int`; the problem guarantees neither happens.

- ⏱️ Time: `push` 均摊 O(1)（偶尔扩容要复制数组），其余操作 O(1) `push` is amortized O(1) (a resize occasionally copies the array); the rest are O(1)
- 🗄️ Space: O(n)

> [!warning] 能通过，但不合题意 It passes, but breaks the rules
> `push` / `pop` 是 `Deque` 的栈方法，不是队列的标准操作，等于没有“用队列实现”。LeetCode 通常不检查，但面试时通常会被要求改回只用 `offer` / `poll` / `peek` 的写法（解法一）。它的价值在于：**实际写代码要栈时，就这么写**，通常比老的 `Stack` 类更合适，Java 文档也推荐用 `Deque`（见 [[栈 Stack|栈 Stack]]）。
> `push` / `pop` are `Deque`'s stack methods, not standard queue operations, so this doesn't really build a stack from a queue. LeetCode usually doesn't check, but an interviewer will usually ask for the `offer` / `poll` / `peek` version (solution 1). Its real value: **this is how you write a stack in everyday Java**, and it's usually a better choice than the legacy `Stack` class, as the Java docs recommend `Deque` (see [[栈 Stack|栈 Stack]]).

**放的位置不同 Where `push` and `offer` add:** 在 `Deque` 里，`pop` / `poll` / `peek` 都从头部取，区别只在放的位置。`push` 放在头部，配合 `pop` 就是栈；`offer` 放在尾部，配合 `poll` 就是队列。完整对照表在 1.4 节，见 [[队列 Queue|队列 Queue]]。
In a `Deque`, `pop` / `poll` / `peek` all take from the front; the only difference is where you add. `push` adds at the front, so with `pop` it's a stack; `offer` adds at the back, so with `poll` it's a queue. The full table is in section 1.4 of the Queue note.

```
依次放入 1、2、3 Add 1, 2, 3 in order

push:   front → [3, 2, 1]    pop()  → 3   （后进先出 LIFO）
offer:  front → [1, 2, 3]    poll() → 1   （先进先出 FIFO）
```

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 第一次压入 First push: `n = 0`，不转圈，队列里只有这一个元素 → `n = 0`, no rotation, the queue is just `[x]`
- [x] 连续弹出到空 Popping down to empty: 每次 `pop` 后不变量仍然成立，`empty()` 返回 `true` → the invariant still holds after each `pop`, and `empty()` returns `true`
- [x] 转圈次数 Rotation count: 是 `size() - 1` 不是 `size()`；转 `size()` 次会把 `x` 又转回队尾 → it's `size() - 1`, not `size()`; rotating `size()` times brings `x` back to the end
- [x] 计算 n 的时机 When to compute n: `n` 在 `offer(x)` 之后算，减一才是旧元素个数；如果在 `offer` 之前取 `size()`，就不用减一 → `n` is computed after `offer(x)`, so `size() - 1` is the old count; take `size()` before the `offer` and no `- 1` is needed
- [x] 空栈弹出 Popping an empty stack: `poll()` 返回 `null`，拆箱成 `int` 就是 NPE；题目保证不会发生，自己实现时要先判空或抛更清楚的异常 → `poll()` returns `null`, and unboxing it to `int` throws an NPE; the problem rules this out, but a real implementation should check first or throw a clearer exception
- [x] ⚠️ 本题别把双端队列当栈 Don't use the deque as a stack here: `ArrayDeque` 本身就有 `push` / `pop`，直接用就违反了“只用队列操作”；声明成 `Queue<Integer>` 让编译器只允许队列方法（见解法二） → `ArrayDeque` has its own `push` / `pop`, which would break the "queue operations only" rule; declaring it as `Queue<Integer>` lets the compiler allow only queue methods (see solution 2)

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 232. 用栈实现队列 Implement Queue using Stacks | 反过来：两个栈拼一个队列，均摊 O(1) the reverse: two stacks make a queue, amortized O(1) · Easy |
| [[Min Stack\|155. 最小栈 Min Stack]] | 也是设计一个栈，多支持一个 `getMin` also designing a stack, plus `getMin` · Medium |
| 622. 设计循环队列 Design Circular Queue | 用环形数组实现队列本身 build the queue itself on a circular array · Medium |
| 641. 设计循环双端队列 Design Circular Deque | 两头都能进出的环形数组 a circular array open at both ends · Medium |
| 716. 最大栈 Max Stack | 栈加上弹出最大值 a stack that can also pop the max · Hard |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么 push 之后要转 `n - 1` 次？ Why rotate `n - 1` times after a push?

> [!success]- 答案 Answer
> `offer(x)` 后 `x` 在队尾，前面有 `n - 1` 个旧元素。把它们各转一次，`x` 就到了队头，旧元素保持原来的顺序排在后面，队列又变成“栈顶到栈底”的顺序。
> After `offer(x)`, `x` is at the back with `n - 1` old elements in front. Rotating each once brings `x` to the front, with the old elements behind it in their original order, so the queue reads top to bottom again.

**Q2.** 这个实现里 `pop` 为什么是 O(1)？ Why is `pop` O(1) here?

> [!success]- 答案 Answer
> 每次 `push` 都维护了不变量：队头就是栈顶。`pop` 只要 `poll()` 队头，删掉队头不会打乱剩下元素的顺序。
> Every `push` keeps the invariant that the front is the top. `pop` just polls the front, and removing it doesn't disturb the order of the rest.

**Q3.** 能不能让 `push` 是 O(1)？代价是什么？ Can `push` be O(1)? What does it cost?

> [!success]- 答案 Answer
> 可以：`push` 直接 `offer`，`pop` 时把队头的前 `size - 1` 个转到队尾再 `poll`，`pop` 变成 O(n)；`top` 要用一个字段记住最后压入的值。用这类做法时，通常有一个操作是 O(n)，看哪个操作更频繁来选。
> Yes: `push` just offers, and `pop` rotates the first `size - 1` to the back before polling, so `pop` becomes O(n), and `top` needs a field for the last pushed value. With these approaches one operation is usually O(n); pick based on which one is called more.

**Q4.** 用两个栈实现队列是均摊 O(1)，为什么这个解法做不到？ A queue from two stacks is amortized O(1). Why can't this approach?

> [!success]- 答案 Answer
> 两个栈的写法里，每个元素一生只会从输入栈倒到输出栈**一次**，总成本 O(n)。这里每次 `push` 都要把**所有**旧元素再转一遍，同一个元素会被转很多次，`n` 次 `push` 总共约 `n²/2` 次转圈，摊下来每次还是 O(n)。
> With two stacks, each element moves from the input stack to the output stack **once** in its lifetime, O(n) total. Here every `push` rotates **all** old elements again, so the same element is rotated many times: about `n²/2` rotations for `n` pushes, which is still O(n) per push on average.

**Q5.** 为什么字段声明成 `Queue<Integer>` 而不是 `ArrayDeque<Integer>`？ Why declare the field as `Queue<Integer>` rather than `ArrayDeque<Integer>`?

> [!success]- 答案 Answer
> `ArrayDeque` 同时实现了 `Deque`，有 `push`、`pop`、`pollLast` 这些方法，直接调用就绕过了题目的限制。声明成 `Queue` 接口，编译器只允许 `offer` / `poll` / `peek` 这些队列操作，也是“面向接口编程”的好习惯。
> `ArrayDeque` also implements `Deque`, with `push`, `pop` and `pollLast`, which would sidestep the rules. Declaring the `Queue` interface means the compiler only allows queue operations like `offer` / `poll` / `peek`, and it's good "program to the interface" practice too.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[队列 Queue|队列 Queue]]（转一格 rotating with `offer(poll())`） · [[栈 Stack|栈 Stack]]（要实现的后进先出 the LIFO behavior being built） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（选哪个操作付 O(n)，以及为什么不能均摊 which operation pays O(n), and why it doesn't amortize）
- 对照 Compare with: [[Min Stack|155. 最小栈 Min Stack]]（也是设计一个栈 also designing a stack）
- 上一题 Previous: [[Number of Students Unable to Eat Lunch|1700. 无法吃午餐的学生数量 Number of Students Unable to Eat Lunch]]（同样用 `offer(poll())` 转圈 the same `offer(poll())` rotation）
- 下一题 Next: [[Climbing Stairs|70. 爬楼梯 Climbing Stairs]]（第一道动态规划题 the first dynamic programming problem）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-31 |  | ✅ | 新元素入队后转 `n - 1` 次到队头，队列就按栈顶到栈底排好 Rotate the new element `n - 1` times to the front, and the queue reads top to bottom |
