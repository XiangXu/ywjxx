---
title: "双指针 Two Pointers"
aliases:
  - 双指针
  - Two Pointers
  - 快慢指针
  - Fast and Slow Pointers
  - Read Write Pointers
  - 相向双指针
tags:
  - DSA
  - Algorithms
  - Two-Pointers
  - Interview-Prep
created: 2026-10-20
publish: true
---

# 👉👈 双指针 Two Pointers

> [!abstract] TL;DR
> 用两个下标在数组里一起移动，把“两层循环 O(n²)”或“额外数组 O(n) 空间”降成**一次遍历 O(n)、O(1) 空间**。最常见两种：**同向（快慢 / 读写）指针**做原地过滤，**相向指针**从两端往中间夹。
> Move two indices through the array together to turn a nested O(n²) loop, or an O(n) scratch array, into **one O(n) pass with O(1) space**. The two common shapes: **same-direction (fast/slow, read/write) pointers** for in-place filtering, and **opposite-direction pointers** that close in from both ends.

## 1. 🎯 核心概念 Overview

| 类型 Type | 怎么动 How they move | 典型用途 Typical use |
| --- | --- | --- |
| 🐇🐢 同向 / 快慢 Same direction (fast/slow) | 都从左边出发，快指针每步都走，慢指针满足条件才走 both start left; fast always moves, slow only when a condition holds | 原地删除、去重、移动元素 in-place remove, dedupe, move |
| 👉👈 相向 Opposite direction | 一个从左、一个从右，往中间走直到相遇 one from each end, moving inward until they meet | 反转、回文、有序数组两数之和 reverse, palindrome, pair sum on sorted input |

> [!note] 滑动窗口也是双指针 Sliding window is two pointers too
> 滑动窗口是同向双指针的一种：两个指针围出一个区间 `[left, right]`，右边扩、左边缩。它有自己的套路，以后单独写笔记。
> A sliding window is a same-direction variant where the two pointers bound a range `[left, right]` that grows on the right and shrinks on the left. It gets its own note later.

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - “**原地**”、“**O(1) 额外空间**”、“返回新长度” → 同向读写指针
    "**In place**", "**O(1) extra space**", "return the new length" → read/write pointers
  - “**有序数组**” + 找一对 → 相向指针
    "**Sorted array**" + find a pair → opposite pointers
  - “反转”、“回文” → 相向指针
    "Reverse", "palindrome" → opposite pointers
  - 暴力解是两层循环，而且内层循环在“重新扫已经扫过的部分”
    The brute force is a nested loop that rescans what it already saw

## 3. ⚙️ 原理 How It Works

### 3.1 同向读写指针 Read/write pointers

把数组看成三段：`[0, slow)` 是**已经确定保留的结果**，`[slow, fast)` 是已读过、可以被覆盖的，`[fast, n)` 还没看。
Think of the array as three zones: `[0, slow)` is the **kept result**, `[slow, fast)` is already read and safe to overwrite, and `[fast, n)` is unseen.

```
         结果 kept      丢弃 discarded   未看 unseen
       ┌───────────────┬───────────────┬──────────────┐
nums:  │ 2   2         │ 3             │ 3   4        │
       └───────────────┴───────────────┴──────────────┘
                        ↑ slow          ↑ fast
```

1. `fast` 每一步都前进，负责**读** fast moves every step and **reads**.
2. 如果 `nums[fast]` 要保留，就写到 `nums[slow]`，然后 `slow++`，负责**写** if `nums[fast]` should stay, write it to `nums[slow]` and advance slow, which **writes**.
3. 结束时 `slow` 就是结果长度 at the end, `slow` is the result length.

因为 `slow ≤ fast` 始终成立，写入永远不会覆盖还没读的元素，所以能原地完成。
Because `slow ≤ fast` always holds, a write never clobbers an unread element, so it works in place.

### 3.2 相向指针 Opposite pointers

