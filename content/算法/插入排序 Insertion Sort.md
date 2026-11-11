---
title: "插入排序 Insertion Sort"
aliases:
  - 插入排序
tags:
  - DSA
  - Algorithms
  - Sorting
  - Interview-Prep
created: 2026-11-11
publish: true
---

# 🃏 插入排序 Insertion Sort

> [!abstract] TL;DR
> 像整理手里的扑克牌：左边一段始终是**有序的**，每次从右边拿一个新元素，**往左挪到它该在的位置**。最坏 O(n²)，但**几乎有序时接近 O(n)**，原地、稳定。
> Like sorting a hand of playing cards: the left part is always **sorted**; take the next element from the right and **slide it left into its place**. Worst case O(n²), but **close to O(n) on nearly sorted input**, in place and stable.

## 1. 🎯 核心概念 Overview

- 数组分两段：`[0, i)` 已排好序，`[i, n)` 还没处理。
  The array has two zones: `[0, i)` is sorted, `[i, n)` is unprocessed.
- 每一轮取出 `a[i]`，和左边的比，比它大的就往右让位，直到找到位置。
  Each round takes `a[i]` and compares it leftward; bigger elements make room until it finds its slot.
- 一共做 n - 1 轮，第 0 个元素自己就是有序的。
  There are n - 1 rounds; the first element is already sorted by itself.

![Insertion sort flowchart](/assets/insertion-sort-flow-light.svg)
![Insertion sort flowchart](/assets/insertion-sort-flow-dark.svg)

## 2. 🧠 什么时候用 When to Use

- 🔎 适合的场景 Good fits:
  - 数据量**很小**（几十个以内） Very **small** inputs (a few dozen elements)
  - 数据**几乎有序**，只有少数元素位置不对 **Nearly sorted** data with only a few elements out of place
  - 需要**稳定**、原地、代码最简单的排序 You need a **stable**, in-place sort with minimal code
  - 数据一个一个到达，边来边插（在线） Items arrive one at a time and are inserted as they come (online)
- 🚫 不适合 Poor fits: 大数组、逆序居多的数组，改用 O(n log n) 的归并或快速排序 For large or mostly reversed arrays, switch to merge sort or quicksort at O(n log n)
- 💡 实际应用 In practice: 在 Java 里，`Arrays.sort` 对很小的子区间会直接用插入排序（实现细节，版本间可能变化） In Java, `Arrays.sort` uses insertion sort for very small subranges (an implementation detail that can change between versions)

## 3. ⚙️ 原理 How It Works

示例：`[5, 2, 4, 1]`，`|` 左边是有序段。
Example: `[5, 2, 4, 1]`; the left of `|` is the sorted part.

| 轮 Round | 取出 Pick | 过程 What happens | 结果 Array after |
| --- | --- | --- | --- |
| 开始 Start | - | `5` 自己有序 `5` alone is sorted | `[5 \| 2, 4, 1]` |
| `i = 1` | `2` | 比 `5` 小，交换一次 smaller than `5`, one swap | `[2, 5 \| 4, 1]` |
| `i = 2` | `4` | 比 `5` 小交换，比 `2` 大停下 swap past `5`, stop at `2` | `[2, 4, 5 \| 1]` |
| `i = 3` | `1` | 一路交换到最左 swap all the way to the front | `[1, 2, 4, 5 \|]` |

## 4. 💻 模板代码 Code Template

**交换版 Swap-based**（最好记 easiest to remember）

```java
static void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int j = i;
        while (j > 0 && a[j] < a[j - 1]) {   // 严格小于，保证稳定 strict < keeps it stable
            int tmp = a[j];
            a[j] = a[j - 1];
            a[j - 1] = tmp;
            j--;
        }
    }
}
```

**挪动版 Shift-based**（赋值更少 fewer writes）

```java
static void insertionSortShift(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i];                      // 先把新牌拿在手里 hold the new card
        int j = i - 1;
        while (j >= 0 && a[j] > key) {       // 严格大于 strict > keeps it stable
            a[j + 1] = a[j];                 // 大的往右挪一格 shift right
            j--;
        }
        a[j + 1] = key;                      // 放进空位 drop into the gap
    }
}
```

> [!note] 两种写法 Two versions
> 交换版每一步写 2 次（3 次赋值），挪动版每一步只写 1 次，最后放一次 `key`。结果相同，挪动版稍快。
> The swap version does a 3-assignment swap per step; the shift version does one write per step plus one final write of `key`. Same result, the shift version is a bit faster.

> [!tip] 要记录每一轮的状态？ Need the state after each round?
> 在外层循环的末尾复制一份数组（或键值对列表）即可，见 [[Insertion Sort|插入排序题 Insertion Sort (NeetCode)]]。
> Snapshot the array (or the list of pairs) at the end of each outer iteration; see [[Insertion Sort|插入排序题 Insertion Sort (NeetCode)]].

## 5. ⏱️ 复杂度 Complexity

