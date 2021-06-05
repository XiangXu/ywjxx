---
layout: post 
title:  Design Pattern - Singleton Pattern
date:   2021-06-01 22:56
image:  design_pattern.jpg
tags:   Design_Pattern
---

Singleton pattern is one of the simplest design pattern in Java. This type of design pattern comes under creational pattern as **this pattern provides one of the best way to create an object**.

This pattern involves a single class which is responsible to create an object while making sure that only single object gets created. This class provides a way to access its only object which can be accessed directly without need to instantiate the object of the class.

## Implementation

We're going to create a *SingleObject* class. *SingleObject* class have its constructor as private and have a static instance of itself.

*SingletonObject* class provides a static method to get its static instance to outside world. *SingletonPatternDemo*, our demo class will use *SingleObject* class to get *SingleObject* object.

```java
public class SingleObject {

   //create an object of SingleObject
   private static final SingleObject instance = new SingleObject();

   //make the constructor private so that this class cannot be
   //instantiated
   private SingleObject(){}

   //Get the only object available
   public static SingleObject getInstance(){
      return instance;
   }

   public void showMessage(){
      System.out.println("Hello World!");
   }
}

public class SingletonPatternDemo {
   public static void main(String[] args) {

      //illegal construct
      //Compile Time Error: The constructor SingleObject() is not visible
      //SingleObject object = new SingleObject();

      //Get the only object available
      SingleObject object = SingleObject.getInstance();

      //show the message
      object.showMessage();
   }
}

//Lazy Initialization
public class Singleton {

    private static Singleton INSTANCE = null;

    private Singleton() {}

    public static Singleton getInstance() {
        if (INSTANCE == null) {
            synchronized (Singleton.class) {
                if (INSTANCE == null) {
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }

}
```

<!-- Line breaks -->
<br />

**Use lazy instantiation of a singleton or of any other object when there is a fair chance of the object not being needed, and immediate instantiation when the likelihodd of it being needed is high. In general, if instantiation were to fail, and the object is needed, it is better that it fail as early as possible**.



<!-- Line breaks -->
<br />

Reference

<https://www.tutorialspoint.com/design_pattern/singleton_pattern.htm>