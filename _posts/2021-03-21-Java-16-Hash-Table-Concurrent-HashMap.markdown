---
layout: post 
title:  Hash Table vs Concurrent HashMap and it's internal working
date:   2021-03-21 12:25
image:  java.jpeg
tags:   Java, Thread
---

Even though all properties of HashTable and Concurrent HashMap is simililar but "If it is a thread-safe highly-concurrent implementation is desired, then it is recommended to use ConcurrentHashMap in place of HashTable. Why?"

1. Even though both Concurrent HashMap and HashTable are thread safe. But HashTable has **poor performance** in multi-threading usage.
2. If one thread allows to perform any kind of operation(put or get), **other thread must and should wait until the operation was completed by the tread which is working on hash table**.

## Internal working of HashTable

![hashTable](https://miro.medium.com/max/1400/0*-bIUqhJOlSkJuw6m.png)

This diagram seems to be similar to the internal implementation of HashMap, but **HashMap is synchronized** and provides thread safe like concurrent HashMap but in the performance point of view, HashTable write operation uses **map side lock which means it locks the complete map object**.

For example, Thread 1 calls get()/put() operation on HashTable and **acquires the lock on complete hashtable object**. Now if thread 2 calls get()/put()  operation, **it has to wait till t1 finishes get()/put() operation and releases the lock on the object**.

![example1](https://miro.medium.com/max/2000/0*BmTbmUY8YXD1v365.png)

## Internal working of Concurrent HashMap

![concurrentHashMap](https://miro.medium.com/max/2000/0*qO64Hu9t5mBN7T4f.png)

**Threads acquiring lock on ConcurrentHashMap for Multi-Threading Environment**.

Concurrrent HashMap works a bit different as **it acquires lock per Segment which means instaed of single map wide lock, it has multiple Segement level locks. It uses a Locking technique name ReentrantLock**.

So 2 Threads operating on different segments can acquire lock on those segments without interfering with each other and can proceeed simultaneously as they working on separate Segment locks.

Simultaneous Read and Write operations by Multiple Threads on same or different segments of Concurrent HashMap.

* Read/Get Operation: Two Threads T1 and T2 can read data from the same or different segment of Concurrent HashMap at the same time without blocking each other.
* Write/Put Operation: Two Threads T1 and T2 can write data on different segment at the same time without blocking the ohter.

But Two threads can’t write data on same segments at the same time. One has to wait for other to complete the operation.

![example3](https://miro.medium.com/max/2000/0*EIGQ5ZqOcj-pIgKZ.png)

Reference

<https://medium.com/art-of-coding/hash-table-vs-concurrent-hashmap-and-its-internal-working-b28fc2725bdb>
