---
title: "155. Min Stack"
aliases:
  - 最小栈
  - LeetCode 155
  - Min Stack
  - 辅助栈
tags:
  - LeetCode
  - Interview-Prep
  - Stack
  - Design
difficulty: Medium
pattern: "Stack / Design (Auxiliary Min Stack)"
link: https://leetcode.com/problems/min-stack/
status: 🟡 review
created: 2026-10-21
publish: true
last-reviewed: 2026-10-21
---

# 📉 155. Min Stack

> [!abstract] TL;DR
> 用两个栈：`stack` 存值，`minStack` 和它**同步** push / pop，每层存“到这一层为止的最小值”。`getMin()` 就是 `minStack.peek()`。
> Use two stacks: `stack` holds the values, and `minStack` is pushed and popped **in lockstep**, each level storing "the minimum up to this level". `getMin()` is just `minStack.peek()`. ⏱️ O(1) per operation · 🗄️ O(n)

## 1. 📋 题目 Problem

设计一个栈，支持以下操作，并且**每个操作都是 O(1)**：
Design a stack that supports the following, **each in O(1) time**:

| 方法 Method | 作用 What it does |
| --- | --- |
| `MinStack()` | 初始化 Initialize the stack |
| `push(int val)` | 压入 `val` Push `val` |
| `pop()` | 删除栈顶元素 Remove the top element |
| `top()` | 返回栈顶元素 Return the top element |
| `getMin()` | 返回栈中最小值 Return the minimum element |

示例 Example:

| 调用 Call | 返回 Returns | 栈（底 → 顶） Stack (bottom → top) |
| --- | --- | --- |
| `push(-2)` | | `[-2]` |
| `push(0)` | | `[-2, 0]` |
| `push(-3)` | | `[-2, 0, -3]` |
| `getMin()` | `-3` | |
| `pop()` | | `[-2, 0]` |
| `top()` | `0` | |
| `getMin()` | `-2` | |

约束 Constraints: `val` 在 `int` 全范围内（-2³¹ ≤ `val` ≤ 2³¹ − 1）；`pop`、`top`、`getMin` 只会在栈非空时调用；最多调用 3·10⁴ 次。
`val` spans the full `int` range; `pop`, `top` and `getMin` are only called on a non-empty stack; at most 3·10⁴ calls.

## 2. 💡 思路 Intuition

- **难点 The hard part:** `push` 时更新最小值很简单，难的是 `pop`：如果弹出的正好是最小值，下一个最小值是谁？只存一个 `min` 变量做不到 O(1)。
  Updating the minimum on `push` is easy. `pop` is the problem: if the popped value was the minimum, what's the next one? A single `min` variable can't answer that in O(1).
- **关键观察 Key insight:** 栈只会从顶部变化，所以“某一层以下的元素”在这一层存在期间**永远不变**。那么每一层的最小值也不变，可以在 push 时算好、存起来，pop 时一起扔掉。
  A stack only changes at the top, so everything below a given level stays **fixed** while that level exists. The minimum at each level never changes either, so compute it on push, store it, and discard it on pop.
- **套路 Pattern:** 辅助栈 auxiliary stack / 用空间换时间 trade space for time。“给每一层记一份快照”这个思路也用在撤销（undo）操作和持久化数据结构里。
  Auxiliary stack, trading space for time. "Snapshot some state per level" also shows up in undo features and persistent data structures.

## 3. 🐢 暴力解 Brute Force

只用一个栈，`getMin()` 时遍历整个栈找最小值。
One stack; `getMin()` scans every element.

```java
// stack 是 Stack<Integer> stack is a Stack<Integer>
public int getMin() {
    int min = Integer.MAX_VALUE;
    for (int x : stack) min = Math.min(min, x);
    return min;
}
```

