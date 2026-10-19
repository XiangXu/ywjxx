---
title: "1299. Replace Elements with Greatest Element on Right Side"
aliases:
  - 将每个元素替换为右侧最大元素
  - LeetCode 1299
tags:
  - LeetCode
  - Interview-Prep
  - Array
difficulty: Easy
pattern: "Array / Reverse Traversal (Suffix Max)"
link: https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/
status: 🟡 review
created: 2026-10-19
publish: true
last-reviewed: 2026-10-19
---

# 🧩 1299. Replace Elements with Greatest Element on Right Side

> [!abstract] TL;DR
> 从右往左遍历，用 `rightMax` 记录“目前为止右边最大的数”（初始 `-1`）。每一步先存下当前值，把位置改成 `rightMax`，再用存下的值更新 `rightMax`。
> Walk right to left with `rightMax` = "largest value seen to the right" (starting at `-1`). At each step, save the current value, overwrite it with `rightMax`, then update `rightMax` with the saved value. ⏱️ O(n) · 🗄️ O(1)

## 1. 📋 题目 Problem

给定数组 `arr`，把每个元素替换成**它右边所有元素中的最大值**，最后一个元素替换成 `-1`，返回修改后的数组。
Replace every element of `arr` with the greatest element among the elements to its right, replace the last element with `-1`, and return the array.

| Input | Output | 说明 Why |
| --- | --- | --- |
| `[17,18,5,4,6,1]` | `[18,6,6,6,1,-1]` | 17 右边最大是 18；18 右边最大是 6… 17's right max is 18; 18's is 6… |
| `[400]` | `[-1]` | 右边没有元素 Nothing to the right |

约束 Constraints: 1 ≤ `arr.length` ≤ 10⁴, 1 ≤ `arr[i]` ≤ 10⁵.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 位置 `i` 的答案只取决于它**右边**的元素。从右往左走时，“右边的最大值”可以一步步累积，不用每次重新找。
  The answer at `i` depends only on what's to its **right**. Walking right to left, the right-side maximum builds up one step at a time, so you never rescan.
- **套路 Pattern:** 反向遍历 + 后缀最大值 (reverse traversal with a running suffix max)。
  `rightMax` 在处理 `i` 时等于 `max(arr[i+1..n-1])`，也就是后缀最大值。
  When you process `i`, `rightMax` equals `max(arr[i+1..n-1])`, the suffix maximum.
- **为什么初始值是 `-1`？ Why start at `-1`?** 最后一个元素右边没有东西，答案就是 `-1`。而所有 `arr[i] >= 1`，所以 `-1` 不会影响后面的 `Math.max`。
  The last element has nothing to its right, so its answer is `-1`. Since every `arr[i] >= 1`, the `-1` never wins a later `Math.max`.

## 3. 🐢 暴力解 Brute Force

- **思路 Idea:** 对每个 `i`，扫描 `i+1..n-1` 找最大值。
  For each `i`, scan `i+1..n-1` for the maximum.
