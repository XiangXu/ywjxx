---
title: "插入排序题 Insertion Sort (NeetCode)"
aliases:
  - NeetCode Insertion Sort
tags:
  - LeetCode
  - Interview-Prep
  - Sorting
  - Easy
difficulty: Easy
pattern: "Sorting / Insertion Sort (Stable)"
link: https://neetcode.io/problems/insertion-sort
status: 🟡 review
created: 2026-11-11
publish: true
last-reviewed: 2026-11-11
---

# 🧩 插入排序题 Insertion Sort (NeetCode)

> [!abstract] TL;DR
> 左边一段始终有序：每次把第 `i` 个元素往左“冒”到正确位置，只在左邻居的 key **严格更大**时才交换，所以排序是稳定的。每轮结束后复制一份快照。
> Keep the left part sorted: bubble element `i` leftwards into place, swapping only while its left neighbor's key is **strictly greater**, which keeps the sort stable. Copy a snapshot after each round. ⏱️ O(n²) · 🗄️ O(1) extra (O(n²) for the snapshots)

## 1. 📋 题目 Problem

对一组 `(int key, String value)` 键值对按 `key` 做插入排序，必须稳定（key 相同的元素保持原来的相对顺序）。返回每次插入之后的数组状态，共 `pairs.length` 个。
Sort a list of `(int key, String value)` pairs by `key` with insertion sort, and it must be stable (equal keys keep their relative order). Return the array state after each insertion, `pairs.length` states in total.

| 输入 Input | 输出 Output |
| --- | --- |
| `[(5,apple),(2,banana),(9,cherry)]` | `[[(5,apple),(2,banana),(9,cherry)], [(2,banana),(5,apple),(9,cherry)], [(2,banana),(5,apple),(9,cherry)]]` |
| `[(3,cat),(3,bird),(2,dog)]` | `[[(3,cat),(3,bird),(2,dog)], [(3,cat),(3,bird),(2,dog)], [(2,dog),(3,cat),(3,bird)]]` |

约束 Constraints: 0 ≤ `pairs.length` ≤ 100.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 像整理手里的扑克牌：左边已经排好，每次拿起下一张，往左挪到合适的位置。
  Like sorting playing cards in your hand: the left part is already sorted, so pick up the next card and slide it left into place.
- **套路 Pattern:** 插入排序，外层 `i` 扩大有序区，内层 `j` 向左冒泡。
  Insertion sort: the outer `i` grows the sorted zone, and the inner `j` walks leftwards.

![Insertion sort on pairs flowchart](/assets/insertion-sort-pairs-flow-light.svg)
![Insertion sort on pairs flowchart](/assets/insertion-sort-pairs-flow-dark.svg)

## 3. 🐢 暴力解 Brute Force

