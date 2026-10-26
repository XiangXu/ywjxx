---
title: "LeetCode 总览"
tags:
  - LeetCode
created: 2026-10-15
---

# 🧩 LeetCode 总览 LeetCode Overview

> 每道题一篇笔记，用 `模板/LeetCode 题解模板` 创建 ✍️
> One note per problem, created from the `模板/LeetCode 题解模板` template ✍️

## 🗺️ 按套路分类 By Pattern
- 📦 数组一次遍历 Array / One Pass:
  - 🟡 [[Max Consecutive Ones|485. 最大连续 1 的个数 Max Consecutive Ones]]: 计数器遇 0 清零，记录最长的连续段 Reset a counter on 0 and keep the longest run of 1s · Easy
  - 🟡 [[Replace Elements with Greatest Element on Right Side|1299. 将每个元素替换为右侧最大元素 Replace Elements with Greatest Element on Right Side]]: 从右往左遍历，维护后缀最大值 Walk right to left, keeping a running suffix max · Easy
  - 🟡 [[Concatenation of Array|1929. 数组串联 Concatenation of Array]]: 下标映射 `ans[i + n] = nums[i]`，环形数组技巧的入门 Index mapping with `ans[i + n] = nums[i]`, a first look at the circular-array trick · Easy
- 👉👈 双指针 Two Pointers:
  - 🟡 [[Remove Element|27. 移除元素 Remove Element]]: 快慢指针原地过滤，慢指针写、快指针读 Filter in place with fast/slow pointers: the slow one writes, the fast one reads · Easy
- 📚 栈 Stack:
  - 🟡 [[Baseball Game|682. 棒球比赛 Baseball Game]]: 栈模拟：数字压栈，`C` 弹栈，`D` 和 `+` 读栈顶的一两个数 Simulate with a stack: push numbers, pop on `C`, read the top one or two on `D` and `+` · Easy
  - 🟡 [[Valid Parentheses|20. 有效的括号 Valid Parentheses]]: 左括号压入对应的右括号，右括号弹栈比较，最后栈必须为空 Push the matching closer for each opener, pop and compare on each closer, and end with an empty stack · Easy
  - 🟡 [[Min Stack|155. 最小栈 Min Stack]]: 辅助栈和主栈同步压入弹出，每层存到这层为止的最小值 An auxiliary stack pushed and popped in lockstep, each level storing the minimum so far · Medium
- 🔗 链表 Linked List:
  - 🟡 [[Reverse Linked List|206. 反转链表 Reverse Linked List]]: 迭代先存 `next` 再调头；递归先反转后面，再把自己接到尾巴，原样返回 `newHead` Iteratively, save `next` before flipping; recursively, reverse the rest, attach yourself at its tail, and return `newHead` unchanged · Easy
- 🪟 滑动窗口 Sliding Window:
- 🔍 二分查找 Binary Search:
- 🌳 树 Trees / DFS / BFS:
- 🕸️ 图 Graphs:
- 🧠 动态规划 Dynamic Programming:
- 🔙 回溯 Backtracking:
- ⛰️ 堆 Heap / Top-K:
- 🏗️ 设计 Design:
  - 🟡 [[Design Dynamic Array|设计动态数组 Design Dynamic Array]]: `int[]` 加 size、capacity 两个计数器，满了翻倍复制，均摊 O(1) 的 `pushback` An `int[]` with size and capacity counters that doubles when full, for amortized O(1) `pushback` · Easy

## 🚦 状态说明 Status Legend
- 🔴 todo: 还没做出来 Not solved yet
- 🟡 review: 做出来了但需要复习 Solved, needs review
- 🟢 mastered: 熟练掌握 Mastered
