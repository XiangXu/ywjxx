---
title: "LeetCode 总览"
tags:
  - LeetCode
created: 2026-10-15
---

# 🧩 LeetCode 总览 Overview

> 每道题一篇笔记，用 `模板/LeetCode 题解模板` 创建 ✍️
> One note per problem, created from the `模板/LeetCode 题解模板` template.

## 🗺️ 按套路分类 By Pattern
- 📦 数组一次遍历 Array / One Pass:
  - 🟡 [[Max Consecutive Ones|485. Max Consecutive Ones]]: 计数器遇 0 清零，记录最长连续 1 · Easy
  - 🟡 [[Replace Elements with Greatest Element on Right Side|1299. Replace Elements with Greatest Element on Right Side]]: 从右往左遍历，维护后缀最大值 · Easy
  - 🟡 [[Concatenation of Array|1929. Concatenation of Array]]: 下标映射，`ans[i + n] = nums[i]`，环形数组技巧的入门 · Easy
- 👉👈 双指针 Two Pointers:
  - 🟡 [[Remove Element|27. Remove Element]]: 快慢指针原地过滤，慢指针写、快指针读 · Easy
- 📚 栈 Stack:
  - 🟡 [[Baseball Game|682. Baseball Game]]: 栈模拟，数字压栈，`C` 弹栈，`D`/`+` 读栈顶一两个数 · Easy
  - 🟡 [[Valid Parentheses|20. Valid Parentheses]]: 左括号压入对应的右括号，右括号弹栈比较，最后栈必须为空 · Easy
  - 🟡 [[Min Stack|155. Min Stack]]: 辅助栈和主栈同步 push / pop，每层存到这层为止的最小值 · Medium
- 🪟 滑动窗口 Sliding Window:
- 🔍 二分查找 Binary Search:
- 🌳 树 / DFS / BFS:
- 🕸️ 图 Graphs:
- 🧠 动态规划 Dynamic Programming:
- 🔙 回溯 Backtracking:
- ⛰️ 堆 Heap / Top-K:
- 🏗️ 设计 Design:
  - 🟡 [[Design Dynamic Array|Design Dynamic Array]]: `int[]` + size/capacity 两个计数器，满了翻倍复制，push 均摊 O(1) · Easy

## 🚦 状态说明 Status Legend
- 🔴 todo: 还没做出来 Not solved yet
- 🟡 review: 做出来了但需要复习 Solved, needs review
- 🟢 mastered: 熟练掌握 Mastered
