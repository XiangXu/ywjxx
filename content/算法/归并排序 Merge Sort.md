---
title: "归并排序 Merge Sort"
aliases:
  - 归并排序
  - Merge Sort
  - 分治 Divide and Conquer
tags:
  - DSA
  - Algorithms
  - Sorting
  - Divide-and-Conquer
  - Interview-Prep
created: 2026-11-26
publish: true
---

# 🔀 归并排序 Merge Sort

> [!abstract] TL;DR
> **分治**：从中间切成两半，递归排好每一半，再像拉拉链一样**合并**两个有序段。最坏也是 O(n log n)，**稳定**，但数组版要 O(n) 额外空间。
> **Divide and conquer:** split in the middle, recursively sort each half, then **merge** the two sorted halves like a zipper. O(n log n) even in the worst case and **stable**, but the array version needs O(n) extra space.

## 1. 🎯 核心概念 Overview

- **拆 Divide:** 把 `[lo, hi]` 从 `mid` 切开，直到只剩一个元素（一个元素天然有序）。
  Split `[lo, hi]` at `mid` until one element is left (a single element is already sorted).
- **治 Conquer:** 递归排序左半 `[lo, mid]` 和右半 `[mid + 1, hi]`。
  Recursively sort the left half `[lo, mid]` and the right half `[mid + 1, hi]`.
- **合 Combine:** 两个指针各指一半的开头，每次取较小的放进临时数组，再拷回去。所有真正的工作都在合并里。
  One pointer at the start of each half; take the smaller each time into a buffer, then copy back. All the real work happens in the merge.

```text
[5 2 4 7 1 3 2 6]
[5 2 4 7]      [1 3 2 6]       拆 split
[5 2] [4 7]    [1 3] [2 6]
[5][2][4][7]   [1][3][2][6]
[2 5] [4 7]    [1 3] [2 6]     合 merge
[2 4 5 7]      [1 2 3 6]
[1 2 2 3 4 5 6 7]
```

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - 需要**稳定**排序，或要保证**最坏** O(n log n) You need a **stable** sort or a guaranteed **worst-case** O(n log n)
  - 给**链表**排序（148），不需要随机访问，合并只改指针 Sorting a **linked list** (148): no random access needed, and merging only relinks nodes
  - **数逆序对**或“右边有多少个比我小”（315、493），在合并时顺便统计 **Counting inversions** or "how many smaller to my right" (315, 493): count them during the merge
  - 合并多个有序序列（23、外部排序） Merging several sorted sequences (23, external sorting)
- 🚫 不适合 Poor fits: 内存很紧、只要平均快时，原地的快速排序常数更小、缓存更友好 When memory is tight and average speed is enough, in-place quicksort has smaller constants and better cache behavior
- 💡 实际应用 In practice:
  - Java 的 `Arrays.sort(Object[])` 和 `Collections.sort` 用 TimSort（归并 + 插入排序，稳定、自适应）。
    Java's `Arrays.sort(Object[])` and `Collections.sort` use TimSort (merge plus insertion sort, stable and adaptive).
  - 基本类型的 `Arrays.sort(int[])` 用双轴快排，因为基本类型不需要稳定（实现细节，版本间可能变化）。
    `Arrays.sort(int[])` on primitives uses dual-pivot quicksort, since primitives don't need stability (an implementation detail that can change between versions).
  - 数据大到放不进内存时，先分块排序写回磁盘，再多路归并（外部排序）。
    When data doesn't fit in memory, sort chunks, write them to disk, then do a k-way merge (external sorting).

## 3. ⚙️ 原理 How It Works

递推式是 T(n) = 2T(n/2) + O(n)。一共 log₂ n 层，每一层所有子数组的合并加起来正好处理 n 个元素，所以总共 O(n log n)。拆分方式和数据无关，所以基本版的最好、平均、最坏都一样。
The recurrence is T(n) = 2T(n/2) + O(n). There are log₂ n levels, and the merges on each level touch exactly n elements in total, so the whole sort is O(n log n). The split never depends on the data, so for the basic version best, average and worst case are the same.

