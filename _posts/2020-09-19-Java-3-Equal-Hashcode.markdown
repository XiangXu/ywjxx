---
layout: post
title:  Equal vs == and HashCode()
date:   2020-09-19 17:17
image:  java.jpeg
tags:   Java
---

## == 

"==" operator works perfectly for the primitive data types like int, boolean, long, etc. However for the reference or no-primitive data types, "==" operator shows not the equality of the objects, but whether they are refer to the same object in memory. It works in such a way due to Java Memory Model(JVM): primitives object are stored in method area and reference objects are stored in heap.

## equal()

equal(Object o) method is used to indicate whether some other object o is equal to current object(on which the method has been invoked).

**The default implementation of "equals()" mehod in Object class calls "==" operator under the hood**.

```java
public boolean equals(Object o) {
   return (this == o);
}
```

<br/>

## hashcode()

hahscode() method returns a hash code value of the object, it is a native method in Object class.

```java
// keywoard native in Java is used with methods to indicate that the method is implemented in other language. 
// It is possible to call such methods using JNI(Java Native Interface).
public native int hashCode();
```

<br/>

There are 3 rules to hashcode method:

1. Each invocation of hashcode() method on the same object that hasn't been changed must produce the same result each time.
2. If 2 objects are equal through the equal() method, then invoking the hashcode() method on each of these 2 objects must produce the same result.
3. If invoking the hashcode() method on 2 objects produces the same result, it doesn't mean that they are equal through the equals() method.

## How equals() and hashcode() related to each other?

Let's have a look at hashed collections first. Such collections hash each their element to provide fast access to them (O(l) in most cases). The most popular Java hashed collection is **HashMap**. It is used to to keep "key - value" pairs. It uses **hashCode()** and **equals()** to proceed **put()** and **get()** operations. 

**HashMap** contains several buckets (the number changes if the size is reached), that could be used to store the **key-value** elements (such pair called Entry) in them. The bucket could contain zero, one or several elements. If there are several elements, it is called a collision, and the elements are stored in a LinkedList (it is only partly true, but, again, we are focusing on the concept right now) inside the bucket.

So when the **put(Key key, Value value)** method is called, the following steps are performed under the hood:

1. If key is null, the key-value pair(entry) is put into the 1st bucket; 
   
2. If not null, the **hashCode()** method is called on the key;
   
3. **HashMap** takes key hash value, processes it through the inernal computations to get the number of bucket to be used;
   
4. If the chosen bucket is empty, the Entry is put there, and that's it.
   
5. If the bucket is not empty, it iterates through all the existing entries inside the bucket and compares their keys with the key from put method using equals();

6. If equals() return false for each iteration, the Entry will be stored in the current bucket. 

7. If equals() reutrn true for some case, so the Entry has the same key as from the put() method, this Entry value will be replaced by the new value.

Let's take a look at **get(Key key)**

1. If key is null, we go to the 1st bucket and look for the Entry with the key == null — if exists, its value is returned;

2. If key is not null, the hashCode() method is called on the key;
HashMap takes the key hash value, processes it through the internal computations to get the number of the bucket to be used;We go to the bucket with the number providing on the 3rd step;

3. If the bucket is empty — return null;

4. If that bucket contains only one Entry, we compare (equals()) that Entry key with our key: if true — return the Entry value, if false — return null;

5. If the bucket contains several elements, we iterate through each of them and compare (equals()) the key of each Entry with our key: if true — return matching Entry value, if false for each — return null.

So you have just seen, that the equals() and hashCode() methods work together inside the HashMap to get and put the data: hashCode() is used to compute the bucket number and equasls() is used to find the Entry with the same key.


Reference

<https://itnext.io/how-and-why-to-cook-equals-and-hashcode-in-java-c108fd5b17dd>