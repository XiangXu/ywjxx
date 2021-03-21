---
layout: post 
title:  Java Volatile Keyword
date:   2021-02-06 19:54
image:  java.jpeg
tags:   Java, Thread
---

The java **Volatile keyworld is used to mark a java variable as "being stored in main memory"**. More precisely that means, **that every read of a volatile variable will be read from the computer's main memory, and not from CPU cache, and that every write to a volatile variable will be written to main memory, and not just to the CPU cache**.

## Variable Visibility Problems

The java **volatile** keyword guarantees visibility of changes to variables across threads.

In a multithread application where the threads operate on non-volatile variables, each thread may copy variables from main memory into a CPU cache while working on them, for performance reasons. If your computer contains more than one CPU, each thread may run on a different CPU. That means, that each thread may copy the variables into the CPU cache of different CPUs.

With non-volatile there are no guarantees about when the JVM reads data from main memory into CPU caches, or writes data from CPU caches into main memory.

```java
public class SharedObject
{
    public int counter = 0;
}
```
<!-- Line breaks -->
<br />

When the thread 1 increases the counter variable, but both thread 1 and thread 2 may need to read counter variable from time to time. If the counter variable is not declared volatile there is no guarantee about when the value of the counter variable is written from the CPU cache back to main memory. This means, that the counter variable value in the CPU cache may not be the same as in main memory. The problem with threads not seeing the latest value of a variable because it has not yet been written back to main memory by another thread, it is called a "visibility" problem. The updates of one thread are not visibility to other thread.

## The Java volatile Visibility Guarantee

The Java volatile keyword is intended to address variable visibility problems. By declaring the counter variable volatile all writes to the counter variable will be written back to main memory immediately. Also, all reads of the counter variable will be read directly from main memory.

```java
public class SharedObject
{
    public volatile int counter = 0;
}
```
<!-- Line breaks -->
<br />

**Declaring a variable volatile thus guarantees the visibility for other threads of writes to that variable**. In the scenario given above, where one thread(T1) modifies the counter, and another thread(T2) reads the counter (but never modifies it), declaring the counter variable volatiles is enough to guarantee visibility for T2 of writes to the counter variable.

If, however both T1 and T2 were incrementing the counter variable, then declaring the counter variable volatile would not have been enough.

## Full volatile Visibility Guarantee

Actually, the visibility guarantee of Java volatile goes beyond the volatile itself.

* If Thread A writes to a volatile variable and Thread B subsequently reads the same volatile variable, then all variables visible to Thread A before writing the volatile variable, will be also visibile to Thread B after it has read the volatile variable.

* If Thread A reads a volatile variable, then all variables visible to Thread A when reading the volatile variable will also be re-read from main memory.

## Instruction Reordering Challenges

The JVM and the CPU allowed to reorder instructions in the program for performance reasons, as long as the semantic meaning of the instructions remain the same.

```
int a = 1;
int b = 2;

a++;
b++;


int a = 1;
a++;

int b = 2;
b++;
```

<!-- Line breaks -->
<br />

However, instruction reordering present a challenge when one of the variables is a volatile variable.

```java
public class MyClass {
    private int years;
    private int months
    private volatile int days;

    public void update(int years, int months, int days){
        this.days   = days;
        this.months = months;
        this.years  = years;
    }
}
```

<!-- Line breaks -->
<br />

The values of months and years are still written to main memory when the days variable is modified, but this time it happens before the new values have been written to months and years. The new values are thus not properly made visible to other threads. The semantic meaning of the reordered instructions has changed.

## The Java volatile Happens-Before Guarantee

**To address the instruction of reordering challenge, the Java volatile keyword gives a "happens-before" guarantee, in addition to the visibility guarantee**. The happens-before guarantee guarantees that:

* **Reads from and writes to other variables cannot be reordered to occur after a write to a volativle variable**. 
* **Reads from and writes to other variables cannot be reordered to occur before a read of a volatile variable**.

## volatile is Not Always Enough

Even if the volatile keyword guarantees that all reads of a volatile variable are read directly from main memory, and all writes to a volatile variable are written directly to main memory, there are still situations where it is not enough to declare a variable volatile.

In the situation explained earlier where only Thread 1 writes to the shared counter variable, declaring the counter variable volatile is enough to make sure that Thread 2 always sees the latest written value.

In fact, multiple threads could even be writing to a shared volatile variable, and still have the correct value stored in main memory, if the new value written to the variable does not depend on its previous value. In other words, if a thread writing a value to the shared volatile variable does not first need to read its value to figure out its next value.

As soon as a thread needs to first read the value of a volatile variable, and based on that value generate a new value for the shared volatile variable, a volatile variable is no longer enough to guarantee correct visibility. The short time gap in between the reading of the volatile variable and the writing of its new value, creates an race condition where multiple threads might read the same value of the volatile variable, generate a new value for the variable, and when writing the value back to main memory - overwrite each other's values.

The situation where multiple threads are incrementing the same counter is exactly such a situation where a volatile variable is not enough.

## When is volatile Enough?

As I have mentioned earlier, if two threads are both reading and writing to a shared variable, then using the volatile keyword for that is not enough. You need to use a synchronized in that case to guarantee that the reading and writing of the variable is atomic. Reading or writing a volatile variable does not block threads reading or writing. For this to happen you must use the synchronized keyword around critical sections.

As an alternative to a synchronized block you could also use one of the many atomic data types found in the java.util.concurrent package. For instance, the AtomicLong or AtomicReference or one of the others.

**In case only one thread reads and writes the value of a volatile variable and other threads only read the variable, then the reading threads are guaranteed to see the latest value written to the volatile variable**. Without making the variable volatile, this would not be guaranteed.

The volatile keyword is guaranteed to work on 32 bit and 64 variables.

## Performance Considerations of volatile

Reading and writing of volatile variables causes the variable to be read or written to main memory. Reading from and writing to main memory is more expensive than accessing the CPU cache. Accessing volatile variables also prevent instruction reordering which is a normal performance enhancement technique. Thus, you should only use volatile variables when you really need to enforce visibility of variables.

Reference

<http://tutorials.jenkov.com/java-concurrency/volatile.html>

