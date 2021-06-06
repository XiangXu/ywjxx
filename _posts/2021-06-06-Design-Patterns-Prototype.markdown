---
layout: post 
title:  Design Pattern - Prototype Pattern
date:   2021-06-06 13:47
image:  design_pattern.jpg
tags:   Design_Pattern
---

**Prototype pattern refers to creating duplicate object while keeping performance in mind**. This type of design pattern comes under creational pattern as this pattern provides one of the best ways to create an object.

**This pattern involves implementing a prototype interface which tells to create a clone of the current object**. This pattern is used when creation of object directly is costly. For example, an object is to be created after a costly database operation. We can cache the object, returns its clone on next request and update the database as and when needed thus reducing database calls.

## Implementation

```java
// Create an abstract class implementing Clonable interface.
public abstract class Shape implements Cloneable {
   
   private String id;
   protected String type;
   
   abstract void draw();
   
   public String getType(){
      return type;
   }
   
   public String getId() {
      return id;
   }
   
   public void setId(String id) {
      this.id = id;
   }
   
   public Object clone() {
      Object clone = null;
      
      try {
         clone = super.clone();
         
      } catch (CloneNotSupportedException e) {
         e.printStackTrace();
      }
      
      return clone;
   }
}

public class Rectangle extends Shape {

   public Rectangle(){
     type = "Rectangle";
   }

   @Override
   public void draw() {
      System.out.println("Inside Rectangle::draw() method.");
   }
}

public class Square extends Shape {

   public Square(){
     type = "Square";
   }

   @Override
   public void draw() {
      System.out.println("Inside Square::draw() method.");
   }
}
```


<!-- Line breaks -->
<br />