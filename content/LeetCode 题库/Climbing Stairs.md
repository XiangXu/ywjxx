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

```
到第 5 级的走法 Ways to reach stair 5

  到第 4 级的每种走法，再迈 1 级 every way to stair 4, then a 1-step   f(4) = 5
+ 到第 3 级的每种走法，再迈 2 级 every way to stair 3, then a 2-step   f(3) = 3
= f(5) = 8
```

答案序列是 `1, 2, 3, 5, 8, 13, …`，也就是错开一位的斐波那契数列：`f(n)` 等于 `F(n + 1)`（`F(1) = F(2) = 1`）。
The answers run `1, 2, 3, 5, 8, 13, …`, the Fibonacci numbers shifted by one: `f(n)` equals `F(n + 1)` (with `F(1) = F(2) = 1`).

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 直接照公式递归，不做任何记录。
  Apply the recurrence directly, remembering nothing.

```java
public int climbStairs(int n) {
    if (n <= 2) return n;
    return climbStairs(n - 1) + climbStairs(n - 2);
}
```

- ⏱️ **复杂度 Complexity:** 时间约为 1.618 的 `n` 次方，通常写成上界 O(2ⁿ)；空间 O(n)，是调用栈的深度。
  Time is about 1.618 to the power `n`, usually written as the upper bound O(2ⁿ); space is O(n) for the call stack.
- `n = 45` 时要调用约 23 亿次。按每秒 10⁸ 次的经验值估算要二十多秒；JIT 优化后实际快得多（本地运行约 2 秒），但仍远慢于记忆化的 87 次调用，在线判题时可能超时。
  At `n = 45` that's about 2.3 billion calls. The 10⁸-per-second rule of thumb suggests over 20 seconds; JIT-compiled Java is much faster in practice (about 2 seconds in a local run), but that's still far slower than the 87 memoized calls, and it can time out on a judge.

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

- ⏱️ Time: 每个 `k` 只完整算一次，所以是 O(n) Each `k` is fully computed once, so O(n)
- 🗄️ Space: 数组和调用栈各占 O(n) Both the array and the call stack take O(n)

**为什么是 O(n) Why O(n):** `3` 到 `n` 每个数只有第一次需要真正计算，每次计算发起两个子调用，其他调用都在常数时间内返回。`n >= 2` 时一共 `2n - 3` 次调用（`n = 5` 是 7 次，`n = 45` 是 87 次），而不加缓存时 `n = 45` 要约 23 亿次。
Each value from `3` to `n` does real work only the first time, making two child calls, and every other call returns in constant time. For `n >= 2` that's `2n - 3` calls in total (7 for `n = 5`, 87 for `n = 45`), against about 2.3 billion at `n = 45` without the cache.

**为什么 `0` 能表示没算过 Why `0` can mean "not computed":** Java 的 `int[]` 默认全是 0，而本题的答案至少是 1，所以 0 不会和真实答案混淆。如果答案本身可能是 0，就要换一个标记。
A Java `int[]` starts as all zeros, and every answer here is at least 1, so 0 can't be mistaken for a real answer. If an answer can itself be 0, use a different marker.

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
>
> **矩阵快速幂 Matrix exponentiation:** 把递推写成矩阵的 `n` 次方，时间 O(log n)。`n` 很大时才有优势，这里最多 45，了解即可。
> Write the recurrence as a matrix to the power `n`, for O(log n) time. It only pays off for very large `n`; with at most 45 here, it's just good to know.
>
> **方法名 Method name:** `calculator` 是名词，读起来像一个类。方法名通常用动词或它返回的东西，比如 `countWays`，这样调用处也更好读。
> `calculator` is a noun and reads like a class. Method names are usually verbs or what they return, such as `countWays`, which also reads better at the call site.

| 写法 Approach | ⏱️ Time | 🗄️ Space | 说明 Notes |
| --- | --- | --- | --- |
| 朴素递归 Plain recursion | O(2ⁿ) | O(n) | 可能超时 Can time out |
| 记忆化递归（我的解法） Memoized recursion (mine) | O(n) | O(n) | 直接照公式写 Follows the recurrence directly |
| 自底向上填表 Bottom-up table | O(n) | O(n) | 没有递归 No recursion |
| 两个变量 Two variables | O(n) | O(1) | 面试时通常的最终答案 The usual final answer in an interview |
| 矩阵快速幂 Matrix exponentiation | O(log n) | O(1) | 迭代写法，代码更长 Iterative version, more code |

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 最小输入 Smallest inputs: `n = 1` 和 `n = 2` 都由出口直接返回，不会碰到数组 → `n = 1` and `n = 2` return from the base case without touching the array
- [x] 只有一级 One stair: 填表时写 `dp[2] = 2` 且数组长度是 `n + 1`，`n = 1` 就数组越界；所以上面从 `dp[0]`、`dp[1]` 开始 → writing `dp[2] = 2` with length `n + 1` goes out of bounds at `n = 1`, which is why the table above starts from `dp[0]` and `dp[1]`
- [x] 数组长度 Array length: 要用下标 `n`，长度必须是 `n + 1` → to use index `n`, the length must be `n + 1`
- [x] 出口只对正数成立 The base case only holds for positive n: `n <= 2` 时返回 `n`，但 `n = 0` 会返回 0，而按“什么都不走也算一种”的约定应该是 1；约束保证 `n >= 1`，所以这里没问题 → returning `n` gives 0 at `n = 0`, while the "doing nothing is one way" convention says 1; the constraints guarantee `n >= 1`, so it's fine here
- [x] 整数溢出 Integer overflow: `f(45) = 1836311903` 刚好放得下，`f(46) = 2971215073` 就超过了 `int` 上限；这很可能是约束停在 45 的原因，放宽约束就要用 `long` → `f(45)` just fits, while `f(46)` exceeds the `int` limit, which is likely why the constraint stops at 45; a larger `n` needs `long`
- [x] ⚠️ 忘了写回缓存 Forgetting to store: 只写 `return calculator(n - 1, cache) + calculator(n - 2, cache)` 能得到正确答案，但没有写入缓存，退化成指数级 → this still gives the right answer but never fills the cache, so it falls back to exponential time

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 509. 斐波那契数 Fibonacci Number | 同一个递推，只是出口不同 the same recurrence with different base cases · Easy |
| 1137. 第 N 个泰波那契数 N-th Tribonacci Number | 看前三个值 looks back three values · Easy |
| 746. 使用最小花费爬楼梯 Min Cost Climbing Stairs | 从数方案变成求最小值，加法换成取最小值 from counting to minimizing, so `+` becomes `min` · Easy |
| 198. 打家劫舍 House Robber | 同样只看前两个状态，取较大值 also looks back two states, taking the max · Medium |
| 91. 解码方法 Decode Ways | 爬楼梯加上条件：这一步能不能走要看数字 stairs with conditions: whether a step is allowed depends on the digits · Medium |
| 377. 组合总和 Ⅳ Combination Sum IV | 每次能走的步数变成任意一组数 the allowed steps become any set of numbers · Medium |

