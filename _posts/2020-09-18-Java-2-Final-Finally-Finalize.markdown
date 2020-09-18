---
layout: post
title:  final, finally and finalize
date:   2020-09-18 23:23
image:  java.jpeg
tags:   Java
---

## final 

The **final keyword** in java is used to restrict the user. The Java final keyword can bu used in may context.

1. **final with variable**: The value of variable cannot be changed.
2. **final with class**: The class cannot be subclassed.
3. **final with method**: The method cannot be overriden by a subclass.

## finally

The finally keyword is used in association with try/catch block and guarantees that a section of code will be executed, even if an exception is thrown. The finally block will be executed after the try and catch blocks. **The only exception is aemon threads will terminates their run() methods without executing finally caluses**.

## finalize

That is a method that the Garbage Collector always call jsut before the deletion/destorying the object which is eligible for Garbage Collection, so as to perform clean-up activity.

```java
class Hi { 
    public static void main(String[] args) 
    { 
        Hi j = new Hi(); 
  
        // Calling finalize method Explicitly. 
        j.finalize(); 
  
        j = null; 
  
        // Requesting JVM to call Garbage Collector method 
        System.gc(); 
        System.out.println("Main Completes"); 
    } 
  
    // Here overriding finalize method 
    public void finalize() 
    { 
        System.out.println("finalize method overriden"); 
        System.out.println(10 / 0); 
    } 
} 

//exception in thread "main" java.lang.ArithmeticException:
//by zero followed by stack trace.


class RR { 
    public static void main(String[] args) 
    { 
        RR q = new RR(); 
        q = null; 
  
        // Requesting JVM to call Garbage Collector method 
        System.gc(); 
        System.out.println("Main Completes"); 
    } 
  
    // Here overriding finalize method 
    public void finalize() 
    { 
        System.out.println("finalize method overriden"); 
        System.out.println(10 / 0); 
    } 
} 

//finalize method overriden
//Main Completes
```
