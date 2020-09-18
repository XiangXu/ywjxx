---
layout: post
title:  String vs StringBuilder vs StringBuffer
date:   2020-09-18 22:27
image:  java.jpeg
tags:   Java
---

## String

**String is immutable in Java**, if we have a look at Java source code, we can find that a final bypte array is used for character storage.

```java

/**
    * The value is used for character storage.
    *
    * @implNote This field is trusted by the VM, and is a subject to
    * constant folding if String instance is constant. Overwriting this
    * field after construction will cause problems.
    *
    * Additionally, it is marked with {@link Stable} to trust the contents
    * of the array. No other facility in JDK provides this functionality (yet).
    * {@link Stable} is safe here, because value is never null.
    */
@Stable
private final byte[] value;

```

<!-- Line breaks -->
<br />

The String object is the most used class in the Java language. Thanks to the immutability of Strings in Java, the JVM can optimize the amount of memory allocated for them by **storing only one copy of each literal String in the pool**. This process is called interning.

**String Pool in java is a pool of Strings stored in Java Heap Memory**. Everytime when we create a String variable and assign a value to it, the JVM will search the String pool for a String of equal value.

**If found, the Java compiler will return a reference to its memory address, without allocating additional memory**, by doing this, JVM can save lots of spaces. However **if new operator is used, it explicitly creates a new String in heap memory**.

### Garbage Collection

**Before Java 7, the JVM placed the Java String Pool in the PerGen space, which has fixed size - it cann't expanded at runtime and is not eligible for garabage collection**.

**From Java 7 onwards, the Java String Pool is stored in the Heap space, which is garbage collected by the JVM**. The advantage of this approach is the reduced risk of OutOfMemory error because unreferenced Strings will be removed from the pool, thereby releasing memory.

## StringBuilder vs StringBuffer

As we already know String class is an immutable class, StringBuilder and StringBuffer are mutable classes. 

The Operator + is overloaded for String and used to concatenate two Strings. Internally it uses StringBuffer or StringBuilder to perform this action. However when you are concatenating in a loop, that's usually when the compiler cann't substitue StringBuilder or StringBuffer by itself, you have to use StringBuffer or StringBuilder instead. 

**StringBuffer is thread safe and synchronized whereas StringBuilder is not, that is why StringBuilder is more faster than StringBuffer**.

Reference

<https://www.baeldung.com/java-string-pool>

<https://www.journaldev.com/538/string-vs-stringbuffer-vs-stringbuilder>



