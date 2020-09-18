---
layout: post
title:  "StringBuilder vs StringBuffer"
date:   2020-09-18 11:28
image:  java.jpeg
tags:   Java
---

## String

String is **immutable** in Java. If we have a look at Java source code, We can find that an final byte array is used for character storage. 

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

1. When we create a String using double quotes, it first looks for the String with same value in the JVM string pool, if found it returns the reference otherwise it creates the String object and then places it in the String pool. This way JVM saves a lot of spaces by using the same String in different threads. But if a new operator is used, it explicitly creates a new String in heap memory.

2. Operator + is overloaded for String and used to concatenate two String. Although internally it uses StringBuffer or StringBuilder to perform this action.

3. String overrides **equals()** and **hashCode()** methods, two Strings are equal only if they have the same characters in the same order. 

## String vs StringBuffer vs StringBuilder

1. String is immutable whereas StringBuffer and StringBuilder are mutable class. 
   
2. String concat + operator internally use StringBuffer or StringBuilder class.  (However when you are concatenating in a loop, that's usually when the compiler cann't substitue StringBuilder or StringBuffer by itself.
   
3. StringBuffer is thread safe and synchronized whereas StringBuilder is not, that is why StringBuilder is more faster than StringBuffer.


Reference: 

<https://www.journaldev.com/538/string-vs-stringbuffer-vs-stringbuilder>

<https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.18.1>