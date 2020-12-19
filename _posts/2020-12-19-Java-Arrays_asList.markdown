---
layout: post
title:  Arrays.asList(T...)
date:   2020-12-19 10:53
image:  java.jpeg
tags:   Java
---

1. asList method is one of the utility methods of Array class, it is a static method thats why we can call this method by its name.

2. **Please note that this method doesn't create new ArrayList object, it just return a List of reference to existing Array object**. (Two references to existing Array object gets created).

3. All methods operate on the List object, may NOT work on this array object using List reference like for example, Array size is fixed in length, hence you obviously cannot add or remove element from Array object using this List reference like list.add(10) or list.remove(10) else it will throw **UnsupportOperationException**.

4. **In Java 8, parameter must be Integer[] and not int[]. Array.asList() of an int array returns a list with a single element.The reason is because generics only work with reference types**. That means List is not allowed, so Array.asList cannot return List. Instead Array.asList interprets its input as a single object and returns a list with that single element. 

Reference

<https://stackoverflow.com/questions/16748030/difference-between-arrays-aslistarray-and-new-arraylistintegerarrays-aslist>