| 情况 Case | ⏱️ Time | 为什么 Why |
| --- | --- | --- |
| 最好 Best（已有序 already sorted） | O(n) | 每轮只比较一次 one comparison per round |
| 平均 Average | O(n²) | 平均挪动约一半 about half the sorted part moves |
| 最坏 Worst（逆序 reversed） | O(n²) | 第 `i` 轮挪 `i` 次，总共约 n²/2 round `i` moves `i` times, about n²/2 in total |

- 🗄️ 空间 Space: O(1)，原地 in place
- ✅ **稳定 Stable:** 相等元素的相对顺序不变 equal elements keep their relative order
- ✅ **自适应 Adaptive:** 越接近有序越快 the closer to sorted, the faster
- 🔗 运行时间 ≈ n + 逆序对数 running time is about n plus the number of inversions (pairs out of order)

## 6. ⚠️ 常见坑 Common Pitfalls

- **用了 `<=` 会破坏稳定 `<=` breaks stability:** 条件写成 `a[j] <= a[j - 1]`（或 `a[j] >= key` 反方向）时，相等元素也会被换过去，顺序就变了。键值对排序（按 key，保持 value 的原顺序）一定要用**严格**比较。
  With `a[j] <= a[j - 1]` (or `a[j] >= key` in the shift version), equal elements get swapped past each other and their order flips. When sorting pairs by key, always compare **strictly**.
- **下标越界 Index out of bounds:** 先判断 `j > 0`（挪动版 `j >= 0`），再读 `a[j - 1]`，顺序不能反（短路求值）。
  Check `j > 0` (or `j >= 0` in the shift version) before reading `a[j - 1]`; the order matters because of short-circuit evaluation.
- **挪动版忘了放回 `key` Forgetting to place `key`:** 循环结束后必须 `a[j + 1] = key`，否则 `key` 丢失。
  After the loop you must do `a[j + 1] = key`, or the key is lost.
- **外层从 1 开始 The outer loop starts at 1:** 从 0 开始也不会错，只是多一轮没用的。
  Starting at 0 isn't wrong, it just wastes a round.
- **别和选择排序搞混 Don't confuse it with selection sort:** 选择排序每轮找最小值放前面，不稳定也不自适应；插入排序是把新元素插进有序段。
  Selection sort picks the minimum each round, and is neither stable nor adaptive; insertion sort inserts the new element into the sorted part.

## 7. ❓ 复习题 Review Questions

**Q1.** 插入排序什么时候最快、什么时候最慢？ When is insertion sort fastest and slowest?

> [!success]- 答案 Answer
> 已有序时最快，O(n)，因为每轮只比较一次。逆序时最慢，O(n²)，因为每个元素都要一路挪到最左。
> Fastest on sorted input, O(n), with one comparison per round. Slowest on reversed input, O(n²), since every element slides all the way to the front.

**Q2.** 为什么把 `<` 改成 `<=` 会让它不稳定？ Why does changing `<` to `<=` make it unstable?

> [!success]- 答案 Answer
> `<=` 让新元素遇到相等的元素时还会继续往左换，于是它跑到了原本在它前面的相等元素的前面，相对顺序被颠倒。
> With `<=` the new element keeps swapping past equal elements, so it ends up before an equal element that originally came first, and their order flips.

**Q3.** 为什么外层循环不变量是“`[0, i)` 有序”？ Why is "`[0, i)` is sorted" the loop invariant?

> [!success]- 答案 Answer
> 开始时 `[0, 1)` 只有一个元素，自然有序。每一轮把 `a[i]` 插到正确位置后，`[0, i + 1)` 仍然有序。循环结束时 `i = n`，整个数组有序。
> At the start `[0, 1)` has one element, so it's sorted. Each round inserts `a[i]` into its place, so `[0, i + 1)` stays sorted. When the loop ends, the whole array is sorted.

**Q4.** 数据“几乎有序”时为什么快？ Why is it fast on nearly sorted data?

> [!success]- 答案 Answer
> 总挪动次数等于逆序对数。几乎有序时逆序对很少，所以接近 O(n)。
> The total number of moves equals the number of inversions. Nearly sorted data has few inversions, so it runs close to O(n).

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices |
| --- | --- |
| ✅ [[Insertion Sort\|插入排序题 Insertion Sort (NeetCode)]] | 稳定排序，记录每轮状态 stable sort, snapshot after each insertion |
| 147. Insertion Sort List | 链表版插入排序 insertion sort on a linked list |
| 912. Sort an Array | 先练基础排序，再换归并或快排 warm up with basic sorts, then try merge sort or quicksort |

## 9. 🔗 相关 Related

- [[📌 算法总览]]
- 题目 Problem: [[Insertion Sort|插入排序题 Insertion Sort (NeetCode)]]
- 数据结构 Data structures: [[数组 Array|数组 Array]]（原地排序的对象 the in-place target）
- 复杂度 Complexity: [[复杂度分析 Big-O|复杂度分析 Big-O]]（最好、平均、最坏 best, average, worst）
- 读写下标的相近思路 Related index thinking: [[双指针 Two Pointers|双指针 Two Pointers]]