- ⏱️ Time: `push` / `pop` / `top` O(1)，`getMin` O(n)，不满足题目要求 Doesn't meet the O(1) requirement: `getMin` is O(n), while `push`, `pop` and `top` are O(1)
- 🗄️ Space: O(n)

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class MinStack {
    private Stack<Integer> stack;
    private Stack<Integer> minStack;             // 每层存“到这层为止的最小值” min up to each level

    public MinStack() {
        this.stack = new Stack<>();
        this.minStack = new Stack<>();
    }

    public void push(int val) {
        stack.push(val);
        // 新的最小值 = min(val, 下面那层的最小值) new min = min(val, min of the level below)
        int min = minStack.isEmpty() ? val : Math.min(val, minStack.peek());
        minStack.push(min);                      // 两个栈高度始终一样 both stacks stay the same height
    }

    public void pop() {
        stack.pop();
        minStack.pop();                          // 同步弹出，下一层的最小值自动露出来 the level below's min is now on top
    }

    public int top() {
        return stack.peek();
    }

    public int getMin() {
        return minStack.peek();
    }
}
```

- ⏱️ Time: 每个操作 O(1) Every operation is O(1)
- 🗄️ Space: O(n): 两个栈各 n 个元素 n elements in each stack

> [!example] 走一遍 Trace: push 5, push 3, push 7, push 2, pop, pop
>
> | 操作 Op | `stack` | `minStack` | `getMin()` |
> | --- | --- | --- | --- |
> | `push(5)` | `[5]` | `[5]` | 5 |
> | `push(3)` | `[5, 3]` | `[5, 3]` | 3 |
> | `push(7)` | `[5, 3, 7]` | `[5, 3, 3]` | 3 |
> | `push(2)` | `[5, 3, 7, 2]` | `[5, 3, 3, 2]` | 2 |
> | `pop()` | `[5, 3, 7]` | `[5, 3, 3]` | 3 |
> | `pop()` | `[5, 3]` | `[5, 3]` | 3 |
>
> 弹出 2 之后，最小值“自动”回到 3，因为 3 一直存在下一层。 After popping 2, the minimum falls back to 3 by itself, because 3 was stored on the level below all along.

> [!note] 其他写法 Alternatives
> **一个栈存数对 One stack of pairs:** 每层存 `{val, minSoFar}`，两个栈合成一个，不会出现“两个栈不同步”的 bug
> Store `{val, minSoFar}` per level: one stack instead of two, so they can't fall out of sync
> ```java
> private final Deque<int[]> stack = new ArrayDeque<>();
>
> public void push(int val) {
>     int min = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
>     stack.push(new int[] {val, min});
> }
> public void pop()    { stack.pop(); }
> public int top()     { return stack.peek()[0]; }
> public int getMin()  { return stack.peek()[1]; }
> ```
> **省空间的辅助栈 Space-saving min stack:** `minStack` 只在 `val <= 当前最小值` 时 push，pop 时只有弹出的值等于当前最小值才一起弹。最坏情况（非递增序列，如严格递减或全是相同的值）仍是 O(n)，但通常更省空间。
> Push onto `minStack` only when `val <= current min`, and pop it only when the popped value equals the current min. Still O(n) in the worst case (a non-increasing sequence, e.g. strictly decreasing or all equal), but usually smaller.
> ```java
> public void push(int val) {
>     stack.push(val);
>     if (minStack.isEmpty() || val <= minStack.peek()) {   // 必须是 <=，见易错点 must be <=, see pitfalls
>         minStack.push(val);
>     }
> }
> public void pop() {
>     int x = stack.pop();                                  // 先拆箱成 int unbox to int first
>     if (x == minStack.peek()) {                           // int == Integer → 值比较 value comparison
>         minStack.pop();
>     }
> }
> ```
> 三种都是每个操作 O(1)。我的写法和数对写法最不容易写错；省空间版要小心 `<=` 和 `Integer` 比较。
> All three are O(1) per operation. My version and the pairs version are the hardest to get wrong; the space-saving one needs care with `<=` and `Integer` comparison.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 第一次 push 时 `minStack` 为空 First push with an empty `minStack`: `Stack.peek()` 会抛 `EmptyStackException`（若用 `ArrayDeque` 则返回 `null`，拆箱时 NPE），所以要先判断 `isEmpty()` → `Stack.peek()` throws `EmptyStackException` (`ArrayDeque.peek()` returns `null`, then unboxing throws an NPE), so check `isEmpty()` first
- [x] 重复的最小值 Duplicate minimums (push 1, push 1, pop): 我的写法每层都存，不受影响 → my version stores every level, so it's unaffected
- [x] ⚠️ 省空间版必须用 `<=` 而不是 `<` The space-saving version needs `<=`, not `<`: 如果用 `<`，push 1、push 1 只记一次 1，pop 一次就把 1 从 `minStack` 弹掉了，但栈里还有一个 1 → with `<`, two 1s are recorded once, so one pop removes 1 from `minStack` while a 1 is still in the stack
- [x] ⚠️ 两个 `Integer` 用 `==` 比较的是引用 Two `Integer`s compared with `==` compare references: `stack.pop() == minStack.peek()` 在 -128 到 127 之间碰巧对（默认有缓存），超出范围通常就错。用 `.equals()`，或者像上面那样先存进 `int` → it happens to work for -128..127 (cached by default) and usually breaks outside that range; use `.equals()` or unbox to `int` first
- [x] 负数和 `int` 极值 Negatives and `int` extremes: 只比较、不做加减，不会溢出 → we only compare, never add or subtract, so nothing overflows
- [x] 空栈调用 `pop` / `top` / `getMin` Calling on an empty stack: 题目保证不会发生 → the problem guarantees it won't happen

## 6. 🔁 进阶 Follow-ups

> [!question] 除了栈本身，能只用 O(1) 额外空间吗？ Can you use O(1) extra space beyond the stack itself?
> 可以：只存一个 `min` 变量，栈里存 `val - min`（差值）。差值为负说明这次 push 更新了最小值，pop 时可以用 `min - diff` 还原出上一个最小值；`top()` 在 `diff < 0` 时返回 `min`，否则返回 `min + diff`；空栈时第一次 push 存 0 并令 `min = val`。因为 `val` 覆盖整个 `int` 范围，差值会溢出，所以栈里要用 `long`。栈本身仍有 n 个元素，省掉的只是第二个栈。面试里能讲清思路就够，平时用辅助栈更清楚。
> Yes: keep one `min` and store `val - min` on the stack. A negative difference means that push set a new minimum, and pop restores the previous minimum as `min - diff`. `top()` returns `min` if `diff < 0`, otherwise `min + diff`; on an empty stack the first push stores 0 and sets `min = val`. Since `val` spans the full `int` range the difference can overflow, so store `long`s. The stack still holds n entries, so this only removes the second stack, not the O(n) total. It's good to explain in an interview; the auxiliary stack is clearer in practice.

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| [[Valid Parentheses\|20. Valid Parentheses]] | 栈的基本用法 Basic stack usage |
| 716. Max Stack | 还要支持 `peekMax()` / `popMax()`（Premium）；`popMax` 做不到 O(1)，常见解法是双向链表 + `TreeMap`，O(log n) Also supports `peekMax()` / `popMax()` (Premium); `popMax` can't be O(1), a common solution is a doubly linked list + `TreeMap` in O(log n) |
| 232. Implement Queue using Stacks | 也是用两个栈设计数据结构 Another two-stack design |
| 739. Daily Temperatures | 单调栈，同样是“栈里维护有序信息” Monotonic stack: ordered info kept on a stack |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么一个 `min` 变量不够？ Why isn't a single `min` variable enough?

> [!success]- 答案 Answer
> push 时可以更新 `min`，但 pop 掉当前最小值后，不知道下一个最小值是什么，只能遍历整个栈，变成 O(n)。辅助栈把“每一层的最小值”都存了下来。
> Push can update `min`, but after popping the current minimum you don't know the next one without scanning the stack, which is O(n). The auxiliary stack keeps the minimum for every level.

**Q2.** 为什么 `minStack` 每一层存的值在之后不需要改？ Why does a `minStack` entry never need updating later?

> [!success]- 答案 Answer
> 栈只从顶部变化。某一层存在的时候，它下面的元素一个都不会变，所以“到这一层为止的最小值”也不会变。
> A stack only changes at the top. While a level exists, nothing below it changes, so "the minimum up to this level" can't change either.

**Q3.** 省空间版为什么要用 `<=` 而不是 `<`？ Why does the space-saving version use `<=` rather than `<`?

> [!success]- 答案 Answer
> 有重复最小值时（如 push 1、push 1），用 `<` 只会在 `minStack` 记一次 1。第一次 pop 就把它弹掉，但栈里还剩一个 1，`getMin()` 就错了。用 `<=` 每个重复的最小值都记一次。
> With duplicate minimums (push 1, push 1), `<` records 1 only once. The first pop removes it while a 1 remains in the stack, so `getMin()` is wrong. `<=` records each duplicate.

**Q4.** `stack.pop() == minStack.peek()` 有什么问题？ What's wrong with `stack.pop() == minStack.peek()`?

> [!success]- 答案 Answer
> 两边都是 `Integer`，`==` 比较的是引用。`Integer` 默认只缓存 -128 到 127，范围内碰巧相等，超出范围即使值相同通常也返回 `false`（除非两边恰好是同一个对象）。要用 `.equals()` 或先拆箱成 `int`。
> Both sides are `Integer`, so `==` compares references. `Integer` caches only -128..127 by default, so it works by accident in that range and usually returns `false` for equal values outside it (unless both sides are the same object). Use `.equals()` or unbox to `int`.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[栈 Stack|栈 Stack]]（辅助栈 auxiliary stack） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（用空间换时间 trading space for time）
- 上一题 Previous: [[Valid Parentheses|20. Valid Parentheses]]（同样是栈 also a stack）
- 同为设计题 Also a design problem: [[Design Dynamic Array|Design Dynamic Array (Resizable Array)]]
- 下一题 Next: [[Reverse Linked List|206. Reverse Linked List]]（链表 + 递归，递归跑在调用栈上 linked list + recursion, which runs on the call stack）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-21 |  | ✅ | 辅助栈同步 push / pop，每层存当前最小值 Auxiliary stack in lockstep, each level stores the min so far |
