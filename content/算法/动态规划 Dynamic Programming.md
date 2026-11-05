---
title: "动态规划 Dynamic Programming"
aliases:
  - 动态规划
  - Dynamic Programming
  - DP
  - 记忆化
  - Memoization
  - 重复子问题
  - Overlapping Subproblems
  - 最优子结构
  - Optimal Substructure
tags:
  - DSA
  - Algorithms
  - Dynamic-Programming
  - Interview-Prep
created: 2026-11-05
publish: true
---

# 🧠 动态规划 Dynamic Programming

> [!abstract] TL;DR
> 动态规划就是**把大问题拆成子问题，并且每个子问题只算一次**。当递归里出现大量重复的子问题时，把结果存下来，时间通常能从指数级降到多项式级。写法有两种：**自顶向下**（递归加记忆化）和**自底向上**（循环填表），时间复杂度通常相同。
> Dynamic programming **breaks a problem into subproblems and solves each one once**. When a recursion keeps repeating the same subproblems, storing the results usually takes the time from exponential to polynomial. It comes in two forms, **top-down** (recursion plus memoization) and **bottom-up** (a loop filling a table), usually with the same time complexity.

## 1. 🎯 核心概念 Overview

### 1.1 两个条件 Two conditions

| 条件 Condition | 意思 Meaning | 在 [[Climbing Stairs\|70]] 里 In 70 |
| --- | --- | --- |
| **重复子问题 Overlapping subproblems** | 同一个子问题会被用到很多次 the same subproblem is needed many times | 计算 `f(5)` 和 `f(4)` 时都要用 `f(3)` 的结果 Both `f(5)` and `f(4)` need `f(3)` |
| **能由子问题得出答案 Built from subproblems** | 大问题的答案能由子问题的答案算出来 a larger answer can be computed from smaller answers | `f(n) = f(n - 1) + f(n - 2)` |

求最值的题里，第二个条件通常叫**最优子结构**：整体最优解由子问题的最优解组成。计数题没有“最优”，但道理一样。
In optimization problems the second condition is usually called **optimal substructure**: the best overall answer is built from the best answers to subproblems. Counting problems have no "best", but the idea is the same.

> [!note] 和分治的区别 How it differs from divide and conquer
> 两者都拆子问题。分治（如归并排序）的子问题**互不重叠**，存下来也用不上；动态规划的子问题**会重复出现**，存下来才有意义。
> Both split into subproblems. Divide and conquer (like merge sort) has subproblems that **don't overlap**, so storing them gains nothing; DP's subproblems **repeat**, which is what makes storing them worthwhile.

### 1.2 两种写法 Two forms

| | 自顶向下 Top-down | 自底向上 Bottom-up |
| --- | --- | --- |
| 叫法 Name | 记忆化 memoization | 填表 tabulation |
| 实现 How | 递归加缓存 recursion plus a cache | 循环填数组 a loop filling an array |
| 计算顺序 Order | 用到哪个才算哪个 computes only what's needed | 自己安排，先小后大 you choose it, small to large |
| 调用栈 Call stack | 与递归深度成正比 Proportional to the depth | 没有 None |
| 优点 Strength | 直接照公式写，容易想到 follows the recurrence directly | 没有递归开销，容易压缩空间 no recursion overhead, easy to shrink the space |
| 缺点 Weakness | 太深可能栈溢出 very deep recursion can overflow | 要想清楚填表顺序 you must work out the fill order |

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - **问方案数 Counting ways:** 题目问“有多少种方法”（[[Climbing Stairs|70]]、91、62） → "how many ways" ([[Climbing Stairs|70]], 91, 62)
  - **问最值 Finding a best value:** 题目问“最少”、“最多”、“最长”，每一步要做选择（322、198、300） → "minimum", "maximum" or "longest", with a choice at each step (322, 198, 300)
  - **问可行性 Asking if it's possible:** 题目问“能不能”，并且贪心行不通（139、416） → "can it be done", where greedy doesn't work (139, 416)
  - **朴素递归会重复计算 Plain recursion repeats work:** 画递归树时同一个节点出现多次 → the same node shows up many times in the recursion tree
