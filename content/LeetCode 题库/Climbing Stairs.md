---
title: "70. 爬楼梯 Climbing Stairs"
aliases:
  - 爬楼梯
  - LeetCode 70
  - Climbing Stairs
tags:
  - LeetCode
  - Interview-Prep
  - Dynamic-Programming
  - Recursion
  - Memoization
difficulty: Easy
pattern: "Dynamic Programming (Top-Down Memoization)"
link: https://leetcode.com/problems/climbing-stairs/
status: 🟡 review
created: 2026-11-05
publish: true
last-reviewed: 2026-11-05
---

# 🪜 70. Climbing Stairs

> [!abstract] TL;DR
> 看**最后一步**：到第 `n` 级要么从 `n - 1` 迈 1 级，要么从 `n - 2` 迈 2 级，所以 `f(n) = f(n - 1) + f(n - 2)`。直接递归会反复计算同一个子问题，用一个数组记住算过的结果，每个 `f(k)` 只算一次。
> Look at the **last step**: you reach stair `n` with a 1-step from `n - 1` or a 2-step from `n - 2`, so `f(n) = f(n - 1) + f(n - 2)`. Plain recursion recomputes the same subproblems, so an array remembers each result and every `f(k)` is computed once. ⏱️ O(n) · 🗄️ O(n)

## 1. 📋 题目 Problem

楼梯一共 `n` 级，每次可以爬 1 级或 2 级，有多少种不同的方法爬到楼顶？
You're climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top?

| 输入 Input | 输出 Output | 所有走法 All ways |
| --- | --- | --- |
| `n = 2` | `2` | `1+1`, `2` |
| `n = 3` | `3` | `1+1+1`, `1+2`, `2+1` |

约束 Constraints: `1 <= n <= 45`

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 不要从第一步开始数，看最后一步。每种走法的最后一步只可能是 1 级或 2 级，两类不重复也不遗漏，所以两类的数量直接相加。
  Don't count forward from the first step; look at the last one. Every way ends in exactly one of a 1-step or a 2-step, and the two groups neither overlap nor miss anything, so their counts simply add up.
- **顺序算不同的走法 Order matters:** `1+2` 和 `2+1` 是两种走法，这道题数的是有顺序的走法，不是组合。
  `1+2` and `2+1` are two different ways, so this counts ordered sequences, not combinations.
- **套路 Pattern:** 递推公式加重复子问题，就是[[动态规划 Dynamic Programming|动态规划]]。
  A recurrence plus repeated subproblems means [[动态规划 Dynamic Programming|dynamic programming]].

答案序列是 `1, 2, 3, 5, 8, 13, …`，也就是错开一位的斐波那契数列：`f(n)` 等于 `F(n + 1)`（`F(1) = F(2) = 1`）。
The answers run `1, 2, 3, 5, 8, 13, …`, the Fibonacci numbers shifted by one: `f(n)` equals `F(n + 1)` (with `F(1) = F(2) = 1`).

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 直接照公式递归 `return climbStairs(n - 1) + climbStairs(n - 2)`，不做任何记录。
  Apply the recurrence directly, remembering nothing.
- ⏱️ **复杂度 Complexity:** 时间约为 1.618 的 `n` 次方，通常写成上界 O(2ⁿ)；空间 O(n)，是调用栈的深度。`n = 45` 时约 23 亿次调用，可能超时。
  Time is about 1.618 to the power `n`, usually written as the upper bound O(2ⁿ); space is O(n) for the call stack. At `n = 45` that's about 2.3 billion calls, which can time out.

## 4. 🚀 最优解 Optimal Solution

### 4.1 🧠 我的解法：记忆化递归 My solution: memoized recursion

```java
class Solution {
    public int climbStairs(int n) {
        int[] cache = new int[n + 1];                 // 下标就是级数，0 表示没算过 index = stair, 0 = not computed
        return calculator(n, cache);
    }

    private int calculator(int n, int[] cache) {
        if (n <= 2) {                                 // 出口：f(1) = 1, f(2) = 2 base cases
            return n;
        }

        if (cache[n] != 0) {                          // 算过就直接用 reuse if computed
            return cache[n];
        }

        cache[n] = calculator(n - 1, cache) + calculator(n - 2, cache);  // 最后一步走 1 级或 2 级 last step is 1 or 2
        return cache[n];
    }
}
```