- ⏱️ Time: O(n²) · 🗄️ Space: O(1)（原地覆盖时要从左往右，因为右边的值还要用 overwrite left to right, since the values to the right are still needed）
- 问题：右边的最大值被重复计算了很多次。 The same suffix maxima are recomputed over and over.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class Solution {
    public int[] replaceElements(int[] arr) {
        int rightMax = -1;  // 右边的最大值，最后一个元素的答案就是 -1 max to the right; -1 for the last element
        for (int i = arr.length - 1; i >= 0; i--) {
            int temp = arr[i];                     // 先存下来，下一行会覆盖 save it: the next line overwrites it
            arr[i] = rightMax;                     // 换成右边的最大值 replace with the max to the right
            rightMax = Math.max(rightMax, temp);   // 把当前值纳入“右边” now temp is part of "the right side"
        }
        return arr;
    }
}
```

- ⏱️ Time: O(n): 每个元素访问一次 each element is visited once
- 🗄️ Space: O(1): 原地修改，只有两个变量 in place, two extra integers

> [!example] 走一遍 Trace: `[17,18,5,4,6,1]`
>
> | i | temp | arr[i] ← rightMax | 新 rightMax new rightMax | arr |
> | --- | --- | --- | --- | --- |
> | 5 | 1 | -1 | 1 | `[17,18,5,4,6,-1]` |
> | 4 | 6 | 1 | 6 | `[17,18,5,4,1,-1]` |
> | 3 | 4 | 6 | 6 | `[17,18,5,6,1,-1]` |
> | 2 | 5 | 6 | 6 | `[17,18,6,6,1,-1]` |
> | 1 | 18 | 6 | 18 | `[17,6,6,6,1,-1]` |
> | 0 | 17 | 18 | 18 | `[18,6,6,6,1,-1]` |

> [!warning] 顺序很重要 Order matters
> 必须**先存 `temp`，再覆盖 `arr[i]`，最后更新 `rightMax`**。
> - 如果先更新 `rightMax` 再赋值，`arr[i]` 会把自己也算进去（例如 18 会被替换成 18 而不是 6）。
> - 如果不存 `temp` 直接覆盖，原来的值就丢了，`rightMax` 没法更新。
>
> **Save `temp`, overwrite `arr[i]`, then update `rightMax`.** Update `rightMax` first and `arr[i]` counts itself (18 would become 18 instead of 6). Overwrite without saving and the original value is lost before `rightMax` can use it.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 单个元素 Single element (`[400]` → `[-1]`): 循环只跑一次，写入初始 `-1` → one iteration writes the initial `-1`
- [x] 最后一个元素必须是 `-1` The last element must be `-1`: 由 `rightMax = -1` 的初始值保证 → guaranteed by the initial value
- [x] 严格在右边 Strictly to the right: 不包括自己，见上面的 warning → excludes the element itself, see the warning above
- [x] 递减数组 Decreasing array (`[5,4,3]` → `[4,3,-1]`): 每个位置的答案就是下一个元素 → each answer is the next element
- [x] 重复值 Duplicates (`[2,2,2]` → `[2,2,-1]`): 没问题，`Math.max` 处理相等 → fine, `Math.max` handles ties
- [x] 溢出 Overflow: 值最大 10⁵，`int` 足够 → `int` is plenty

## 6. 🧭 别和这些题搞混 Don't Confuse With

> [!important] “右边最大” ≠ “右边第一个更大” Greatest on the right ≠ next greater
> 本题要的是右边**所有**元素的最大值，一个变量就够。
> 而 Next Greater Element（496 / 503）要的是右边**第一个**比自己大的元素，Daily Temperatures（739）要的是到它的距离，都需要**单调栈**。
> This problem wants the maximum of **everything** to the right, so one variable is enough. Next Greater Element (496 / 503) wants the **first** larger element to the right, and Daily Temperatures (739) wants the distance to it. Both need a **monotonic stack**.
>
> 例 Example `[2,1,5,3]`:
>
> | i | arr[i] | 右边最大 Greatest on right (1299) | 右边第一个更大 Next greater (496) |
> | --- | --- | --- | --- |
> | 0 | 2 | 5 | 5 |
> | 1 | 1 | 5 | 5 |
> | 2 | 5 | 3 | -1 (没有更大 none larger) |
> | 3 | 3 | -1 | -1 |
>
> `i = 2` 这一行最能看出区别：右边最大是 3，但 3 并不比 5 大。 The `i = 2` row shows the difference: the max to the right is 3, but 3 isn't larger than 5.

同一个“前缀 / 后缀最值”思路还会出现在 The same prefix/suffix idea shows up in:

| 题目 Problem | 用法 How it's used |
| --- | --- |
| 121. Best Time to Buy and Sell Stock | 从左往右记录最低价（前缀最小值）track the running minimum price (prefix min) |
| 42. Trapping Rain Water | 每个位置需要左边最大和右边最大 needs both the prefix max and the suffix max at each position |
| 238. Product of Array Except Self | 前缀积 × 后缀积 prefix product × suffix product |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么要从右往左遍历？ Why traverse right to left?

> [!success]- Answer
> 每个位置的答案只依赖右边的元素。从右往左走，右边的最大值可以随着遍历一步步更新，每个位置 O(1) 就能得到答案；从左往右则每次都要重新扫描右边。
> Each answer depends only on elements to the right. Going right to left, the right-side max is updated as you go, so each position costs O(1). Left to right, you'd have to rescan the right side every time.

**Q2.** 循环体里三行的顺序能换吗？ Can you reorder the three lines in the loop?

> [!success]- Answer
> 不能。必须先存 `temp`（否则原值被覆盖后丢失），再写 `arr[i] = rightMax`（此时 `rightMax` 只包含右边的元素），最后才 `rightMax = Math.max(rightMax, temp)`。如果先更新 `rightMax`，答案会错误地包含元素自己。
> No. Save `temp` first (or the original value is lost), then write `arr[i] = rightMax` (while `rightMax` still covers only the right side), then update `rightMax`. Updating `rightMax` first makes each answer wrongly include the element itself.

**Q3.** `rightMax` 的初始值为什么可以是 `-1`？如果题目允许负数呢？ Why does `rightMax` start at `-1`, and what if negative values were allowed?

> [!success]- Answer
> 最后一个元素的答案就是 `-1`，而所有值都 `>= 1`，所以 `-1` 不会在后面的比较中胜出。如果允许 `-5` 这样的负数，`Math.max(-1, -5)` 会得到 `-1`，结果就错了。这时可以单独处理最后一个元素：`arr[n-1] = -1`，再把 `rightMax` 初始化为原来的 `arr[n-1]`。
> The last element's answer is `-1`, and every value is `>= 1`, so `-1` never wins a later comparison. If values like `-5` were allowed, `Math.max(-1, -5)` would return `-1` and the result would be wrong. Then you'd handle the last element separately: save the original `arr[n-1]` as the starting `rightMax`, and set `arr[n-1] = -1`.

**Q4.** 这题和 Next Greater Element 有什么区别？ How is this different from Next Greater Element?

> [!success]- Answer
> 本题要右边**所有**元素的最大值，一个变量 O(1) 空间就够；Next Greater Element 要右边**第一个**比自己大的元素，需要单调栈，O(n) 空间。
> This problem wants the maximum of **all** elements to the right, so one variable (O(1) space) is enough. Next Greater Element wants the **first** larger element to the right, which needs a monotonic stack (O(n) space).

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 上一题 Previous: [[Remove Element|27. Remove Element]]
- 同为一次遍历 Also one pass: [[Max Consecutive Ones|485. Max Consecutive Ones]]

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-19 |  | ✅ | 从右往左 + 后缀最大值，一次写对 Right-to-left suffix max, correct first try |