- ❌ 子问题不重叠，用普通递归或分治就够了 Subproblems don't overlap: plain recursion or divide and conquer is enough
- ❌ 局部最优能保证整体最优，贪心通常更简单 A local best guarantees the overall best: greedy is usually simpler
- ❌ 要列出所有方案而不只是数量，通常要用回溯 You must list every solution, not just count them: usually backtracking

## 3. ⚙️ 原理 How It Works

### 3.1 解题四步 Four steps to solve one

1. **定状态 Define the state:** 用一句话写下 `f(i)` 是什么。这是最难也最重要的一步。如 “`f(i)` 是爬到第 `i` 级的方法数”。
   Write one sentence saying what `f(i)` means. This is the hardest and most important step, e.g. "`f(i)` is the number of ways to reach stair `i`".
2. **找递推 Find the recurrence:** 看最后一步有哪些选择，每个选择对应哪个更小的子问题。
   Look at the choices for the last step, and which smaller subproblem each one leads to.
3. **定出口 Set the base cases:** 最小的、不能再拆的状态是什么？要覆盖递推能走到的所有最小输入。
   What are the smallest states that can't be split further? Cover every minimal input the recurrence can reach.
4. **定顺序 Choose the order:** 算 `f(i)` 时，它依赖的状态必须已经算好。一维通常是从小到大。
   When computing `f(i)`, the states it depends on must already be done. In one dimension that's usually small to large.

### 3.2 从递归一步步优化 Optimizing step by step from recursion

以 [[Climbing Stairs|70]] 为例，同一个公式有四种写法，通常按这个顺序改进：
Taking 70 as the example, the same recurrence has four versions, usually improved in this order:

| 写法 Version | ⏱️ Time | 🗄️ Space | 改进了什么 What improved |
| --- | --- | --- | --- |
| 朴素递归 Plain recursion | O(2ⁿ) | O(n) | 起点 The starting point |
| 记忆化 Memoization | O(n) | O(n) | 每个子问题只算一次 Each subproblem is computed once |
| 填表 Tabulation | O(n) | O(n) | 去掉调用栈 No more call stack |
| 滚动变量 Rolling variables | O(n) | O(1) | 只留用得到的状态 Keeps only the states still needed |

> [!tip] 怎么判断能否压缩空间 When can the space shrink?
> 看 `f(i)` 依赖多远。[[Climbing Stairs|70]] 只看前两个值，两个变量就够。如果依赖所有更小的状态（如 300 最长递增子序列的 DP 写法），就要留下整张表。
> Check how far back `f(i)` looks. 70 only needs the previous two values, so two variables are enough. If it depends on every smaller state (like the DP version of 300 Longest Increasing Subsequence), you need the whole table.

### 3.3 复杂度怎么算 Working out the complexity

**时间 Time:** 约等于状态数乘以每个状态的转移数。70 有 `n` 个状态，每个看 2 个选择，所以是 O(n)；322 零钱兑换有 `amount` 个状态，每个试 `k` 种硬币，所以是 O(amount × k)。
About the number of states times the transitions per state. 70 has `n` states with 2 choices each, so O(n); 322 Coin Change has `amount` states trying `k` coins each, so O(amount × k).

## 4. 💻 模板代码 Code Template

```java
// 自顶向下 Top-down: 递归加缓存 recursion plus a cache
int solve(int i, int[] memo) {               // memo 先填 -1 fill memo with -1 first
    if (i <= BASE) return baseAnswer(i);      // ① 出口 base case
    if (memo[i] != -1) return memo[i];        // ② 算过就直接用 reuse if computed
    return memo[i] = combine(solve(i - 1, memo), solve(i - 2, memo));  // ③ 递推并写回 recurse and store
}

// 自底向上 Bottom-up: 循环填表 a loop filling a table
int solve(int n) {
    int[] dp = new int[n + 1];
    dp[0] = BASE_0;                           // ① 出口 base cases
    dp[1] = BASE_1;
    for (int i = 2; i <= n; i++) {            // ② 先小后大 small to large
        dp[i] = combine(dp[i - 1], dp[i - 2]);
    }
    return dp[n];
}

// 滚动变量 Rolling variables: 只依赖前两个值时 when only the previous two values are needed
int solve(int n) {
    int prev = BASE_0, curr = BASE_1;
    for (int i = 2; i <= n; i++) {
        int next = combine(prev, curr);
        prev = curr;
        curr = next;
    }
    return curr;
}
```

