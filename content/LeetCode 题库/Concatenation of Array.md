---
title: "1929. Concatenation of Array"
aliases:
  - 数组串联
  - LeetCode 1929
tags:
  - LeetCode
  - Interview-Prep
  - Array
difficulty: Easy
pattern: "Array / Simulation (Index Mapping)"
link: https://leetcode.com/problems/concatenation-of-array/
status: 🟡 review
created: 2026-10-19
publish: true
last-reviewed: 2026-10-19
---

# 🧩 1929. Concatenation of Array

> [!abstract] TL;DR
> 新建长度 `2n` 的数组，一次遍历同时写两个位置：`result[i] = nums[i]`，`result[i + n] = nums[i]`。
> Allocate an array of length `2n` and fill both halves in one pass: `result[i] = nums[i]` and `result[i + n] = nums[i]`. ⏱️ O(n) · 🗄️ O(n) for the output (O(1) extra)

## 1. 📋 题目 Problem

给定长度为 `n` 的数组 `nums`，返回长度为 `2n` 的数组 `ans`，满足 `ans[i] == nums[i]` 且 `ans[i + n] == nums[i]`（`0 <= i < n`），也就是把 `nums` 自己接在自己后面。
Given `nums` of length `n`, return `ans` of length `2n` where `ans[i] == nums[i]` and `ans[i + n] == nums[i]` for `0 <= i < n`. In other words, `nums` followed by itself.

| Input | Output |
| --- | --- |
| `[1,2,1]` | `[1,2,1,1,2,1]` |
| `[1,3,2,1]` | `[1,3,2,1,1,3,2,1]` |

约束 Constraints: `n == nums.length`, 1 ≤ `n` ≤ 1000, 1 ≤ `nums[i]` ≤ 1000.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 输出的每个位置都能直接算出来源：`ans[j] = nums[j % n]`。不需要任何技巧，按下标映射填就行。
  Every output slot maps straight back to an input slot: `ans[j] = nums[j % n]`. No trick needed, just fill by index.
- **套路 Pattern:** 模拟 / 下标映射 (simulation by index mapping)。这题的价值在于练熟数组下标，以及认识“把数组复制一份接在后面”这个处理**环形数组**的常用技巧（见第 6 节）。
  Simulation by index mapping. The value here is index fluency, plus meeting the "append a copy of the array" trick that's commonly used for **circular arrays** (see section 6).

## 3. 🐢 暴力解 Brute Force