> [!example] 最后一次合并 The final merge: `[2 4 5 7]` + `[1 2 3 6]`
>
> | 左 Left `i` | 右 Right `j` | 取 Take | 结果 Result |
> | --- | --- | --- | --- |
> | 2 | 1 | 1（右 right） | `[1]` |
> | 2 | 2 | 2（左，相等取左 left, tie → left） | `[1 2]` |
> | 4 | 2 | 2（右 right） | `[1 2 2]` |
> | 4 | 3 | 3（右 right） | `[1 2 2 3]` |
> | 4 | 6 | 4（左 left） | `[1 2 2 3 4]` |
> | 5 | 6 | 5（左 left） | `[1 2 2 3 4 5]` |
> | 7 | 6 | 6（右 right） | `[1 2 2 3 4 5 6]` |
> | 7 | 空 done | 左边剩下的 rest of left | `[1 2 2 3 4 5 6 7]` |

## 4. 💻 模板代码 Code Template

**自顶向下 Top-down**（面试最常写 the usual interview version）

```java
static void mergeSort(int[] a) {
    if (a.length < 2) return;
    int[] tmp = new int[a.length];            // 只分配一次 allocate once, reuse everywhere
    sort(a, tmp, 0, a.length - 1);
}

static void sort(int[] a, int[] tmp, int lo, int hi) {   // 闭区间 inclusive [lo, hi]
    if (lo >= hi) return;                      // 0 或 1 个元素 0 or 1 element
    int mid = lo + (hi - lo) / 2;              // 防溢出 avoids int overflow
    sort(a, tmp, lo, mid);
    sort(a, tmp, mid + 1, hi);
    if (a[mid] <= a[mid + 1]) return;          // 已经有序，跳过合并 already in order, skip the merge
    merge(a, tmp, lo, mid, hi);
}

static void merge(int[] a, int[] tmp, int lo, int mid, int hi) {
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];   // <= 相等取左，保证稳定 tie → left keeps it stable
        else              tmp[k++] = a[j++];
    }
    while (i <= mid) tmp[k++] = a[i++];        // 左边剩下的 rest of the left half
    while (j <= hi)  tmp[k++] = a[j++];        // 右边剩下的 rest of the right half
    System.arraycopy(tmp, lo, a, lo, hi - lo + 1);   // 拷回原数组 copy back
}
```

**自底向上 Bottom-up**（不用递归 no recursion）

先把长度为一的段两两合并，再合并长度二、四……的段。
Merge runs of width 1 pairwise, then width 2, 4, and so on.

```java
static void mergeSortBottomUp(int[] a) {
    int n = a.length;
    int[] tmp = new int[n];
    for (int width = 1; width < n; width *= 2) {
        for (int lo = 0; lo < n - width; lo += 2 * width) {
            int mid = lo + width - 1;
            int hi = Math.min(lo + 2 * width - 1, n - 1);   // 最后一段可能不满 the last run may be short
            merge(a, tmp, lo, mid, hi);
        }
    }
}
```

## 5. ⏱️ 复杂度 Complexity

| 情况 Case | ⏱️ Time | 为什么 Why |
| --- | --- | --- |
| 最好 Best | O(n log n) | 照样拆到底；加了跳过，已有序的输入降到 O(n) It still splits all the way down; with the skip, sorted input drops to O(n) |
| 平均 Average | O(n log n) | 每层 O(n)，共 log n 层 log n levels, O(n) each |
| 最坏 Worst | O(n log n) | 拆分和数据无关 the split ignores the data |

- 🗄️ **数组空间 Array space:** 临时数组 O(n)，自顶向下另有递归栈 O(log n) Buffer O(n), plus a recursion stack O(log n) for top-down
- 🗄️ **链表空间 List space:** 自顶向下 O(log n) 递归栈，自底向上 O(1) Top-down O(log n) stack, bottom-up O(1)
- ✅ **稳定 Stable:** 相等时取左边的元素 take the left element on ties
- ❌ **不是原地 Not in place:** 数组版需要 O(n) 额外空间 the array version needs O(n) extra
- **标准版不自适应 Not adaptive in its basic form:** 已有序也要 O(n log n)；加上 `a[mid] <= a[mid + 1]` 的跳过后，已有序的输入降到 O(n)。
  Sorted input still costs O(n log n); with the `a[mid] <= a[mid + 1]` skip, already sorted input drops to O(n).