后两个模板假设 `n >= 1`；`n` 可能是 0 时，先判断。填表写法的 `dp[1]` 会越界，滚动写法会错误地返回 `BASE_1`。
The last two templates assume `n >= 1`; if `n` can be 0, check first. The table version's `dp[1]` would go out of bounds, and the rolling version would wrongly return `BASE_1`.

## 5. ⏱️ 复杂度 Complexity

| 题目 Problem | 状态 State | ⏱️ Time | 🗄️ Space |
| --- | --- | --- | --- |
| [[Climbing Stairs\|70. 爬楼梯 Climbing Stairs]] | `f(i)`：到第 `i` 级的方法数 ways to reach stair `i` | O(n) | O(n)，可压缩到常数空间 O(n), reducible to O(1) |
| 198. 打家劫舍 House Robber | `f(i)`：前 `i` 间房的最大金额 the max from the first `i` houses | O(n) | O(n)，可压缩到常数空间 O(n), reducible to O(1) |
| 322. 零钱兑换 Coin Change | `f(a)`：凑出金额 `a` 的最少硬币数 the fewest coins for amount `a` | O(amount × k) | O(amount) |
| 62. 不同路径 Unique Paths | `f(i, j)`：到格子 `(i, j)` 的路径数 paths to cell `(i, j)` | O(m × n) | O(m × n)，可压缩到一行 O(m × n), reducible to one row |

## 6. ⚠️ 常见坑 Common Pitfalls

- **用错“没算过”的标记 The wrong "not computed" marker:** `int[]` 默认是 0，如果 0 是合法答案，`memo[i] != 0` 就判断不出来，结果是 0 的状态每次都重算。[[Climbing Stairs|70]] 的答案至少是 1，所以用 0 没问题；一般情况用 `Arrays.fill(memo, -1)` 或 `Integer[]` → `int[]` defaults to 0, so if 0 is a valid answer, `memo[i] != 0` can't tell and those states are recomputed every time. 70's answers are at least 1, so 0 works there; in general use `Arrays.fill(memo, -1)` or `Integer[]`.
- **算了但没存 Computing without storing:** 只 `return` 不写 `memo[i]`，答案对，但时间还是指数级 → returning without writing `memo[i]` gives the right answer in exponential time.
- **状态定义含糊 A vague state:** 说不清 `f(i)` 是什么，递推也就写不对。先写下一句话的定义 → if you can't say what `f(i)` means, the recurrence won't come out right. Write the one-sentence definition first.
- **数组越界 Going out of bounds:** 要用下标 `n` 就要 `new int[n + 1]`；`n` 很小时，给 `dp[2]` 赋值也可能越界（见 [[Climbing Stairs|70]]） → using index `n` needs `new int[n + 1]`, and at small `n` even assigning `dp[2]` can go out of bounds.
- **整数溢出 Integer overflow:** 方案数增长很快，[[Climbing Stairs|70]] 的 `f(46)` 就超过了 `int` 上限。注意题目的约束，或者用 `long`、按题目要求取模 → counts grow fast, and 70's `f(46)` already exceeds the `int` limit. Watch the constraints, or use `long` or the modulus the problem asks for.
- **压缩空间时覆盖了还要用的值 Overwriting a value still needed:** 滚动更新要注意顺序，先算出 `next`，再移动 `prev` 和 `curr` → with rolling variables, compute `next` first, then shift `prev` and `curr`.
- **递归太深 Recursing too deep:** 记忆化也要占调用栈，状态很多时可能 `StackOverflowError`，这时改成填表（见[[递归 Recursion|递归]]） → memoization still uses the call stack, so many states can overflow it; switch to a table (see [[递归 Recursion|Recursion]]).

