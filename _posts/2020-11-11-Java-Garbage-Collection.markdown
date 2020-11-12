---
layout: post
title:  Java Garbage Collection
date:   2020-11-11 20:43
image:  java.jpeg
tags:   Java
---

**Garbage collection is the process of looking at heap memory, identifying which objects are in use and which are not, and deleting the unused object**. An in use object, or a referenced object, means that some part of you program still maintains a pointer to that object. An unused object,  or uneferenced object, is no longer referenced by any part of your program. So the memory used by unferenced object can be reclaimed.

* Step 1: **Marking** : The first step in the process is called **Marking**. This is where the garbage collector identifies which pieces of memory are in use and which are not.
* Step 2: **Normal Deletion**: Normal deletion removes unferenced objects leaving referenced objects and pointers to free space.
* Step 2a: **Deletion with Compacting**: The further improve performance, in addition to deleting unreferenced objects, you can also compact the remaining referenced objects. By moving referenced object together, this makes new memory allocation much easier and faster.

## Why Generational Garbage Collection?

As stated earlier, having to mark and compact all the objects in a JVM is inefficient. As more and more objects are allocated, the list of objects grows and grows leading to longer and longer garbage collection time. However, **empirical analysis of applications has shown that most objects are short lived. Fewer and fewer objects remain allocated over time. In fact most objects have a very short life**.

## JVM Generations

The information learned from the object allocation behavior can be used to enhance the performance of the JVM. Therefore, the heap is broken up into smaller parts or generations. The heap parts are: **Young Generation, Old Generation and Permanent Generation**.

![Generation](/images/java/Slide5.png)

**The Young Generation is where all new objects are allocated and aged**. When the young generation fills up, this causes a **minor garbage collection**. Minor collections can be optimized assuming a high object mortality rate. A young generation full of dead objects is collected very quickly. Some surviving objects are aged and eventually move to the old generation.

**Stop the World Event** - ***All minor garbage collections are "Stop the World" events**. This means that all applicaiton threads are stopped until operation completes. Minor garbage collection are always Stop the World Event.

**The Old Generation is used to store long surviving objects**. Typically, a threshold is set for young generation object and when that age is met, the object gets moved to the old generation. Eventually the old generation needs to be collected. This event is called a **major garbage collection**.

**Major garbage collection are also Stop the World events**. Often a major collection is much slower because it involves all live objects. So for responsive applications, major garbage collections should be minimied. Also note, that the length of the Stop the World event for a major garbage collection is affected by the kind of garbage collector is used for the old generation space.

**The Permanent Generation contains metadata required by the JVM to describe the classes and methods used in application**. The permanent generation is populated by the JVM at runtime based on classes in use by the application. In addition, Java SE library classes and methods may be stored here.

Classes may get collected if the JVM finds they are no longer needed and space may be needed for other classes. **The permanent generation is included in full garbage collection**.

### PermGen vs Metaspace

#### PermGen

**PermGen is a special heap space seperated from the main memory heap**.

**The JVM keeps track of loaded class metadata in the PermGen. Additionally, the JVM stores all the static content in this memory section. This includes all the static methods, primitive variables, and references to the static objects.**

Furthermore, it contains data about byte code, names and JIT information. B**efore Java 7, the String Pool was also part of this memory. The disadvantages of the fixed pool size: the JVM placed the Java String Pool in the PermGen space, which has a fixed size — it can't be expanded at runtime and is not eligible for garbage collection**.

The default maximum memory size for 32-bit JVM is 64 MB and 82 MB for the 64-bit version.

However, we can change the default size with the JVM options:

-XX:PermSize=[size] is the initial or minimum size of the PermGen space -XX:MaxPermSize=[size] is the maximum size

With its limited memory size, PermGen is involved in generating the famous OutOfMemoryError. Simply put, the class loaders aren't garbage collected properly and, as a result, generated a memory leak.

#### Metaspace

**From Java 8 version, Metaspace has been implemented to replace the older PermGen meemory space. This native memory region grows automatically by default**.

* MetaspaceSize and MaxMetaspaceSize – we can set the Metaspace upper bounds.

* MinMetaspaceFreeRatio – is the minimum percentage of class metadata capacity free after garbage collection.

* MaxMetaspaceFreeRatio – is the maximum percentage of class metadata capacity free after a garbage collection to avoid a reduction in the amount of space.

Reference

<https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html>

<https://www.baeldung.com/java-permgen-metaspace>

