---
layout: post
title:  Sorting
date:   2022-10-29 23:06
image:  algorithm.jpeg
tags:   [Fundation, Algorithm]
---

## LeetCode 912 Sort an Array

Given an array of integers nums, sort the array in ascending order and return it.

You must solve the problem without using any built-in functions in O(nlog(n)) time complexity and with the smallest space complexity possible.

```
Example 1:

Input: nums = [5,2,3,1]
Output: [1,2,3,5]
Explanation: After sorting the array, the positions of some numbers are not changed (for example, 2 and 3), while the positions of other numbers are changed (for example, 1 and 5).

Example 2:

Input: nums = [5,1,1,2,0,0]
Output: [0,0,1,1,2,5]
Explanation: Note that the values of nums are not necessairly unique.
```

Constraints:

* 1 <= nums.length <= 5 * 104
* -5 * 104 <= nums[i] <= 5 * 104


## Bubble Sort

* Time Complexity: O(n<sup>2</sup>)
* Space Complexity O(1)

```java
class Solution {
    public int[] sortArray(int[] nums) {
        for(int i = 0; i < nums.length - 1; i++) {
            for(int j = 0; j < nums.length - i - 1; j++) {
                if(nums[j] > nums[j + 1]) {
                    int tmp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = tmp;
                }
            }
        }
        return nums;
    }
}
```

## Insertion Sort

* Time Complexity: O(n<sup>2</sup>)
* Space Complexity O(1)

```java
class Solution {
    public int[] sortArray(int[] nums) {
        for(int i = 1; i < nums.length; i++) {
            int j = i - 1;
            while(j >= 0 && nums[j + 1] < nums[j]) {
                int tmp = nums[j + 1];
                nums[j + 1] = nums[j];
                nums[j] = tmp;
                j--;
            }
        }
        return nums;
    }
}
```

## Merge Sort

* Time Complexity: O(nlogn)
* Space Complexity O(n)

```java
class Solution {
    public int[] sortArray(int[] nums) {
        return mergeSort(nums, 0, nums.length - 1);
    }
    
    private int[] mergeSort(int[] nums, int startIndex, int endIndex) {
        if(endIndex - startIndex + 1 <= 1) {
            return nums;
        }
        
        int midIndex = (startIndex + endIndex) / 2;
       
        mergeSort(nums, startIndex, midIndex);
        mergeSort(nums, midIndex + 1, endIndex);
        merge(nums, startIndex, midIndex, endIndex);
        
        return nums;
    }
    
    private void merge(int[] nums, int startIndex, int midIndex, int endIndex) {
        int len1 = midIndex - startIndex + 1;
        int len2 = endIndex - midIndex;
        
        int[] left = new int[len1];
        int[] right = new int[len2];
        
        for(int i = 0; i < len1; i++) {
            left[i] = nums[startIndex + i];
        }
        
        for(int i = 0; i < len2; i++) {
            right[i] = nums[midIndex + i + 1];
        }
        
        int leftIndex = 0;
        int rightIndex = 0;
        int index = startIndex;
        
        while(leftIndex < len1 && rightIndex < len2) {
            if(left[leftIndex] <= right[rightIndex]) {
                nums[index] = left[leftIndex];
                leftIndex ++;
            }
            else {
                nums[index] = right[rightIndex];
                rightIndex ++;
            }
            index ++;
        }
        
        while(leftIndex < len1) {
            nums[index] = left[leftIndex];
            leftIndex ++;
            index ++;
        }
        
        while(rightIndex < len2) {
            nums[index] = right[rightIndex];
            rightIndex ++;
            index ++;
        }
    }
}
```

## Quick Sort:

* Time Complexity: average: O(nlogn) worest: O(n<sup>2</sup>)
* Space Complexity O(1)

```java
class Solution {
    public int[] sortArray(int[] nums) {
        return quickSort(nums, 0, nums.length - 1);
    }
    
    private int[] quickSort(int[] nums, int startIndex, int endIndex) {
        if(endIndex - startIndex + 1 <= 1) {
            return nums;
        }
        
        int pivot = nums[endIndex];
        int left = startIndex;
        
        for(int i = startIndex; i < endIndex; i++) {
            if(nums[i] < pivot) {
                int tmp = nums[left];
                nums[left] = nums[i];
                nums[i] = tmp;
                left ++;
            }
        }
        
        nums[endIndex] = nums[left];
        nums[left] = pivot;
        
        quickSort(nums, startIndex, left - 1);
        quickSort(nums, left + 1, endIndex);
        
        return nums;
    }
}
```

## LeetCode 75 Sort Colors

Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function.

```
Example 1:

Input: nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]

Example 2:

Input: nums = [2,0,1]
Output: [0,1,2]
```
 

Constraints:

* n == nums.length
* 1 <= n <= 300
* nums[i] is either 0, 1, or 2.
 

Follow up: Could you come up with a one-pass algorithm using only constant extra space?

## Bucket Sort:

* Time Complexity: average: O(nlogn) worest: O(n)
* Space Complexity O(1)

```java
class Solution {
    public void sortColors(int[] nums) {
        int[] buckets = new int[3];
        for(int num : nums) {
            buckets[num] ++;
        }
        
        int index = 0;
        for(int i = 0; i < buckets.length; i++) {
            for(int j = 0; j < buckets[i]; j++) {
                nums[index] = i; 
                index ++;
            }
        }
    }
}
```