## 7. ❓ 复习题 Review Questions

**Q1.** 一道题能用动态规划，通常要满足哪两个条件？ Which two conditions usually make a problem suitable for DP?

> [!success]- 答案 Answer
> 有重复的子问题，并且大问题的答案能由子问题的答案算出来（求最值时叫最优子结构）。
> Overlapping subproblems, and a larger answer that can be computed from smaller answers (called optimal substructure in optimization problems).

**Q2.** 动态规划和分治有什么区别？ How does DP differ from divide and conquer?

> [!success]- 答案 Answer
> 都是拆成子问题。分治的子问题互不重叠（归并排序的左右两半），存下来也用不上；动态规划的子问题会重复出现，所以要存下来。
> Both split into subproblems. Divide and conquer's don't overlap (the two halves in merge sort), so storing them gains nothing; DP's repeat, so they're worth storing.

**Q3.** 自顶向下和自底向上怎么选？ How do you choose between top-down and bottom-up?

> [!success]- 答案 Answer
> 自顶向下更容易从公式写出来，而且只算用得到的状态，适合状态稀疏或顺序不好想的题。自底向上没有调用栈开销，也更容易压缩空间。面试时可以先写容易想到的那个，再说明怎么优化。
> Top-down follows the recurrence directly and computes only the states it needs, which suits sparse states or an awkward fill order. Bottom-up has no call stack overhead and is easier to shrink. In an interview, start with whichever comes to mind first, then explain how to optimize it.

**Q4.** 怎么估算动态规划的时间复杂度？ How do you estimate a DP's time complexity?

> [!success]- 答案 Answer
> 状态数乘以每个状态的转移数。例如 322 零钱兑换有 `amount` 个状态，每个状态试 `k` 种硬币，所以是 O(amount × k)。
> The number of states times the transitions per state. For example, 322 Coin Change has `amount` states trying `k` coins each, so O(amount × k).

**Q5.** 什么时候可以把一维的表压缩成几个变量？ When can a one-dimensional table shrink to a few variables?

> [!success]- 答案 Answer
> 当 `f(i)` 只依赖固定的几个前面的状态时，比如 70 只看前两个值。如果依赖所有更小的状态，或者最后要还原出具体方案，通常就要留着表。
> When `f(i)` depends on only a fixed few earlier states, as 70 does with the previous two. If it depends on every smaller state, or you must reconstruct the actual solution afterwards, you usually keep the table.

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices | 难度 Difficulty |
| --- | --- | --- |
| ✅ [[Climbing Stairs\|70. 爬楼梯 Climbing Stairs]] | 看最后一步，记忆化，压缩空间 look at the last step, memoize, shrink the space | Easy |
| 509. 斐波那契数 Fibonacci Number | 最简单的递推 the simplest recurrence | Easy |
| 746. 使用最小花费爬楼梯 Min Cost Climbing Stairs | 从计数变成求最小值 from counting to minimizing | Easy |
| 198. 打家劫舍 House Robber | 选或不选 take it or skip it | Medium |
| 322. 零钱兑换 Coin Change | 每个状态试多种选择，贪心不一定对 several choices per state, where greedy can fail | Medium |
| 62. 不同路径 Unique Paths | 二维状态 two-dimensional states | Medium |
| 300. 最长递增子序列 Longest Increasing Subsequence | 依赖所有更小的状态 depends on every smaller state | Medium |
| 1143. 最长公共子序列 Longest Common Subsequence | 两个字符串的二维状态 two-dimensional states over two strings | Medium |

## 9. 🔗 相关 Related

- [[📌 算法总览]]
- 基础 Foundation: [[递归 Recursion|递归 Recursion]]（自顶向下就是递归加缓存 top-down is recursion plus a cache）
- 复杂度 Complexity: [[复杂度分析 Big-O|复杂度分析 Big-O]]（用空间换时间，调用栈也算空间 trading space for time, and the call stack counts as space）
- 数据结构 Data structures: [[数组 Array|数组 Array]]（最常用的表 the usual table）