**如果每次能爬 1 到 `k` 级 If you can climb 1 to `k` steps:** 最后一步有 `k` 种可能，`f(n) = f(n - 1) + … + f(n - k)`。逐项相加是 O(nk)，维护一个长度为 `k` 的滑动窗口和可以降到 O(n)。
The last step has `k` options, so `f(n) = f(n - 1) + … + f(n - k)`. Adding each term costs O(nk); keeping a sliding sum over the last `k` values brings it down to O(n).

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么 `f(n) = f(n - 1) + f(n - 2)`？为什么是相加而不是取最大值？ Why is `f(n) = f(n - 1) + f(n - 2)`, and why add rather than take the max?

> [!success]- 答案 Answer
> 每种走法的最后一步要么是 1 级（前面是到 `n - 1` 的走法），要么是 2 级（前面是到 `n - 2` 的走法）。这两类覆盖了所有走法，也没有重叠。题目问的是总数，所以相加；求最值的题才取 `max` 或 `min`。
> Every way ends with either a 1-step (after a way to `n - 1`) or a 2-step (after a way to `n - 2`). The two groups cover everything without overlap. The question asks for a total, so they add; `max` or `min` is for optimization problems.

**Q2.** 加了 `cache` 之后，时间为什么从指数级变成 O(n)？ Why does the cache take the time from exponential to O(n)?

> [!success]- 答案 Answer
> 不同的子问题只有 `n` 个左右，指数级的调用都是在重复计算它们。有了缓存，每个子问题只完整算一次，之后的调用在常数时间内返回，总共约 `2n` 次调用。
> There are only about `n` distinct subproblems; the exponential call count is all repeated work on them. With the cache each one is fully computed once and later calls return in constant time, for about `2n` calls in total.

**Q3.** 这个解法的空间由哪两部分组成？ Which two things make up this solution's space?

> [!success]- 答案 Answer
> 数组 `cache` 是 O(n)，调用栈最深约 `n` 层也是 O(n)。即使去掉数组、只留递归，调用栈的 O(n) 也还在（见[[递归 Recursion|递归]]）。
> The `cache` array is O(n), and the call stack, about `n` frames deep, is O(n) too. Even without the array, the recursion's O(n) stack remains (see [[递归 Recursion|Recursion]]).

**Q4.** 怎么把空间降到 O(1)？ How do you get the space down to O(1)?

> [!success]- 答案 Answer
> 改成自底向上，避免调用栈。再注意到每一步只用到前两个值，用两个变量滚动更新，就不需要整张表。
> Go bottom-up to avoid the call stack. Then notice each step only needs the previous two values, so two rolling variables replace the table.

**Q5.** `cache` 用 `0` 表示没算过，什么时候这样做会出问题？ `cache` uses `0` for "not computed". When would that go wrong?

> [!success]- 答案 Answer
> 当 0 本身是合法答案时，比如 91 解码方法里某些位置的方案数就是 0（`"111…100"` 每个位置都是 0）。这时 `cache[n] != 0` 判断不出“算过了”，结果是 0 的子问题每次都重算，可能退化成指数级。可以用 `Arrays.fill(cache, -1)`，或者用 `Integer[]` 以 `null` 表示没算过。
> When 0 is a valid answer, as in 91 Decode Ways, where some positions have zero ways (in `"111…100"`, every position does). Then `cache[n] != 0` can't tell it was computed, so zero-valued subproblems are recomputed every time, which can turn exponential. Use `Arrays.fill(cache, -1)`, or an `Integer[]` with `null` for "not computed".

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[动态规划 Dynamic Programming|动态规划 Dynamic Programming]]（递推公式和重复子问题 the recurrence and repeated subproblems） · [[递归 Recursion|递归 Recursion]]（出口和记忆化 base cases and memoization） · [[数组 Array|数组 Array]]（下标当 key 的缓存 a cache with the index as the key） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（从指数级到线性，调用栈也算空间 from exponential to linear, and the call stack counts as space）
- 上一题 Previous: [[Implement Stack using Queues|225. 用队列实现栈 Implement Stack using Queues]]
- 下一题 Next: [[Insertion Sort|插入排序题 Insertion Sort (NeetCode)]]

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-11-05 |  | ✅ | 看最后一步得到递推公式，用数组记住结果，把指数级降到 O(n) Look at the last step to get the recurrence, and remember results in an array to go from exponential to O(n) |
