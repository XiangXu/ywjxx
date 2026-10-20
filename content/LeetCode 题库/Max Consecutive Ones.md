---
title: "485. Max Consecutive Ones"
aliases:
  - 最大连续 1 的个数
  - LeetCode 485
tags:
  - LeetCode
  - Interview-Prep
  - Array
difficulty: Easy
pattern: "Array / One Pass Counter"
link: https://leetcode.com/problems/max-consecutive-ones/
status: 🟡 review
created: 2026-10-19
publish: true
last-reviewed: 2026-10-19
---

# 🧩 485. Max Consecutive Ones

> [!abstract] TL;DR
> 一次遍历，用 `count` 记当前这段连续 1 的长度，遇到 0 就清零，`max` 记录见过的最长一段。
> One pass: `count` tracks the current run of 1s, reset it on a 0, and keep the best run in `max`. ⏱️ O(n) · 🗄️ O(1)

## 1. 📋 题目 Problem

给定一个只含 `0` 和 `1` 的数组 `nums`，返回其中**最多有多少个连续的 1**。
Given a binary array `nums`, return the maximum number of consecutive `1`s.

| Input | Output | 说明 Why |
| --- | --- | --- |
| `[1,1,0,1,1,1]` | `3` | 最后三个 1 The last three 1s |
| `[1,0,1,1,0,1]` | `2` | 中间两个 1 The middle pair |
| `[0,0]` | `0` | 没有 1 No 1s at all (自拟 own case) |

约束 Constraints: 1 ≤ `nums.length` ≤ 10⁵, `nums[i]` is `0` or `1`.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 数组被 `0` 切成若干段连续的 1，答案就是最长那一段。只需要记住“当前段长度”和“历史最长”两个数字。
  The `0`s split the array into runs of `1`s; the answer is the longest run. Two numbers are enough: the current run length and the best so far.
- **套路 Pattern:** 数组一次遍历 + 计数器 (one pass with a running counter)。它也是滑动窗口的最简形态：窗口里不允许出现 0。
  It's the simplest form of a sliding window: a window that may contain no `0`.

## 3. 🐢 暴力解 Brute Force

- **思路 Idea:** 从每个下标 `i` 出发，向右数连续的 1，取最大值。
  From every index `i`, count 1s to the right until a `0`, and keep the maximum.