`left = 0`, `right = n - 1`，每一步根据比较结果**移动一个（或两个）指针**，`left < right` 时继续。每步至少排除一个元素，所以最多 n 步。
Start with `left = 0`, `right = n - 1`; each step moves one (or both) pointers based on a comparison, while `left < right`. Every step rules out at least one element, so there are at most n steps.

> [!important] 有序数组两数之和为什么能用相向指针？ Why does pair-sum on a sorted array work?
> 若 `nums[left] + nums[right] < target`，那 `nums[left]` 和任何 `right` 左边的数相加都只会更小，`left` 不可能是答案的一部分，可以安全地 `left++`。`> target` 时同理 `right--`。每一步都**排除了一整行可能的组合**，这就是 O(n²) 变 O(n) 的原因。
> If `nums[left] + nums[right] < target`, pairing `nums[left]` with anything left of `right` is even smaller, so `left` can't be in the answer: `left++` safely. Symmetrically `right--` when the sum is too big. Each step **discards a whole row of candidate pairs**, which is how O(n²) becomes O(n).

## 4. 💻 模板代码 Code Template

**同向：原地过滤 Same direction: filter in place**（[[Remove Element|27. 移除元素 Remove Element]]）

```java
int slow = 0;                            // 下一个写入位置 next write slot
for (int fast = 0; fast < nums.length; fast++) {
    if (keep(nums[fast])) {              // 题目决定保留条件 the problem decides what to keep
        nums[slow] = nums[fast];
        slow++;
    }
}
return slow;                             // 结果长度 result length
```

| 题目 Problem | 保留条件 `keep(...)` condition |
| --- | --- |
| 27. Remove Element | `nums[fast] != val` |
| 26. Remove Duplicates from Sorted Array | `slow == 0 \|\| nums[fast] != nums[slow - 1]` |
| 283. Move Zeroes | `nums[fast] != 0`（之后把 `[slow, n)` 填 0，或改用交换 then zero-fill `[slow, n)`, or swap instead） |

**相向：从两端夹 Opposite: close in from both ends**

```java
int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) {
        return new int[] {left, right};  // 167 要求从 1 开始 wants 1-indexed: {left + 1, right + 1}
    } else if (sum < target) {
        left++;                          // 需要更大 need bigger
    } else {
        right--;                         // 需要更小 need smaller
    }
}
return new int[] {-1, -1};
```

反转数组 Reverse: `while (left < right) { swap(nums, left++, right--); }`

## 5. ⏱️ 复杂度 Complexity

| 操作 Operation | ⏱️ Time | 🗄️ Space |
| --- | --- | --- |
| 同向原地过滤 Same-direction filter | O(n) | O(1) |
| 相向（数组已有序） Opposite, already sorted | O(n) | O(1) |
| 相向（需要先排序） Opposite, sort first | O(n log n) | O(1) 到 O(n)，取决于排序实现 depends on the sort |

## 6. ⚠️ 常见坑 Common Pitfalls