- ⏱️ Time: 每个 `k` 只完整算一次，共 `2n - 3` 次调用，所以是 O(n) Each `k` is fully computed once, `2n - 3` calls in total (`n >= 2`), so O(n)
- 🗄️ Space: 数组和调用栈各占 O(n) Both the array and the call stack take O(n)

**为什么 `0` 能表示没算过 Why `0` can mean "not computed":** Java 的 `int[]` 默认全是 0，而本题的答案至少是 1，所以 0 不会和真实答案混淆。如果答案本身可能是 0（比如 91 解码方法），就用 `-1` 或 `Integer[]` 的 `null` 当标记。
A Java `int[]` starts as all zeros, and every answer here is at least 1, so 0 can't be mistaken for a real answer. If an answer can itself be 0 (as in 91 Decode Ways), use `-1` or a `null` in an `Integer[]` as the marker.

> [!example] 走一遍 Trace: `n = 5`
>
> | 顺序 Order | 调用 Call | 发生了什么 What happens | 写入 Writes |
> | --- | --- | --- | --- |
> | 1 | `calculator(5)` | 没缓存，往下调用 not cached, calls down | |
> | 2 | `calculator(4)` | 没缓存，往下调用 not cached, calls down | |
> | 3 | `calculator(3)` | 没缓存，往下调用 not cached, calls down | |
> | 4 | `calculator(2)` | 出口，返回 2 Base case, returns 2 | |
> | 5 | `calculator(1)` | 出口，返回 1 Base case, returns 1 | `cache[3] = 2 + 1 = 3` |
> | 6 | `calculator(2)` | 出口，返回 2 Base case, returns 2 | `cache[4] = 3 + 2 = 5` |
> | 7 | `calculator(3)` | 命中缓存，返回 3 Cache hit, returns 3 | `cache[5] = 5 + 3 = 8` |
>
> 结果是 8。第 7 步就是缓存省下的工作：不加缓存时这里要把 `f(3)` 整个重算一遍。
> The result is 8. Step 7 is the work the cache saves: without it, `f(3)` would be recomputed in full here.

> [!note] 其他写法 Alternatives
> **自底向上 Bottom-up table:** 不用递归，从小到大填表，没有调用栈的开销。
> No recursion: fill the table from small to large, with no call stack.
>
> ```java
> public int climbStairs(int n) {
>     int[] dp = new int[n + 1];
>     dp[0] = 1;                       // 约定：站在地面算一种走法 by convention, standing at the bottom is one way
>     dp[1] = 1;
>     for (int i = 2; i <= n; i++) {
>         dp[i] = dp[i - 1] + dp[i - 2];
>     }
>     return dp[n];
> }
> ```
>
> **两个变量 Two variables, O(1) space:** 每一步只用到前两个值，不用留整张表。
> Each step only needs the previous two values, so the full table isn't needed.
>
> ```java
> public int climbStairs(int n) {
>     int prev = 1, curr = 1;          // f(0), f(1)
>     for (int i = 2; i <= n; i++) {
>         int next = prev + curr;
>         prev = curr;
>         curr = next;
>     }
>     return curr;
> }
> ```

