---
layout: post
title:  Backtracking
date:   2020-11-15 20:08
image:  algorithm.jpeg
tags:   [Fundation, Algorithm]
---

**Backtracking is an algorithmic-technique for solving problem recursively by trying to build a solution incremently**, one piece at a time. Removing those solutions that fail to satisfy the constraints of the problem at any point of time.

There are 3 types of problems in backtracking:

1. Decision Problem - In this, we search for a feasible solution.
2. Optimization Problem - In this, we search for best solution.
3. Enumeration Problem - In this, we find all feasible solutions.

## How to determine if a problem can be solved using Backtracking?

Generally, **every constraint satisfication problem which has clear and well-defined constraints on any objective solution, that incrementally builds candidate to the solution and abandons a candidate(backtracks) as soon as it determines that the candidate cannnot possibly be completed to a valid solution, can be solved by backtracking**.

However, most of the problems that are discussed, can be solved using other algorithms like Dynamic Programming or Greedy Algorithm in logarithmic, linear, linear-logarithmic time complexity in order of input size, and therefore, outshine the backtracking algorithm in every respect (since backtracking algorithms are generally exponential in both time and space). However, a few problems still remain, that only have backtracking algorithms to solve them until now.

Consider a situation that you have three boxes in front of you and only one of them has a gold coin in it but you do not know which one. So, in order to get the coin, you will have to open all of the boxes one by one. You will first check the fist box, if it does not contain the coin, you will have to close it and check the second box and so on until you find the coin. This is what backtracking is, that is solving all sub-problems one by one in order to reach the best possible solution.

Backtracking problem in LeetCode:

<https://leetcode.com/problems/letter-combinations-of-a-phone-number/>

```java
private void backTracking(int index, String digits, StringBuilder sb, List<String> result)
{
    if(index == digits.length())
    {
        result.add(sb.toString());
        return;
    }
    
    String letters = keyboard[digits.charAt(index) - '0'];
    for(char letter : letters.toCharArray())
    {
        sb.append(letter);
        backTracking(index+1, digits, sb, result);
        sb.deleteCharAt(sb.length() - 1);
    }
}
```

<!-- Line breaks -->
<br />

Reference

<https://www.geeksforgeeks.org/backtracking-introduction/#:~:text=Backtracking%20is%20an%20algorithmic%2Dtechnique,reaching%20any%20level%20of%20the>