| 对比 Compare | 归并 Merge sort | 快排 Quicksort | 插入 Insertion sort |
| --- | --- | --- | --- |
| 最坏 Worst | O(n log n) | O(n²) | O(n²) |
| 平均 Average | O(n log n) | O(n log n) | O(n²) |
| 额外空间 Extra space | O(n) | 平均 O(log n) Average O(log n) | O(1) |
| 稳定 Stable | ✅ | ❌ | ✅ |
| 擅长 Good at | 链表、稳定、外部排序 Lists, stability, external sorting | 数组上平均通常最快 usually fastest on average for arrays | 小数组、几乎有序 small or nearly sorted input |

## 6. ⚠️ 常见坑 Common Pitfalls

- **用 `<` 会破坏稳定 `<` breaks stability:** 合并时写 `a[i] < a[j]`，相等元素会先取右边的，原来的先后就反了。要稳定就写 `<=`。
  With `a[i] < a[j]` in the merge, ties take the right element first and equal elements swap order. Use `<=` for stability.
- **忘了拷贝剩余元素 Forgetting the leftovers:** 主循环结束后一边一定还有剩余，两个 `while` 都要写（只会执行一个）。
  When the main loop ends one side still has elements; write both `while` loops (only one will run).
- **区间边界不一致 Mixed-up bounds:** 闭区间就是 `[lo, mid]` 和 `[mid + 1, hi]`，出口 `lo >= hi`；半开区间 `[lo, hi)` 就是 `[lo, mid)` 和 `[mid, hi)`，出口 `hi - lo <= 1`。混用会死递归或漏元素。
  Inclusive bounds pair with `[lo, mid]` / `[mid + 1, hi]` and stop at `lo >= hi`; half-open `[lo, hi)` pairs with `[lo, mid)` / `[mid, hi)` and stops at `hi - lo <= 1`. Mixing them causes infinite recursion or lost elements.
- **中点溢出 Midpoint overflow:** `(lo + hi) / 2` 在很大的下标上会溢出，写 `lo + (hi - lo) / 2`。
  `(lo + hi) / 2` can overflow for huge indexes; write `lo + (hi - lo) / 2`.
- **每层都 new 数组 Allocating per call:** 每次递归都 `new int[]` 还是 O(n log n)，但分配和 GC 开销大；在外面分配一次传进去。
  Calling `new int[]` in every call is still O(n log n) but wastes allocations and GC time; allocate one buffer up front and pass it down.
- **链表找中点 Splitting a linked list:** 循环条件写 `fast != null && fast.next != null` 时，要让 `fast` 从 `head.next` 出发，两个节点才能切成一加一，否则会无限递归；切完记得 `slow.next = null`。
  With the loop condition `fast != null && fast.next != null`, start `fast` at `head.next` so a two-node list splits into 1 + 1 instead of recursing forever, and cut with `slow.next = null`.

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么基本版归并排序在任何输入上都是 O(n log n)？ Why is basic merge sort O(n log n) on every input?

> [!success]- 答案 Answer
> 它总是从中间切，和数据无关，所以递归树总是 log n 层；每层的合并加起来处理 n 个元素，O(n)。加了 `a[mid] <= a[mid + 1]` 的跳过后，已有序的输入只要 O(n)。
> It always splits in the middle regardless of the data, so the recursion tree always has log n levels, and each level's merges handle n elements in O(n). With the `a[mid] <= a[mid + 1]` skip, sorted input takes only O(n).

**Q2.** 归并排序和快排怎么选？ Merge sort or quicksort?

