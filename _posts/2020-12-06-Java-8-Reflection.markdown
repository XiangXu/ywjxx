---
layout: post
title:  Java Reflection
date:   2020-12-06 13:55
image:  java.jpeg
tags:   Java
---

Java reflection **provides ability to inspect and modify the runtime behavior of application**.

Using Java reflection we can inspect a class, interface, enum, get their structure, methods and fields information at runtime even though class is not accessible at comiple time.

We can also use reflection to instantiate an object, invode it's methods, change field values.

## Reflection in Java

Reflection in Java is a very powerful conectp and it's of little use in normal programming but it's backbone for most of the Java, J2EE frameworks.

For example, JUnit, Spring, Tomcat, Eclipse, Struts and Hibernate.

We should not use reflection in normal programming where we already have access to the classes and interfaces because of following drawbacks:

* **Poor Performance**: Since Java reflection resolve the types dynamically, it involves processing like scanning the classpath to find the class load, causing slow performance.

* **Security Restrictions**: Reflection requires runtime permissions that might not be available for system running under security manager. This can cause your application to fail at runtime because of security manager.

* **Security Issues**: Since reflection we can access part of code that are not supposed to access, for example we can access private fields of a class and change its value. This can be a serious security thread and cause your application to behave abnormally.

* **High Maintenance**: Reflection code is hard to understand and debug, also any issues with the code cannot be found at compile time becuase the classes might not available, making it less flexible and hard to maintain.

## Reflection API

Reflection can be used to get information about:

* Class: The getClass() method is used to get the name of the class to which an object belongs.

* Constructor: The getConstructor() method is used to get the public constructors of the class which an object belongs.
  
* Methods: The getMethods() is used to get the public methods of the class to which an objects belongs.

```java
// class whose object is to be created 
class Test 
{ 
    // creating a private field 
    private String s; 
  
    // creating a public constructor 
    public Test()  {  s = "GeeksforGeeks"; } 
  
    // Creating a public method with no arguments 
    public void method1()  { 
        System.out.println("The string is " + s); 
    } 
  
    // Creating a public method with int as argument 
    public void method2(int n)  { 
        System.out.println("The number is " + n); 
    } 
  
    // creating a private method 
    private void method3() { 
        System.out.println("Private method invoked"); 
    } 
} 
  
class Demo 
{ 
    public static void main(String args[]) throws Exception 
    { 
        // Creating object whose property is to be checked 
        Test obj = new Test(); 
  
        // Creating class object from the object using 
        // getclass method 
        Class cls = obj.getClass(); 
        System.out.println("The name of class is " + 
                            cls.getName()); 
  
        // Getting the constructor of the class through the 
        // object of the class 
        Constructor constructor = cls.getConstructor(); 
        System.out.println("The name of constructor is " + 
                            constructor.getName()); 
  
        System.out.println("The public methods of class are : "); 
  
        // Getting methods of the class through the object 
        // of the class by using getMethods 
        Method[] methods = cls.getMethods(); 
  
        // Printing method names 
        for (Method method:methods) 
            System.out.println(method.getName()); 
  
        // creates object of desired method by providing the 
        // method name and parameter class as arguments to 
        // the getDeclaredMethod 
        Method methodcall1 = cls.getDeclaredMethod("method2", 
                                                 int.class); 
  
        // invokes the method at runtime 
        methodcall1.invoke(obj, 19); 
  
        // creates object of the desired field by providing 
        // the name of field as argument to the  
        // getDeclaredField method 
        Field field = cls.getDeclaredField("s"); 
  
        // allows the object to access the field irrespective 
        // of the access specifier used with the field 
        field.setAccessible(true); 
  
        // takes object and the new value to be assigned 
        // to the field as arguments 
        field.set(obj, "JAVA"); 
  
        // Creates object of desired method by providing the 
        // method name as argument to the getDeclaredMethod 
        Method methodcall2 = cls.getDeclaredMethod("method1"); 
  
        // invokes the method at runtime 
        methodcall2.invoke(obj); 
  
        // Creates object of the desired method by providing 
        // the name of method as argument to the  
        // getDeclaredMethod method 
        Method methodcall3 = cls.getDeclaredMethod("method3"); 
  
        // allows the object to access the method irrespective  
        // of the access specifier used with the method 
        methodcall3.setAccessible(true); 
  
        // invokes the method at runtime 
        methodcall3.invoke(obj); 
    } 
} 

// The name of class is Test
// The name of constructor is Test
// The public methods of class are : 
// method2
// method1
// The number is 19
// The string is JAVA
// Private method invoked
```

Reference

<https://www.programiz.com/java-programming/reflection>