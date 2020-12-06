---
layout: post
title:  Autoboxing and Unboxing in Java
date:   2020-12-06 14:27
image:  java.jpeg
tags:   Java
---

## Autoboxing

**Converting a primitive value into an object of the corresponding wrapper class is called autoboxing**.

For example, converting int to Integer class. The Java compiler applies autoboxing when a primitive is:

* Passed as a parameter to a method that expected an object of the corresponding wrapper class.
* Assigned to a variable of the corresponding wrapper class.

## Unboxing

**Converting an object of a wrapper type ot its corresponding primitive value is called unboxing**.

For example, converting Integer class to int. The Java compiler applies unboxing when an object of a wrapper class is:

* Passed a parameter to a method that expected a value of the corresponding primitive type.
* Assigned to a variable of cthe corresponding primitive type.

## Advantage of Autoboxing / Unboxing

* Autoboxing and Unboxing lets developers write cleaner code, making it easier to read.
* The technique let us use primitive types and wrapper class objects interchangeably and we do not need to perform typecasting explicitly.

Reference

<https://www.geeksforgeeks.org/autoboxing-unboxing-java/>