> [!success]- 答案 Answer
> 要稳定、要保证最坏 O(n log n)、给链表排序或外部排序时选归并。数组上只求平均最快、内存紧时选快排：原地、缓存友好，但最坏 O(n²) 且不稳定。
> Choose merge sort for stability, a guaranteed O(n log n) worst case, linked lists, or external sorting. Choose quicksort for the fastest average case on arrays with little memory: it's in place and cache-friendly, but worst case O(n²) and not stable.

**Q3.** 为什么 Java 对 `Object[]` 用 TimSort，对 `int[]` 用快排？ Why does Java use TimSort for `Object[]` but quicksort for `int[]`?

> [!success]- 答案 Answer
> 对象可能按某个字段排序，相等的对象仍然可以区分，所以需要稳定；TimSort 是稳定的归并变体，对部分有序的数据很快。基本类型的相等值无法区分，稳定没有意义，就用更快、更省内存的双轴快排。
> Objects are often sorted by one field, and equal objects are still distinguishable, so stability matters; TimSort is a stable merge variant that is fast on partly sorted data. Equal primitives are indistinguishable, so stability is pointless and the faster, leaner dual-pivot quicksort wins.

**Q4.** 怎样用归并排序数逆序对？ How do you count inversions with merge sort?

> [!success]- 答案 Answer
> 合并时，如果取的是右边的 `a[j]`，说明左边剩下的 `mid - i + 1` 个元素都比它大，各和它组成一个逆序对，累加即可。总时间仍是 O(n log n)。
> During the merge, when you take `a[j]` from the right, the `mid - i + 1` elements left in the left half are all bigger and each forms an inversion with it, so add that count. The total stays O(n log n).

**Q5.** 链表的归并排序为什么不需要 O(n) 额外空间？ Why doesn't merge sort on a linked list need O(n) extra space?

> [!success]- 答案 Answer
> 合并链表只是改 `next` 指针，不需要临时数组。自顶向下剩下 O(log n) 的递归栈，自底向上可以做到 O(1)。
> Merging lists just relinks `next` pointers, with no buffer. Top-down leaves an O(log n) recursion stack, and bottom-up gets it to O(1).

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices |
| --- | --- |
| ✅ [[Merge Two Sorted Lists\|21. 合并两个有序链表 Merge Two Sorted Lists]] | 合并这一步 the merge step |
| 88. Merge Sorted Array | 数组合并，从后往前填 array merge, fill from the back |
| 912. Sort an Array | 手写完整的归并排序 write the full merge sort |
| 148. Sort List | 链表归并：快慢指针拆、21 合并 list merge sort: split with fast/slow pointers, merge with 21 |
| 23. Merge k Sorted Lists | 分治两两归并或小顶堆，O(N log k) Divide-and-conquer pairwise merging or a min-heap, O(N log k) |
| 315. Count of Smaller Numbers After Self | 合并时统计右边更小的 count smaller-to-the-right during the merge |
| 493. Reverse Pairs | 合并前用双指针数对 count pairs with two pointers before merging |

## 9. 🔗 相关 Related

- [[📌 算法总览]]
- 分治靠递归 Divide and conquer via: [[递归 Recursion|递归 Recursion]]（相信子调用排好了一半 trust each call to sort its half）
- 合并步骤 The merge step: [[双指针 Two Pointers|双指针 Two Pointers]]（两个输入各一个指针 one pointer per input） · [[Merge Two Sorted Lists|21. 合并两个有序链表 Merge Two Sorted Lists]]
- 对比 Compare with: [[插入排序 Insertion Sort|插入排序 Insertion Sort]]（平方级，小数组时反而更快 quadratic, yet faster on tiny arrays） · [[动态规划 Dynamic Programming|动态规划 Dynamic Programming]]（DP 的子问题会重叠，归并的不会 DP's subproblems overlap; merge sort's don't）
- 数据结构 Data structures: [[数组 Array|数组 Array]] · [[链表 Linked List|链表 Linked List]]
- 复杂度 Complexity: [[复杂度分析 Big-O|复杂度分析 Big-O]]（典型的 O(n log n) 例子 the classic O(n log n) example）