这题没有更慢的“暴力解”：输出有 `2n` 个元素，每个都至少要写一次，所以 O(n) 已经是下界，直接写就是最优解。
There's no meaningfully slower brute force: the output has `2n` elements and each must be written at least once, so O(n) is already the lower bound. The direct approach is optimal.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class Solution {
    public int[] getConcatenation(int[] nums) {
        int[] result = new int[nums.length * 2];
        for (int i = 0; i < nums.length; i++) {
            result[i] = nums[i];                 // 前半部分 first half
            result[i + nums.length] = nums[i];   // 后半部分，偏移 n second half, offset by n
        }
        return result;
    }
}
```

- ⏱️ Time: O(n): 循环 `n` 次，每次写两个位置 `n` iterations, two writes each
- 🗄️ Space: O(n) 用于输出数组；除输出外只用 O(1) 额外空间 O(n) for the output array; O(1) extra beyond it

> [!example] 走一遍 Trace: `nums = [1,2,1]`, `n = 3`
>
> | i | nums[i] | 写入 Writes | result |
> | --- | --- | --- | --- |
> | 0 | 1 | `result[0]`, `result[3]` | `[1,0,0,1,0,0]` |
> | 1 | 2 | `result[1]`, `result[4]` | `[1,2,0,1,2,0]` |
> | 2 | 1 | `result[2]`, `result[5]` | `[1,2,1,1,2,1]` |
>
> Java 新建的 `int[]` 默认全是 0，所以没写到的位置显示为 0。 A new `int[]` in Java starts as all zeros, which is why unwritten slots show 0.

> [!note] 其他写法 Alternatives
> **取模 Modulo:** 一个循环遍历输出数组 One loop over the output
> ```java
> int n = nums.length;
> int[] ans = new int[2 * n];
> for (int j = 0; j < 2 * n; j++) {
>     ans[j] = nums[j % n];
> }
> ```
> **`System.arraycopy`:** 用 JDK 的批量复制 use the JDK's bulk copy
> ```java
> int n = nums.length;
> int[] ans = new int[2 * n];
> System.arraycopy(nums, 0, ans, 0, n);  // 前半 first half
> System.arraycopy(nums, 0, ans, n, n);  // 后半 second half
> ```
> 三种都是 O(n)。`System.arraycopy` 是 JDK 的原生批量复制，常数更小，但 `n ≤ 1000` 时差别可以忽略；取模写法最短，而且 `j % n` 正是环形数组的下标写法。
> All three are O(n). `System.arraycopy` is the JDK's native bulk copy with a smaller constant factor, though at `n ≤ 1000` the difference is negligible; the modulo version is the shortest, and `j % n` is exactly how circular arrays are indexed.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 单个元素 Single element (`[5]` → `[5,5]`)
- [x] 结果数组长度是 `2n`，不是 `n + 1` 或 `n` The result has length `2n`
- [x] 后半部分偏移 Offset for the second half: `i + n`，不是 `i + n - 1` → `i + n`, not `i + n - 1` (off-by-one)
- [x] 不能原地完成 Can't be done in place: Java 数组长度固定，必须新建数组 → Java arrays have a fixed length, so a new array is required
- [x] 空数组 Empty array: 约束保证 `n >= 1`；即使 `n = 0`，代码也会返回空数组 → the constraints guarantee `n >= 1`; even with `n = 0` the code returns an empty array

## 6. 🔁 进阶 Follow-ups

> [!important] 环形数组技巧 The circular-array trick
> 把数组接在自己后面（或者用 `i % n` 假装接上了），是处理**环形数组**的常用方法：从任何位置往后走 `n` 步，都不用担心越界。
> Appending the array to itself (or pretending to with `i % n`) is a standard way to handle **circular arrays**: from any position you can walk forward `n` steps without falling off the end.
>
> 例 Example: 503. Next Greater Element II 在环形数组上找右边第一个更大的元素，常见写法就是让 `i` 从 `0` 走到 `2n - 1`，用 `nums[i % n]` 取值，相当于遍历了这题的输出数组，但不真的新建它。
> 503 looks for the next greater element in a circular array. The usual solution loops `i` from `0` to `2n - 1` and reads `nums[i % n]`: it walks this problem's output without ever building it.

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 1470. Shuffle the Array | 也是下标映射：`ans[2i] = nums[i]`，`ans[2i + 1] = nums[i + n]` Also index mapping: `ans[2i] = nums[i]`, `ans[2i + 1] = nums[i + n]` |
| 1920. Build Array from Permutation | 下标映射：`ans[i] = nums[nums[i]]` Index mapping: `ans[i] = nums[nums[i]]` |
| 189. Rotate Array | 新位置是 `(i + k) % n`，同样是取模 The new position is `(i + k) % n`, modulo again |
| 503. Next Greater Element II | 环形数组，用 `i % n` 遍历两圈 Circular array, two laps with `i % n` |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么空间复杂度通常说是 O(1) 额外空间，而不是 O(n)？ Why is the extra space usually called O(1) rather than O(n)?

> [!success]- 答案 Answer
> 题目要求返回的输出数组一般不算在额外空间里。除了 `result`，代码只用了循环变量 `i`。如果把输出也算上，就是 O(n)。
> The required output array usually isn't counted as extra space. Apart from `result`, the code only uses the loop variable `i`. Counting the output, it's O(n).

**Q2.** 用一个循环、只写一行赋值，怎么写？ How would you write it with one loop and a single assignment?

> [!success]- 答案 Answer
> 遍历输出数组，`ans[j] = nums[j % n]`，`j` 从 `0` 到 `2n - 1`。
> Loop over the output: `ans[j] = nums[j % n]` for `j` from `0` to `2n - 1`.

**Q3.** 这个“复制一份接在后面”的技巧在哪类题里有用？ Where is the "append a copy" trick useful?

> [!success]- 答案 Answer
> 环形数组的题，比如 503. Next Greater Element II：从每个位置往后看一整圈。实际写代码时通常不真的复制，而是遍历 `2n` 次并用 `i % n` 取值，省掉复制数组的 O(n) 额外空间（单调栈本身仍是 O(n)）。
> Circular-array problems like 503. Next Greater Element II, where each position looks a full lap ahead. In practice you usually don't copy at all: loop `2n` times and read `nums[i % n]`, which saves the O(n) copy (the monotonic stack itself is still O(n)).

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 套路 Pattern: [[一次遍历 One Pass|一次遍历 One Pass]]（下标映射 index mapping） · [[数组 Array|数组 Array]]
- 上一题 Previous: [[Replace Elements with Greatest Element on Right Side|1299. Replace Elements with Greatest Element on Right Side]]
- 下一题 Next: [[Design Dynamic Array|Design Dynamic Array (Resizable Array)]]
- 同为一次遍历 Also one pass: [[Max Consecutive Ones|485. Max Consecutive Ones]]

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-19 |  | ✅ | 一次遍历同时写两半，一次写对 One pass filling both halves, correct first try |
