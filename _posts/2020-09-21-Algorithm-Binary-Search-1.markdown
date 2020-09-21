---
layout: post
title:  Binary Search
date:   2020-09-21 22:40
image:  algorithm.jpeg
tags:   Algorithm
---

Given a **sorted array** arr[] of n elements, write a function to search a given element x in arr[].

A simple approach is to do a liner search, the time complexity of above algorithm is O(N). Another approach to perform the same task if using binary search.

## What is Binary Search?

Search a sorted array by repeatdly dividing the search interval itself. Begin with an interval covering the whole array. If the value of the search key is less than the item in the middle of the interval, narrow the interval to lower half. Otherwise narrow it to the upper half. Repeatedly check until the value if found or the interval is empty.

The idea of binary search is to use the information that **the array is stored and reduce the time complexity to O(Logn)**.

![binarysearch](/images/algorithm/binary_search.png)

1. Compare x with the middle element.
2. If x matches the middle element, we return the middle index.
3. Else if x is greater than the middle element, then x can only lie in right half subarray after the middle element. So refur for right half.
4. Else (x is smaller) recur for the left half.

## Recursive implementation of Binary Search

```java
private int recusiveBinarySearch(int[] array, int left, int right, int target)
{
    // Check special case
    if(array == null || array.length == 0)
        return -1;

    if(left <= right)
    {
        int mid = left + (right - left) / 2;
        if(array[mid] == target)
            return mid;
        else if(array[mid] < target)
            return recusiveBinarySearch(array, left + 1, right, target);
        else
            return recusiveBinarySearch(array, left, right - 1, target);
    }

    return -1;
}
```


<!-- Line breaks -->
<br />

### Iterative Implementation of Binary Search

```java
private int iterativeBinarySearch(int[] array, int target)
{
    // Check special case
    if(array == null || array.length == 0)
        return -1;

    int left = 0;
    int right = array.length - 1;

    while(left <= right)
    {
        int mid = left + (right - left) / 2;
        if(array[mid] == target)
            return mid;
        else if(array[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }

    return -1;
}
```

<!-- Line breaks -->
<br />

Reference

<https://www.geeksforgeeks.org/binary-search>