---
title: "27. Remove Element"
aliases:
  - 移除元素
  - LeetCode 27
tags:
  - LeetCode
  - Interview-Prep
  - Array
  - Two-Pointers
difficulty: Easy
pattern: "Two Pointers (Fast / Slow)"
link: https://leetcode.com/problems/remove-element/
status: 🟡 review
created: 2026-10-19
publish: true
last-reviewed: 2026-10-19
---

# 🧩 27. Remove Element

> [!abstract] TL;DR
> 快慢双指针：`right` 扫描每个元素，`left` 指向下一个要写入的位置；遇到不等于 `val` 的元素就写到 `left` 并右移。最后 `left` 就是保留下来的元素个数。
> Fast/slow pointers: `right` reads every element, `left` marks the next write slot; copy each element that isn't `val` to `left`. At the end, `left` is the count of kept elements. ⏱️ O(n) · 🗄️ O(1)

## 1. 📋 题目 Problem

给定数组 `nums` 和值 `val`，**原地**移除所有等于 `val` 的元素，返回剩下的元素个数 `k`。
`nums` 的前 `k` 个位置必须是保留下来的元素，顺序可以改变，`k` 之后的内容不重要。
Remove every occurrence of `val` from `nums` **in place** and return `k`, the number of elements that remain. The first `k` slots must hold the kept elements (in any order); whatever is after them doesn't matter.

| Input | Output | `nums` 前 k 个 First k slots |
| --- | --- | --- |
| `nums = [3,2,2,3]`, `val = 3` | `2` | `[2,2]` |
| `nums = [0,1,2,2,3,0,4,2]`, `val = 2` | `5` | `[0,1,3,0,4]` (顺序不限 any order) |

约束 Constraints: 0 ≤ `nums.length` ≤ 100, 0 ≤ `nums[i]` ≤ 50, 0 ≤ `val` ≤ 100.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 不需要真的“删除”。只要把要保留的元素按顺序挪到数组前面，前 `k` 个位置就是答案。
  Nothing actually gets deleted. Move the elements you keep to the front, and the first `k` slots are the answer.
- **套路 Pattern:** 同向双指针 / 快慢指针 Same-direction two pointers (fast/slow).
  - `right` (快 fast): 读指针，每一步都前进 → the reader, moves every step
  - `left` (慢 slow): 写指针，只有写入时才前进 → the writer, moves only after a write
- **不变量 Invariant:** `nums[0..left-1]` 永远是目前为止保留下来的元素，而且 `left <= right`，所以写入不会覆盖还没读过的元素。
  `nums[0..left-1]` always holds the elements kept so far, and `left <= right`, so a write never clobbers an element that hasn't been read yet.

> [!tip] Java 类比 Java analogy
> 就像 `list.removeIf(x -> x == val)`。`ArrayList.removeIf` 内部也是这样压缩数组的：把保留的元素往前挪，再把尾部清空（置为 `null`）并更新 `size`。
> It's `list.removeIf(x -> x == val)` done by hand. `ArrayList.removeIf` compacts its backing array the same way: shift the survivors forward, then null out the tail and update `size`.

## 3. 🐢 暴力解 Brute Force

- **思路 Idea:** 每找到一个 `val`，就把它后面的所有元素左移一位（就像 `ArrayList.remove(index)`），长度减一。
  Each time you find `val`, shift everything after it one slot left (like `ArrayList.remove(index)`) and shrink the length.