- **`left < right` 还是 `left <= right`？ `left < right` or `left <= right`?** 两个指针指向同一个元素时还要不要处理？反转、两数之和用 `<`（一个元素不能和自己配对）；[[Remove Element|27]] 的相向写法里 `right` 是开区间 `nums.length`，所以 `left < right` 正好覆盖每个元素。
  Do you still need to process the element when both pointers meet? Reverse and pair-sum use `<` (an element can't pair with itself). In 27's opposite-pointer version `right` starts at `nums.length` (exclusive), so `left < right` covers every element.
- **换过来的元素还没检查 The swapped-in element is unchecked:** 27 的相向写法用末尾元素填坑后**不能** `left++`，因为新来的值也可能等于 `val`。
  In 27's opposite version, after filling the hole from the end you must **not** `left++`: the new value might also equal `val`.
- **相向指针依赖有序 Opposite pointers rely on order:** 两数之和的“移动哪边”的逻辑只在有序时成立。无序就用哈希表（1. Two Sum），或先排序（但会丢失原始下标）。
  The "which side to move" logic only holds on sorted input. Unsorted: use a hash map (1. Two Sum), or sort first (losing the original indices).
- **同向写法是否保序 Order preserved?** 读写指针保持相对顺序；相向填坑不保序。题目要求保序时只能用前者。
  Read/write pointers keep relative order; filling holes from the end doesn't. If order matters, use the former.

## 7. ❓ 复习题 Review Questions

**Q1.** 读写指针为什么能原地完成，不会覆盖还没读的数据？ Why can read/write pointers work in place without overwriting unread data?

> [!success]- 答案 Answer
> 因为 `slow ≤ fast` 始终成立：写的位置永远不在读的位置之后。被覆盖的 `nums[slow]` 要么已经读过（被丢弃或已复制到前面），要么就是 `fast` 自己。
> Because `slow ≤ fast` always holds: the write position never passes the read position. The overwritten `nums[slow]` was either already read (discarded or copied forward) or is `fast` itself.

**Q2.** 有序数组找两数之和等于 target，为什么 `sum < target` 时可以放心 `left++`？ On a sorted array, why is `left++` safe when `sum < target`?

> [!success]- 答案 Answer
> `nums[right]` 是当前还可能配对的最大值。`nums[left]` 和最大的都凑不够，和更小的更凑不够，所以 `nums[left]` 不可能在答案里，排除它不会漏解。
> `nums[right]` is the largest value still available. If `nums[left]` falls short even with it, it falls short with anything smaller, so `nums[left]` can't be in any answer and dropping it loses nothing.

**Q3.** 两种写法在 27. Remove Element 里各在什么情况下更好？ When is each version of 27 better?

> [!success]- 答案 Answer
> 读写指针：要保持顺序，或 `val` 很多时。相向填坑：`val` 很少时写入次数更少（写入次数 = `val` 的个数），但不保序。两者都是 O(n) 时间 O(1) 空间。
> Read/write: when order must be kept, or when `val` is common. Fill-from-end: fewer writes when `val` is rare (writes = number of `val`s), but order isn't kept. Both are O(n) time, O(1) space.

**Q4.** 在 26. Remove Duplicates from Sorted Array 里，保留条件为什么和 `nums[slow - 1]` 比，而不是和 `nums[fast - 1]` 比？ Why compare with `nums[slow - 1]` rather than `nums[fast - 1]`?

> [!success]- 答案 Answer
> `nums[slow - 1]` 是结果里最后一个保留的值，题意就是“和已保留的最后一个不同才保留”。在有序数组里两种写法结果一样（重复值相邻），但和 `slow - 1` 比更能推广到 80. Remove Duplicates II（每个值最多保留两个：和 `nums[slow - 2]` 比）。
> `nums[slow - 1]` is the last kept value, which is exactly the rule: keep it only if it differs from the last kept one. On sorted input both work (duplicates are adjacent), but comparing against `slow - 1` generalizes to 80. Remove Duplicates II (keep at most two: compare with `nums[slow - 2]`).

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 类型 Type | 难度 Difficulty |
| --- | --- | --- |
| ✅ [[Remove Element\|27. 移除元素 Remove Element]] | 同向 / 相向填坑 both | Easy |
| 26. Remove Duplicates from Sorted Array | 同向 same direction | Easy |
| 283. Move Zeroes | 同向 same direction | Easy |
| 344. Reverse String | 相向 opposite | Easy |
| 125. Valid Palindrome | 相向 opposite | Easy |
| 167. Two Sum II (Input Array Is Sorted) | 相向 opposite | Medium |
| 11. Container With Most Water | 相向 opposite | Medium |
| 15. 3Sum | 排序 + 相向 sort + opposite | Medium |

## 9. 🔗 相关 Related

- [[📌 算法总览]]
- 数据结构 Data structures: [[数组 Array|数组 Array]] · [[链表 Linked List|链表 Linked List]]（快慢指针找中点、判环 fast/slow pointers for the middle and cycles）
- 同为一次遍历 Also single pass: [[一次遍历 One Pass|一次遍历 One Pass]]
- 复杂度 Complexity: [[复杂度分析 Big-O|复杂度分析 Big-O]]
