---
layout: post
title:  Fast & Slow Pointers (Two Pointers) Notes
date:   2025-09-05 21:30
image:  algorithm.jpeg
tags:   [Fundation, Algorithm]
---

## Definition
Fast & slow pointers are a common algorithm technique, often used for in-place traversal and processing of arrays or linked lists.
* fast pointer: scans the data structure quickly, used to check elements or conditions
* slow pointer: moves slower, used to record result positions or modify the array/list

## When to Use 

1. In-place deletion or moving elements.
   * Remove duplicates (Remove Duplicates From Sorted Array)
   * Remove specific elements (Remove Element)
   * Move zeroes (Move Zeroes)
2. Linked list processing
   * Remove duplicates in a linked list
   * Find the middle of a linked list
3. Sliding window / subarray problems 
   * Fixed or variable-length windows
   * Find subarrays or intervals that satisfy a condition
4. Cycle detection
   * Linked list cycle detection (Floyd’s cycle detection algorithm)

## Core Idea

1. Initialize **slow pointer**: usually points to the last valid element or the next write position.
2. Traverse the arraylist: **fast pointer scans every element**
3. Condition check: if the current element meets the condition, write it to slow pointer and move slow
4. Return result: slow pointer's position or length is the final answer.

General formula:
```java
if (condition_met) {
    nums[slow] = nums[fast]; // or linked list operation
    slow++;
}
```

### Common Examples:

Example 1: Remove Duplicates
```java
int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < nums.length; fast++) {
        if (nums[fast] != nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }
    return slow + 1;
}
```

Example 2: Remove Specific Element
```java
int removeElement(int[] nums, int val) {
    int slow = 0;
    for (int fast = 0; fast < nums.length; fast++) {
        if (nums[fast] != val) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    return slow;
}
```

### Tips for fast & slow pointers
1.	Clearly define slow pointer: is it the last valid element or the next write position?
2.	Clear scanning order for fast pointer: usually linear from start to end
3.	Strict conditional checks: decide when to write and when to skip
4.	In-place modification: fast & slow pointers are often used to modify arrays/lists in-place, saving space

    