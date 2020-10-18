---
layout: post
title:  Java Nested Class
date:   2020-1018 12:35
image:  java.jpeg
tags:   Java
---

Java Inner class or nested class is a class which is declared inside the class or interface.

**We user inner classes to logically group classes and interfaces in one place so that it can be more readable and maintainable**. Additionally, **it can access all the members of outer class including private members and methods**.

**Inner class is part of nested class. Non-static nested classes are known as inner class**.

## Advantage of Java Inner Classes

* Nested classes represent a special type of relationship that **it can access all members (data members and methods) of outer class including private**.
* **Nested classes are used to develop more readable and maintainable code** because logically group classes and interfaces in one place only.
* **Code optimization**: it rquires less code to write.

## Type of Nested Classes

* Non-static Nested Class (Inner class): 
  1. Member inner class
  2. Anonymouse inner class
  3. Local inner class

* Static nested class

### Java Member Inner Class

**A non-static class that is created inside a class but outside a method is called member inner class**.

```java
class TestMemberOuter1{  
 private int data=30;  
 class Inner{  
  void msg(){System.out.println("data is "+data);}  
 }  
 public static void main(String args[]){  
  TestMemberOuter1 obj=new TestMemberOuter1();  
  TestMemberOuter1.Inner in=obj.new Inner();  
  in.msg();  
 }  
}  
```

### Java Anonymous Inner Class

A class has no name is known anonymous inner class in Java. **It should be used if you have override method of class or interface**. It creates by class (maybe abstract or concrete) and Interface.

```java
abstract class Person
{  
    abstract void eat();  
}  
class TestAnonymousInner
{  
    public static void main(String args[])
    {  
        Person p=new Person(){  
            void eat()
            {
                System.out.println("nice fruits");
            }  
        };  
        p.eat();  
    }  
}  
```

### Java Local Inner Class

**A class created inside a method is called local inner class in java**. If you want to invoke the methods of local inner class, you must instantiate this class inside the method.

```java
public class localInner1
{
    private int data=30;//instance variable  
    void display()
    {  
        class Local
        {  
            void msg(){System.out.println(data);
        }  
    }  
    Local l=new Local();  
    l.msg();  
 }  
}  

```

### Java Static Nested Class

A static class created inside a class is called static nested class in Java. It cannot access non-static data members and methods. It can be accessed by outer class name.

* It can access static data member of outer class including private.
* static nested class cannot acess non-static data member or method.

```java
class TestOuter1
{  
    static int data=30;  
    static class Inner
    {  
        void msg(){System.out.println("data is "+data);}  
    }  
    public static void main(String args[])
    {  
        TestOuter1.Inner obj=new TestOuter1.Inner();  
        obj.msg();  
    }  
}
```