题目要求的就是插入排序本身，没有更暴力的版本；`Collections.sort` 拿不到每一步的状态。
The task is insertion sort itself, so there is no cruder version; `Collections.sort` can't give the per-step states.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
// Pair {int key; String value} 由题目提供 Pair is provided by the problem
public class Solution {
    public List<List<Pair>> insertionSort(List<Pair> pairs) {
        List<List<Pair>> result = new ArrayList<>();
        for(int i = 0; i < pairs.size(); i++) {
            int j = i - 1;                                    // 有序区的最后一个 last of the sorted part
            while(j >= 0 && pairs.get(j).key > pairs.get(j+1).key) {  // 严格大于才换 swap only if strictly greater
                Pair temp = pairs.get(j);
                pairs.set(j, pairs.get(j+1));
                pairs.set(j+1, temp);
                j--;                                          // 继续往左 keep going left
            }
            result.add(new ArrayList<>(pairs));               // 复制快照 copy a snapshot
        }
        return result;
    }
}
```

- ⏱️ Time: O(n²): 最坏（逆序）每个元素都要走到最左边；已有序时 O(n) 就够了
  Worst case (reversed input) moves every element all the way left; already-sorted input takes only O(n)
- 🗄️ Space: 原地排序只用 O(1) 额外空间；`n` 份快照合计 O(n²) Sorting in place needs O(1) extra; the `n` snapshots add up to O(n²)

> [!example] 走一遍 Trace: `[(3,cat),(3,bird),(2,dog)]`
>
> | i | 比较 Compare | 动作 Action | 快照 Snapshot |
> | --- | --- | --- | --- |
> | 0 | 没有左邻居 no left neighbor | 无 none | `[(3,cat),(3,bird),(2,dog)]` |
> | 1 | `3 > 3` ✗ | 不换，保持稳定 no swap, stays stable | `[(3,cat),(3,bird),(2,dog)]` |
> | 2 | `3 > 2` ✓ → `3 > 2` ✓ | `bird` 和 `cat` 依次让位 bird then cat both move right | `[(2,dog),(3,cat),(3,bird)]` |

> [!note] 其他写法 Alternatives
> **移位 Shift:** 先把 `pairs.get(i)` 存到临时变量，把更大的元素逐个右移一格，最后放进空位，每步只写一次。
> Save `pairs.get(i)` in a temp, shift each larger element one slot right, then drop the temp into the gap: one write per step instead of a three-assignment swap.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 稳定性 Stability: 比较必须是严格的 `>`，不能写成 `>=`，否则相同 key 的元素会被换位 → the comparison must be strict `>`, never `>=`, or equal keys get swapped
- [x] 快照 Snapshot: `new ArrayList<>(pairs)` 复制出一份，否则 `result` 里每一项都指向同一个列表，最后全是排好序的结果 → `new ArrayList<>(pairs)` makes a copy; without it every entry in `result` aliases the same list and all show the final sorted state
- [x] 空输入 Empty input: 循环不执行，返回空列表 → the loop never runs and an empty list is returned
- [x] 先判断 `j >= 0` Check `j >= 0` first: 短路求值，避免 `pairs.get(-1)` 越界 → short-circuiting avoids `pairs.get(-1)` going out of bounds
- [x] 会修改输入 Mutates the input: 排序是原地的，`pairs` 本身也被改了 → the sort is in place, so `pairs` itself is changed

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| Merge Sort | 同样稳定，O(n log n)，用额外空间 Also stable, O(n log n), uses extra space |
| Quick Sort | 平均 O(n log n)，但不稳定 Average O(n log n), but not stable |
| 147. Insertion Sort List | 在链表上做插入排序 Insertion sort on a linked list |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么把 `>` 改成 `>=` 会破坏稳定性？ Why does changing `>` to `>=` break stability?

> [!success]- 答案 Answer
> 相同 key 的两个元素也会被交换，原来靠前的跑到了后面。比如 `(3,cat),(3,bird)` 会变成 `(3,bird),(3,cat)`。
> Equal-key elements would also be swapped, so the one that came first ends up behind. For example, `(3,cat),(3,bird)` would become `(3,bird),(3,cat)`.

**Q2.** 插入排序什么时候快，什么时候慢？ When is insertion sort fast, and when is it slow?

> [!success]- 答案 Answer
> 输入已经有序或接近有序时接近 O(n)，因为内层循环几乎不执行；输入逆序时是 O(n²)。
> It is close to O(n) when the input is already or nearly sorted, since the inner loop barely runs; it is O(n²) when the input is reversed.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[插入排序 Insertion Sort|插入排序 Insertion Sort]]（有序区加向左冒泡 a sorted zone plus leftward bubbling） · [[数组 Array|数组 Array]]（原地交换 in-place swaps） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（最好 O(n)、最坏 O(n²) Best O(n), worst O(n²)）
- 上一题 Previous: [[Climbing Stairs|70. 爬楼梯 Climbing Stairs]]

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-11-11 |  | ✅ | 严格 `>` 保证稳定，别忘了复制快照 Strict `>` keeps it stable; remember to copy the snapshot |
