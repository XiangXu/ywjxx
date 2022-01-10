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