- ⏱️ Time: O(n²) · 🗄️ Space: O(1)
- 问题：同一段 1 被重复数了很多次。 Each run gets recounted from every start inside it.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class Solution {
    public int findMaxConsecutiveOnes(int[] nums) {
        int max = 0;    // 历史最长 longest run seen so far
        int count = 0;  // 当前这段长度 length of the current run
        for (int num : nums) {
            if (num == 1) {
                count++;
                max = Math.max(max, count);
            } else {
                count = 0;  // 0 打断连续 a 0 ends the run
            }
        }
        return max;
    }
}
```

- ⏱️ Time: O(n): 每个元素只看一次 each element is visited once
- 🗄️ Space: O(1): 只有两个变量 two integers

> [!example] 走一遍 Trace: `[1,1,0,1,1,1]`
>
> | num | count | max |
> | --- | --- | --- |
> | 1 | 1 | 1 |
> | 1 | 2 | 2 |
> | 0 | 0 | 2 |
> | 1 | 1 | 2 |
> | 1 | 2 | 2 |
> | 1 | 3 | **3** |

> [!tip] 为什么在 `num == 1` 时更新 `max`？ Why update `max` inside the `1` branch?
> 如果只在遇到 `0` 时更新 `max`，数组以 1 结尾时最后一段不会被比较；若它恰好最长，答案就错了（例如 `[1,1,0,1,1,1]` 会返回 2），需要在循环后再补一次 `Math.max`。
> 每次 `count++` 后立刻更新就没有这个问题。
> If you only update `max` when you hit a `0`, the final run is never compared when the array ends in `1`s, which is wrong whenever that run is the longest, so you'd need an extra `Math.max` after the loop. Updating right after `count++` avoids that.

> [!note] 另一种写法 Alternative: 只在段结束时比较
> ```java
> for (int num : nums) {
>     if (num == 1) count++;
>     else { max = Math.max(max, count); count = 0; }
> }
> return Math.max(max, count);  // 别忘了最后一段 don't forget the last run
> ```
> 每段只比较一次，但多一个容易忘的收尾。两种都是 O(n)，面试里第一种更不容易出错。
> One comparison per run, but one more thing to forget. Both are O(n); the first is harder to get wrong in an interview.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 全是 0 All zeros (`[0,0]`): 返回 0，`max` 初始值 0 正好 → returns 0
- [x] 全是 1 All ones (`[1,1,1]`): 最后一段就是答案，必须在循环里或循环后更新 `max` → the last run is the answer
- [x] 单个元素 Single element (`[1]` → 1, `[0]` → 0)
- [x] 以 1 结尾 Ends with 1s: 见上面的 tip → see the tip above
- [x] 溢出 Overflow: 长度最多 10⁵，`int` 足够 → `int` is plenty

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 变化 Twist | 做法 Approach |
| --- | --- | --- |
| 487. Max Consecutive Ones II 🔒 | 最多翻转 **1** 个 0 Flip at most one `0` | 滑动窗口，窗口内最多 1 个 0 Sliding window with ≤ 1 zero |
| 1004. Max Consecutive Ones III | 最多翻转 **k** 个 0 Flip at most `k` zeros | 滑动窗口，窗口内最多 k 个 0 Sliding window with ≤ k zeros |
| 1446. Consecutive Characters | 字符串里最长的同字符段 Longest run of one character | 同样的计数器 Same counter idea |

> [!important] 从 485 到 1004 From 485 to 1004
> 485 其实就是 `k = 0` 的 1004：窗口里不能有 0，遇到 0 时左指针直接跳到 0 后面（也就是 `count = 0`）。
> 理解这一点，II 和 III 就是把“清零”换成“移动左指针直到窗口里的 0 不超过 k 个”。
> 485 is 1004 with `k = 0`: a `0` forces the left edge to jump past it, which is exactly `count = 0`. For II and III, replace "reset" with "move the left pointer until the window holds at most `k` zeros".

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么空间复杂度是 O(1)？ Why is the space O(1)?

> [!success]- Answer
> 只用了 `max` 和 `count` 两个变量，和输入长度无关。
> Only two integers are stored, regardless of the input size.

**Q2.** 把 `max = Math.max(max, count)` 移到 `else` 分支里会出什么错？ What breaks if you move the `Math.max` into the `else` branch?

> [!success]- Answer
> 数组以 1 结尾时，最后一段不会被比较；若它恰好最长就会出错，例如 `[1,1,0,1,1,1]` 会返回 2 而不是 3。需要在 `return` 前再做一次 `Math.max(max, count)`。
> The final run is never compared when the array ends with 1s, so the answer is wrong whenever that run is the longest: `[1,1,0,1,1,1]` returns 2 instead of 3. You'd need one more `Math.max(max, count)` before returning.

**Q3.** 如果允许把最多一个 0 变成 1，思路怎么改？ How would you change the approach if you may flip at most one `0`?

> [!success]- Answer
> 用滑动窗口：右指针一直扩展，记录窗口里 0 的个数；超过 1 个时移动左指针直到只剩 1 个 0。答案是窗口的最大长度 `right - left + 1`。仍然是 O(n) 时间、O(1) 空间。
> Use a sliding window: expand `right`, count zeros in the window, and when there are more than one, move `left` until only one remains. The answer is the largest `right - left + 1`. Still O(n) time, O(1) space.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 套路 Pattern: [[一次遍历 One Pass|一次遍历 One Pass]] · [[数组 Array|数组 Array]]
- 进阶 Next: 1004. Max Consecutive Ones III (sliding window)
- 下一题 Next note: [[Remove Element|27. Remove Element]] (真正的双指针 real two pointers)

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-19 |  | ✅ | 一次遍历 + 计数器，一次写对 One-pass counter, correct first try |
