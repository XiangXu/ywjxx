---
title: "一次遍历 One Pass"
aliases:
  - 一次遍历
  - One Pass
  - Single Pass
  - 数组遍历技巧
  - Array Traversal Patterns
  - 后缀最大值
  - Suffix Max
tags:
  - DSA
  - Algorithms
  - Array
  - Interview-Prep
created: 2026-10-20
publish: true
---

# 🔁 一次遍历 One Pass

> [!abstract] TL;DR
> 很多数组题的最优解就是**扫一遍，边走边维护一点状态**（计数器、最大值、写入位置……）。关键问题只有三个：**从哪边扫？维护什么状态？每一步先更新答案还是先更新状态？**
> Many array problems are solved optimally by **scanning once while maintaining a little state** (a counter, a running max, a write position…). Three questions decide the solution: **which direction to scan, what state to keep, and whether to update the answer or the state first at each step.**

## 1. 🎯 核心概念 Overview

暴力解常常是“对每个元素，再扫一遍别的元素”，即 O(n²)。一次遍历的思路是：**内层循环每次重新算的东西，能不能用一个变量记住？** 能的话，就降到 O(n)。
The brute force is often "for each element, scan the others again": O(n²). The one-pass idea: **can a variable remember what the inner loop keeps recomputing?** If so, it drops to O(n).

| 变体 Variant | 状态 State | 例题 Example |
| --- | --- | --- |
| 🧮 运行计数 / 最值 Running counter / best-so-far | `count`, `max` | [[Max Consecutive Ones\|485]] |
| 🗃️ 计数 / 频率数组 A count / frequency array | `count[]` | [[Number of Students Unable to Eat Lunch\|1700]] |
| ⬅️ 反向遍历 + 后缀信息 Reverse scan + suffix info | `rightMax` | [[Replace Elements with Greatest Element on Right Side\|1299]] |
| 🔢 下标映射 / 取模 Index mapping / modulo | 无，靠公式 none, just a formula | [[Concatenation of Array\|1929]] |
| ✍️ 写入位置 Write position | `slow` | [[Remove Element\|27]] → 见 see [[双指针 Two Pointers\|双指针 Two Pointers]] |
| 📚 用栈当状态 A stack as the state | `stack` | [[Valid Parentheses\|20]]、[[Baseball Game\|682]] → 见 see [[栈 Stack\|栈 Stack]] |

## 2. 🧠 什么时候用 When to Use

- 🔎 题目信号 Signals in the problem:
  - “最长连续……”、“出现次数” → 运行计数器
    "Longest consecutive…", "count of…" → a running counter
  - 只关心每种值有几个、不关心顺序 → 计数数组：先数一遍，再扫一遍，模拟可以换成计数（1700）
    Only how many of each value matters, not the order → a count array: count once, then scan once; a simulation can become counting (1700)
  - “右边所有元素中最大/最小” → **从右往左**扫，维护后缀最值；“左边”则反过来，维护前缀信息
    "The max/min of everything to the right" → scan **right to left**, keep a suffix max; for "the left", scan left to right with a prefix value
  - “环形”、“首尾相接” → `i % n`
    "Circular", "wraps around" → `i % n`
  - 状态需要“撤销上一步 / 和最近的配对” → 往往一个变量不够，可以用栈当状态
    The state needs "undo the last one" or "match the most recent one" → one variable is often not enough; a stack can serve as the state

## 3. ⚙️ 原理 How It Works

### 3.1 运行状态 Running state

一边走一边更新 `count`，遇到打断条件就重置；`count++` 之后立刻 `max = Math.max(max, count)`，最后一段就不会漏（只在段结束时比较的话，循环后要再补一次，[[Max Consecutive Ones|485]] 的坑）。
Update `count` as you go and reset it when the run breaks; do `max = Math.max(max, count)` right after `count++` so the last run can't be missed (if you only compare when a run ends, you need one more comparison after the loop, the 485 trap).