- ⏱️ Time: O(n²) · 🗄️ Space: O(1)
- 问题：每次删除都要移动后面所有元素。 Every removal shifts the whole tail.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class Solution {
    public int removeElement(int[] nums, int val) {
        int left = 0;  // 下一个写入位置 next write slot
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] != val) {
                nums[left] = nums[right];  // 保留：写到前面 keep it: copy to the front
                left++;
            }
            // 等于 val：直接跳过 equal to val: skip it
        }
        return left;  // 保留的个数 number of kept elements
    }
}
```

- ⏱️ Time: O(n): `right` 走一遍 `right` passes once
- 🗄️ Space: O(1): 原地修改 in place
- ✅ 保持原顺序 Keeps the original order (题目不要求，但这是个好性质 not required, but a nice property)

> [!example] 走一遍 Trace: `nums = [3,2,2,3]`, `val = 3`
>
> | right | nums[right] | 动作 Action | left | nums |
> | --- | --- | --- | --- | --- |
> | 0 | 3 | 跳过 skip | 0 | `[3,2,2,3]` |
> | 1 | 2 | `nums[0] = 2` | 1 | `[2,2,2,3]` |
> | 2 | 2 | `nums[1] = 2` | 2 | `[2,2,2,3]` |
> | 3 | 3 | 跳过 skip | 2 | `[2,2,2,3]` |
>
> 返回 Return `2`，前两个是 `[2,2]`。后面的 `[2,3]` 是残留，不重要。 The tail `[2,3]` is leftover and doesn't matter.

> [!note] 另一种写法 Alternative: 相向双指针 Opposite-direction pointers
> 当 `val` 很少时，上面的写法仍会把几乎每个元素都复制一遍。可以改成：遇到 `val` 就用**最后一个元素**填过来，并缩短数组。
> When `val` is rare, the version above still copies almost every element. Instead, overwrite each `val` with the **last** element and shrink the array.
> ```java
> int left = 0, right = nums.length;
> while (left < right) {
>     if (nums[left] == val) {
>         nums[left] = nums[right - 1];  // 用末尾元素填坑 fill the hole from the end
>         right--;                       // 不移动 left：填过来的元素还没检查 don't advance left: the new value is unchecked
>     } else {
>         left++;
>     }
> }
> return left;
> ```
> - 写入次数 = `val` 出现的次数 Writes = number of `val`s, not number of kept elements
> - ❌ 不保持原顺序 Doesn't keep the order (这题允许 allowed here)
> - 两种都是 O(n) 时间、O(1) 空间。 Both are O(n) time, O(1) space.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 空数组 Empty array (`[]`): 循环不执行，返回 0 → the loop never runs, returns 0
- [x] 全是 `val` All `val` (`[3,3]`, `val = 3`): 一次都不写，返回 0 → no writes, returns 0
- [x] 没有 `val` No `val` at all: 每个元素原地复制到自己 (`left == right`)，无害 → each element is copied onto itself, harmless
- [x] 单个元素 Single element (`[3]` / `[1]`, `val = 3`) → 0 / 1
- [x] 不要新建数组 Don't allocate a new array: 题目要求原地 O(1) 额外空间 → the problem requires in place with O(1) extra space
- [x] 返回的是个数 `k`，不是下标 Return the count `k`, not an index: `left` 正好等于个数 → `left` is exactly the count

## 6. 🔁 进阶 Follow-ups

同一个“快指针读、慢指针写”的模板可以解一整类原地过滤题：
The same "fast reads, slow writes" template solves a whole family of in-place filtering problems:

| 题目 Problem | 保留条件 Keep when… |
| --- | --- |
| 27. Remove Element (本题 this one) | `nums[right] != val` |
| 26. Remove Duplicates from Sorted Array | `left == 0 \|\| nums[right] != nums[left - 1]` (和上一个保留的不同；第一个总是保留 differs from the last kept; the first is always kept) |
| 80. Remove Duplicates from Sorted Array II | `left < 2 \|\| nums[right] != nums[left - 2]` (最多保留两个 keep at most two) |
| 283. Move Zeroes | `nums[right] != 0`，然后把尾部填 0（或直接交换） Keep `nums[right] != 0`, then zero-fill the tail (or swap) |

> [!important] 和 485 对比 Compare with 485
> [[Max Consecutive Ones|485. Max Consecutive Ones]] 只有一个下标，计数器记录当前连续段的长度，窗口左边界是隐含的；这题的 `left` 是**真正的第二个指针**，它指向数组里的一个位置并往里写数据。
> 485 has only one index; its counter tracks the current run's length, so the left edge is only implied. Here `left` is a **real second pointer**: it points into the array and is written through.

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么 `nums[left] = nums[right]` 不会覆盖还没读过的数据？ Why can't `nums[left] = nums[right]` overwrite data that hasn't been read yet?

> [!success]- 答案 Answer
> 因为 `left` 只有在写入后才加一，而 `right` 每一步都加一，所以始终 `left <= right`。被写入的位置 `left` 要么就是当前的 `right`，要么已经被读过了。
> `left` only advances after a write while `right` advances every step, so `left <= right` always holds. The slot being written is either the current `right` or one that has already been read.

**Q2.** 为什么返回 `left` 就是答案？ Why is `left` the answer?

> [!success]- 答案 Answer
> `left` 每保留一个元素加一次，所以循环结束时它等于保留的元素个数 `k`，同时 `nums[0..k-1]` 正好就是这些元素。
> `left` goes up once per kept element, so after the loop it equals `k`, and `nums[0..k-1]` holds exactly those elements.

**Q3.** 什么时候用相向双指针的写法更好？它的代价是什么？ When is the opposite-direction version better, and what does it cost?

> [!success]- 答案 Answer
> 当 `val` 很少出现时：它只在遇到 `val` 时写一次，而快慢指针版会把几乎每个保留的元素都复制一遍。代价是元素顺序会被打乱，这题允许，但像 Move Zeroes 这种要求保持顺序的题就不行。
> When `val` is rare: it writes only once per `val`, while the fast/slow version copies nearly every kept element. The cost is that order isn't preserved. That's fine here, but not for problems like Move Zeroes that require keeping the order.

**Q4.** 相向写法里，用末尾元素填坑后为什么不能马上 `left++`？ In the opposite-direction version, why not advance `left` right after filling the hole?

> [!success]- 答案 Answer
> 填过来的元素可能也等于 `val`，必须在下一轮再检查一次。例如 `[3,3]`、`val = 3`：如果填完就 `left++`，会错误地保留一个 3。
> The element moved in from the end might also equal `val`, so it has to be checked on the next iteration. With `[3,3]` and `val = 3`, advancing right away would wrongly keep a 3.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 套路 Pattern: [[双指针 Two Pointers|双指针 Two Pointers]] · [[数组 Array|数组 Array]]
- 上一题 Previous: [[Max Consecutive Ones|485. Max Consecutive Ones]]
- 同一模板 Same template: 26. Remove Duplicates from Sorted Array, 283. Move Zeroes
- 下一题 Next note: [[Replace Elements with Greatest Element on Right Side|1299. Replace Elements with Greatest Element on Right Side]]

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-19 |  | ✅ | 快慢双指针，一次写对 Fast/slow pointers, correct first try |