| 写法 Approach | ⏱️ Time | 🗄️ Space | 说明 Notes |
| --- | --- | --- | --- |
| 朴素递归 Plain recursion | O(2ⁿ) | O(n) | 可能超时 Can time out |
| 记忆化递归（我的解法） Memoized recursion (mine) | O(n) | O(n) | 直接照公式写 Follows the recurrence directly |
| 自底向上填表 Bottom-up table | O(n) | O(n) | 没有递归 No recursion |
| 两个变量 Two variables | O(n) | O(1) | 面试时通常的最终答案 The usual final answer in an interview |

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 最小输入 Smallest inputs: `n = 1` 和 `n = 2` 都由出口直接返回，不会碰到数组 → `n = 1` and `n = 2` return from the base case without touching the array
- [x] 只有一级 One stair: 填表时写 `dp[2] = 2` 且数组长度是 `n + 1`，`n = 1` 就数组越界；所以上面从 `dp[0]`、`dp[1]` 开始 → writing `dp[2] = 2` with length `n + 1` goes out of bounds at `n = 1`, which is why the table above starts from `dp[0]` and `dp[1]`
- [x] 整数溢出 Integer overflow: `f(45) = 1836311903` 刚好放得下，`f(46)` 就超过了 `int` 上限，放宽约束就要用 `long` → `f(45)` just fits, while `f(46)` exceeds the `int` limit; a larger `n` needs `long`
- [x] ⚠️ 忘了写回缓存 Forgetting to store: 只写 `return calculator(n - 1, cache) + calculator(n - 2, cache)` 能得到正确答案，但没有写入缓存，退化成指数级 → this still gives the right answer but never fills the cache, so it falls back to exponential time

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 509. 斐波那契数 Fibonacci Number | 同一个递推，只是出口不同 the same recurrence with different base cases · Easy |
| 746. 使用最小花费爬楼梯 Min Cost Climbing Stairs | 从数方案变成求最小值，加法换成取最小值 from counting to minimizing, so `+` becomes `min` · Easy |
| 198. 打家劫舍 House Robber | 同样只看前两个状态，取较大值 also looks back two states, taking the max · Medium |
| 91. 解码方法 Decode Ways | 爬楼梯加上条件：这一步能不能走要看数字 stairs with conditions: whether a step is allowed depends on the digits · Medium |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么 `f(n) = f(n - 1) + f(n - 2)`？为什么是相加而不是取最大值？ Why is `f(n) = f(n - 1) + f(n - 2)`, and why add rather than take the max?

> [!success]- 答案 Answer
> 每种走法的最后一步要么是 1 级（前面是到 `n - 1` 的走法），要么是 2 级（前面是到 `n - 2` 的走法）。这两类覆盖了所有走法，也没有重叠。题目问的是总数，所以相加；求最值的题才取 `max` 或 `min`。
> Every way ends with either a 1-step (after a way to `n - 1`) or a 2-step (after a way to `n - 2`). The two groups cover everything without overlap. The question asks for a total, so they add; `max` or `min` is for optimization problems.

**Q2.** 加了 `cache` 之后，时间为什么从指数级变成 O(n)？ Why does the cache take the time from exponential to O(n)?

> [!success]- 答案 Answer
> 不同的子问题只有 `n` 个左右，指数级的调用都是在重复计算它们。有了缓存，每个子问题只完整算一次，之后的调用在常数时间内返回，总共约 `2n` 次调用。
> There are only about `n` distinct subproblems; the exponential call count is all repeated work on them. With the cache each one is fully computed once and later calls return in constant time, for about `2n` calls in total.

**Q3.** 怎么把空间降到 O(1)？ How do you get the space down to O(1)?

> [!success]- 答案 Answer
> 改成自底向上，避免调用栈。再注意到每一步只用到前两个值，用两个变量滚动更新，就不需要整张表。
> Go bottom-up to avoid the call stack. Then notice each step only needs the previous two values, so two rolling variables replace the table.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[动态规划 Dynamic Programming|动态规划 Dynamic Programming]]（递推公式和重复子问题 the recurrence and repeated subproblems） · [[递归 Recursion|递归 Recursion]]（出口和记忆化 base cases and memoization） · [[数组 Array|数组 Array]]（下标当 key 的缓存 a cache with the index as the key） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（从指数级到线性，调用栈也算空间 from exponential to linear, and the call stack counts as space）
- 上一题 Previous: [[Implement Stack using Queues|225. 用队列实现栈 Implement Stack using Queues]]
- 下一题 Next: [[Insertion Sort|插入排序题 Insertion Sort (NeetCode)]]

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-11-05 |  | ✅ | 看最后一步得到递推公式，用数组记住结果，把指数级降到 O(n) Look at the last step to get the recurrence, and remember results in an array to go from exponential to O(n) |