### 3.2 反向遍历：后缀信息 Reverse scan: suffix information

“右边所有元素的最大值”，从左往右扫要每次往右看一遍，O(n²)；**从右往左**扫，右边的信息已经“走过了”，一个变量就够。
"The max of everything to my right" costs O(n²) scanning left to right, because each element has to look ahead. Scanning **right to left**, the right side is already behind you, so one variable is enough.

```
arr:       17   18    5    4    6    1
                                     ← 扫描方向 scan direction
rightMax:  18    6    6    6    1   -1     （每个位置“右边”的最大值 max strictly to the right）
```

> [!warning] 顺序：先用，再更新 Order: use it, then update it
> 每一步的状态应该表示“**不含当前元素**的右边”。所以要先把旧状态写进答案，再把当前元素并入状态。顺序反了，当前元素就把自己算进去了。（[[Replace Elements with Greatest Element on Right Side|1299]] 的坑）
> At each step the state should mean "the right side **excluding** the current element", so write the old state into the answer first, then fold the current element in. Reverse the order and the element counts itself (the 1299 trap).

### 3.3 下标映射与取模 Index mapping and modulo

输出的每个位置都能用公式算出来源时，直接按公式填：`ans[j] = nums[j % n]`（[[Concatenation of Array|1929]]）。`i % n` 把 `n, n+1, …` 映射回 `0, 1, …`，也是环形数组的标准写法：遍历 `2n` 次就相当于绕了两圈，不用真的复制数组。
When every output slot's source follows a formula, just fill by formula: `ans[j] = nums[j % n]` (1929). `i % n` maps `n, n+1, …` back to `0, 1, …`, which is also how circular arrays are indexed: looping `2n` times walks two laps without copying anything.

## 4. 💻 模板代码 Code Template

每一步两件事：**用状态更新答案**和**把当前元素并入状态**；状态不含当前元素时先用再更新，含当前元素时先更新再用。
Each step does two things: **update the answer from the state** and **fold the current element into the state**; use first when the state excludes the current element, fold first when it includes it.

**后缀最值 Suffix max**（1299）:

```java
int rightMax = -1;
for (int i = arr.length - 1; i >= 0; i--) {
    int cur = arr[i];
    arr[i] = rightMax;                     // ① 先用 use first
    rightMax = Math.max(rightMax, cur);    // ② 再更新 then update
}
```

**运行计数 Running counter**（485）:

```java
int count = 0, max = 0;
for (int x : nums) {
    count = (x == 1) ? count + 1 : 0;      // ② 先并入 x：这一段包含当前元素 fold x in first: the run includes it
    max = Math.max(max, count);            // ① 再更新答案 then update the answer
}
```

## 5. ⏱️ 复杂度 Complexity

| 操作 Operation | ⏱️ Time | 🗄️ Space |
| --- | --- | --- |
| 一次遍历 + 常数个状态 One pass, constant state | O(n) | O(1) |
| 需要前缀/后缀**数组** Full prefix/suffix **arrays** | O(n) | O(n) |

> [!note] O(n) 是下界 O(n) is the lower bound
> 这类题必须看过每个元素才能给出答案（漏看一个，它可能就是最大值或打断连续的那个 0），所以 O(n) 已经最优。
> These problems must look at every element (any skipped one might be the max or the 0 that breaks a run), so O(n) is optimal.

## 6. ⚠️ 常见坑 Common Pitfalls

- **最后一段没处理 Forgetting the last segment:** 只在“段结束”时结算，数组末尾那段就漏了 → settle only on breaks and the trailing run is missed.
- **更新顺序反了 Wrong update order:** 状态把当前元素算进去了（1299） → the state includes the current element.
- **原地覆盖前没保存 Overwriting before saving:** 先 `int cur = arr[i]` 再写 `arr[i]` → save `arr[i]` before overwriting it.
- **初始值 Initial value:** 最大值初始化为 `0` 还是 `Integer.MIN_VALUE` 还是题目给的 `-1`？如果数组可能全是负数，`0` 就错了 → if all values can be negative, starting `max` at `0` is wrong.

