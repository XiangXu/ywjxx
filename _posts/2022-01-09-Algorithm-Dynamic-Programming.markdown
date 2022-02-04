---
layout: post
title:  Dynamic Programming
date:   2022-01-09 22:46
image:  algorithm.jpeg
tags:   [Fundation, Algorithm]
---

**Dynamic Programming is mainly an optimization over plain recursion**. Whenever we see a recursive solution that has repeated calls for same inputs, we can optimize it using Dynamic Programming. The idea is to simply store the results of subproblems, so that we do not have to re-compute them when needed later. This simple optimization reduces time complexities from exponential to polynomial. For example, if we write simple recursive solution for Fibonacci Numbers, we get exponential time complexity and if we optimize it by storing solutions of subproblems, time complexity reduces to linear.

## LeetCode Examples:

### 509. Fibonacci Number

The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is,

```
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.
```

<!-- Line breaks -->
<br />

Given n, calculate F(n).

```
Example 1:

Input: n = 2
Output: 1
Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.
Example 2:

Input: n = 3
Output: 2
Explanation: F(3) = F(2) + F(1) = 1 + 1 = 2.
Example 3:

Input: n = 4
Output: 3
Explanation: F(4) = F(3) + F(2) = 2 + 1 = 3.
```

<!-- Line breaks -->
<br />

#### Solution

#### Recursive:

* Time complexity: O(2^n)- since T(n) = T(n-1) + T(n-2)is an exponential time
* Space complexity: O(n) - space for recursive function call stack

```java
class Solution {
    public int fib(int n) {
        if(n <= 1) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }
}
```

<!-- Line breaks -->
<br />

#### Dynamic Programming - Top Down Approach

* Time complexity: O(n)
* Space complexity: O(n)

```java
class Solution {
    
    private int[] fibCache = new int[31];
    
    public int fib(int n) {
        if(n <= 1) {
            return n;
        }
        else if(fibCache[n] != 0) {
            return fibCache[n];
        }
        else {
            return fibCache[n] = fib(n - 1) + fib(n - 2); 
        }
    }
}
```

<!-- Line breaks -->
<br />

### Dynamic Programming - Bottom Up Approach

Time complexity: O(n)
Space complexity: O(n)

```java
class Solution {
    public int fib(int n) {
        if(n <= 1) {
            return n;
        }
        
        int[] cache = new int[n + 1];
        cache[1] = 1;
        
        for(int i = 2; i <= n; i++) {
            cache[i] = cache[i - 1] + cache[i - 2];
        }
        
        return cache[n];
    }
}
```

<!-- Line breaks -->
<br />

### 198. House Robber

You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight **without alerting the police**.

<!-- Line breaks -->
<br />

#### Solution

opt(i) should be the max value of following:
* opt(i-2) + arr[i]
* opt(i-1)
    
Break Points: 
* opt(0) = arr[0];
* opt(1) = max(arr[0], arr[1])

#### Recursive:

* Time complexity: O(2^n)- since opt(n) = opt(n-2) + arr[n]is an exponential time
* Space complexity: O(n) - space for recursive function call stack

```java
class Solution {
    public int rob(int[] nums) {
        return calculateMaxAmount(nums, nums.length - 1);
    }
    
    private int calculateMaxAmount(int[] nums, int i) {
        if(i == 0) {
            return nums[0];
        }
        else if(i == 1) {
            return Math.max(nums[0], nums[1]);
        }
        else {
            int val1 = calculateMaxAmount(nums, i - 2) + nums[i];
            int val2 = calculateMaxAmount(nums, i - 1);
            
            return Math.max(val1, val2);
        }
    }
}
```

<!-- Line breaks -->
<br />

### Dynamic Programming - Bottom Up Approach

Time complexity: O(n)
Space complexity: O(n)

```java
class Solution {
      public int rob(int[] nums) {
        int[] cache = new int[nums.length];
        cache[0] = nums[0];
        
        if(nums.length == 1) {
            return cache[0];
        }
        
        cache[1] = Math.max(nums[0], nums[1]);
        
        for(int i = 2; i < nums.length; i++) {
            int val1 = cache[i - 2] + nums[i];
            int val2 = cache[i - 1];
            cache[i] = Math.max(val1, val2);
        }
        
        return cache[nums.length - 1];
    }
}
```






