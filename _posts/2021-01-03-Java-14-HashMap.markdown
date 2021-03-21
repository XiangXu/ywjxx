---
layout: post 
title:  HashMap
date:   2021-01-03 19:05
image:  java.jpeg
tags:   Java
---

## Map and HashMap

Map is a collection which stores elements as key-var pairs. A map cannot contain duplicate keys and each key can map to at most one value. The map interface includes methods for basic operations such as put, get, remove, containsKey, containsValue, size, and empty, bulk operations such as putAll, clear and collection views such as keySet, entrySet and values.

HashMap implements Map interface in Java. **It is not synchronized and it is not thread safe**. HashMap works with Hashing, to understand hahsing, we should understand first about hash function, hash value and bucket.

## What is Hashing?

Let's consider an array that is not sorted and the problem is searching a value in the array. The search requires comparing all elements of the array. So the time complexity is O(n). If the array is sorted, a binary search can reduce the time complexity to O(logn). Also, the search can be faster if there is a function which returns an index for each element in the array. In that case the time complexity is reduced to a constant time O(1). Such function is called **Hash Function**. A hash function is a function which for a given array, generates a **Hash Value**.

Java has a hash function which called **hashCode()**. **The hashCode() method is implemented in the Object class and therefore each class in java inherits it**. The hash code provides the hash value. Here is the implementation of hashCode method in Object class.

```java
public native int hashCode();
```

<!-- Line breaks -->
<br/>

## What is bucket?

A bucket is used to store key-value pairs. A bucked can have multiple key-value paris. **In HashMap, bucket uses simple linkedlist to store objects**.

## HashMap implementation inside Java

In HashMap, get(Object key) calls hashCode() on the key object and uses the returned hashValue to find bucket location where keys and values are stored as a Entry.

```java
public V get(Object key) {
        Node<K,V> e;
        return (e = getNode(hash(key), key)) == null ? null : e.value;
}
 
static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

<!-- Line breaks -->
<br/>

get(Object key) also checks whether the key is null or not. **There can be only one null keyi in HashMap**. If the key is null, then the null key always map to hash 0, then index 0. If the key is not null, then it will call hash function on the object.

Now, the hash value is used to find the bucket location at which Entry object is stored. Entry object stores in the bucket as(hash, key, value, bucket index). Then the value boject is returned.

**What about if two keys have the same hashcode?** Here, the implementation of equals() method for key object is become important.

**The bucket is a linkedlist but not java.util.LinkedList. HashMap has its own implementation of the linkedlist**. Therefore, it traverses through linkedlist and compares key in each entry using key.equals() until equals() returns true. Then the value object is returned.

Also if when two keys are the same and have same hashcode, then the previous key-value pair is replaced with current key-value pair.

It is important that in Map, any class can serve as a key if and only if it overrides the equal() and hashCode() method. Also, **it is the best practice to make the key class an immutable class**.

## HashMap Performance

**An instance of HashMap has two attributes that affect its performance: initial capacity and load factor**

* The capacity is the number of buckets in the hashMap. The initial capacity is the capacity when the hashMap is created.
* The load factor is a measure of how full the HashMap is allowed to get, before its capacity is automatically increased. 

When the number of entries in HashMap exceeds the product of the load factor and the current capacity, the hashMap is rehashed. Then, the HashMap has approximately twice the number of buckets. In HashMap class, **the default value of load factor is 0.75**.

## HashMap in Java 8

**Since java 8 if HashMap contains more than 7 elements in the same bucket linked list transforms to a tree and time complexity changes to O(logn)**.

Java 8 has come with the following improvements/changes of HashMap objects in case of high collisions.

* The alternative String hash function added in Java 7 has been removed.
* Buckets containing a large of number of collising keys will stored their entries in a balanced tree instead of a linkedlist after certain threshold is reached. 

In Java 8, HashMap replaces linkedlist with a binary tree when the number of element in a backet reaches certain threshold. While converting the list to binary tree, hashcode is used as a branching variable. If there are two different hashcodes in the same bucket, one is considered bigger goes to the right of the tree and other one to the left. But when both the hashcode are equal, HashMap assumes that the keys are comparable, and compares the key to determine the direction so that some order can be maintained. It is a good practice to make the keys of HashMap comparable.

## Questions

1. Describe time complexity of lookups in HashMap?

It is usually O(1), with a decent hash which itself is constant time. However, it the worst case, a hashMap has an O(n) look up due to walking through all entries in the same hash bucket. In JDK8, HashMap replaces linkedlist with a binary tree when the number of element in a backet reaches certain threshold, so the time complexity would be O(logn).

2. How does bucket index calculation work in a hashMap?
   
```java
static int indexFor(int h, int length) 
{
   return h & (length-1);
}
```

The hash itself is calculated by the hashCode() method of the object you're tyring to store.

What you see here is calculating the "bucket" to store the object based on the hash h. Ideally, to evade collisions, you would have the same number of buckets as is the maximum achievable value of h - but that could be too memory demanding. Therefore, you usually have a lower number of buckets with a danger of collisions.

If h is, say, 1000, but you only have 512 buckets in your underlying array, you need to know where to put the object. Usually, a mod operation on h would be enough, but that's too slow. Given the internal property of HashMap that the underlying array always has number of buckets equal to 2^n, the Sun's engineers could use the idea of **h & (length-1)**, it does a bitwise AND with a number consisting of all 1's, practically reading only the n lowest bits of the hash (which is the same as doing h mod 2^n, only much faster).

The expression h & (length-1) does a bit-wise AND on h using length-1, which is like a bit-mask, to return only the low-order bits of h, thereby making for a super-fast variant of h % length.

```
hash h: 11 1110 1000  -- (1000 in decimal)
length  l: 10 0000 0000  -- ( 512 in decimal)
        (l-1): 01 1111 1111  -- ( 511 in decimal - it will always be all ONEs)
h AND   (l-1): 01 1110 1000  -- ( 488 in decimal which is a result of 1000 mod 512)
```

1. How to prevent collision in HashMap?

* Ensure you override hashCode() and equals() method.
* Create a hash function that creates the best possible distribution of values throughout the hashMap.

Reference

<https://examples.javacodegeeks.com/core-java/maphashmap-works-internally-java/>

<https://www.nagarro.com/en/blog/post/24/performance-improvement-for-hashmap-in-java-8#:~:text=In%20worst%20case%20scenario%2C%20when,Java%207%20has%20been%20removed.>