## 7. ❓ 复习题 Review Questions

**Q1.** 怎么判断该从左往右还是从右往左扫？ How do you choose the scan direction?

> [!success]- 答案 Answer
> 看每个位置需要哪一边的信息。需要“左边所有元素”的信息就从左扫；需要“右边所有元素”就从右扫，这样需要的信息都已经走过、可以用变量记住。
> Ask which side each position needs. Info about everything to the left → scan left to right; everything to the right → scan right to left, so the needed info is already behind you and fits in a variable.

**Q2.** 为什么 1299 里要先 `arr[i] = rightMax` 再更新 `rightMax`，而 485 里是先更新 `count` 再更新 `max`？ Why does 1299 use the state before updating it, while 485 updates the state first?

> [!success]- 答案 Answer
> 看状态是否应包含当前元素。1299 要的是“**严格**在右边”的最大值，不能含自己，所以先用后更新。485 的当前这段连续 1 **包含**当前元素，所以先 `count++` 再和 `max` 比。
> It depends on whether the state should include the current element. 1299 wants the max **strictly** to the right, excluding itself: use, then update. 485's current run **includes** the current element: `count++` first, then compare with `max`.

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 变体 Variant | 难度 Difficulty |
| --- | --- | --- |
| ✅ [[Max Consecutive Ones\|485. 最大连续 1 的个数 Max Consecutive Ones]] | 运行计数 running counter | Easy |
| ✅ [[Replace Elements with Greatest Element on Right Side\|1299. 将每个元素替换为右侧最大元素 Replace Elements with Greatest Element on Right Side]] | 反向 + 后缀最值 reverse + suffix max | Easy |
| ✅ [[Concatenation of Array\|1929. 数组串联 Concatenation of Array]] | 下标映射 index mapping | Easy |
| 121. Best Time to Buy and Sell Stock | 前缀最小值 prefix min | Easy |
| 1480. Running Sum of 1d Array | 前缀和 prefix sum | Easy |
| 238. Product of Array Except Self | 前缀积 + 后缀积 prefix + suffix product | Medium |
| 53. Maximum Subarray | 运行最优（Kadane） running best | Medium |
| 189. Rotate Array | 下标映射 `(i + k) % n` index mapping | Medium |
| ✅ [[Valid Parentheses\|20. 有效的括号 Valid Parentheses]] | 栈当状态，扫一遍配对 stack as state, match in one pass | Easy |
| ✅ [[Baseball Game\|682. 棒球比赛 Baseball Game]] | 栈当状态，扫一遍模拟 stack as state, simulate in one pass | Easy |
| ✅ [[Reverse Linked List\|206. 反转链表 Reverse Linked List]] | 链表上一次遍历，边走边调头 one pass over a list, flipping as it goes | Easy |
| ✅ [[Number of Students Unable to Eat Lunch\|1700. 无法吃午餐的学生数量 Number of Students Unable to Eat Lunch]] | 计数数组代替队列模拟 a count array instead of a queue simulation | Easy |
| 503. Next Greater Element II | `i % n` 绕两圈（+ 单调栈） two laps with `i % n` (+ monotonic stack) | Medium |

## 9. 🔗 相关 Related

- [[📌 算法总览]]
- 数据结构 Data structures: [[数组 Array|数组 Array]] · [[栈 Stack|栈 Stack]]（状态比一个变量复杂时 when the state is more than a variable） · [[链表 Linked List|链表 Linked List]] · [[队列 Queue|队列 Queue]]
- 递归写法 The recursive alternative: [[递归 Recursion|递归 Recursion]]
- 写入位置那一类 The write-position variant: [[双指针 Two Pointers|双指针 Two Pointers]]
- 复杂度 Complexity: [[复杂度分析 Big-O|复杂度分析 Big-O]]
