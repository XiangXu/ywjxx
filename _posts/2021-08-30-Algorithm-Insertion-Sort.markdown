---
layout: post
title:  Insertion Sort
date:   2021-08-30 21:44
image:  algorithm.jpeg
tags:   [Fundation, Algorithm]
---

Insertion sort ia a simple sorting algorithm that works similar to the way you sort playing cards in your hands. The  array is virtually split into a sorted and an unsorted part. Values from the unsorted part are picked and placed at the correct position in the sorted part.

## Algorithm

To sort an arry of size n i ascending order:

1. Iterate from arr[1] to arr[n] over the array.
2. Compare the current element to its predecessor.
3. If the key element is smaller than its predecessor, compare it to the elements before. Move the greater elements one position up to make space for the swapped element.

## Implementation

```java
package algorithms;

import java.util.Arrays;

public class InsertionSort {

    private void sort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;

            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }

            arr[j + 1] = key;
        }
    }


    public static void main(String[] args) {
        int[] arr = {31, 41, 59, 26, 41, 58};

        System.out.println("Before sort:");
        Arrays.stream(arr).forEach(i -> {
            System.out.print(i + " ");
        });

        System.out.println();

        InsertionSort insertionSort = new InsertionSort();
        insertionSort.sort(arr);

        System.out.println("After sort:");
        Arrays.stream(arr).forEach(i -> {
            System.out.print(i + " ");
        });
    }
}

```

<!-- Line breaks -->
<br />

## Time & Space Complexity:

* **Time Complexity: O(n<sup>2</sup>)**
* **Space Complexity: O(l)**