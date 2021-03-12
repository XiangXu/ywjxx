---
layout: post 
title:  Design Pattern
date:   2021-03-12 22:24
image:  design_pattern.jpg
tags:   Design_Pattern
---

Factory pattern is one of the most used design patterns in Java. **This type of design comes under creational pattern as this pattern provides one of the best way to create an object**.

In factory pattern, **we create object without exposing the creation logic to the client and refer to newly created object using a common interface**.

## Implementation

We're going to create a *Shape* interface and concrete classes implementing the *Shape* interface. A factory class *ShapeFactory* is defined as a next step.

Step 1: create an interface.

```java
public interface Shape {
   void draw();
}
```

<!-- Line breaks -->
<br />

Step 2: create concrete classes implementing the same interface.

```java
public class Rectangle implements Shape {

   @Override
   public void draw() {
      System.out.println("Inside Rectangle::draw() method.");
   }
}

public class Square implements Shape {

   @Override
   public void draw() {
      System.out.println("Inside Square::draw() method.");
   }
}

public class Circle implements Shape {

   @Override
   public void draw() {
      System.out.println("Inside Circle::draw() method.");
   }
}
```

<!-- Line breaks -->
<br />

Step 3: create a factory to generate object of concrete class based on given information.

```java
public class ShapeFactory {
	
   //use getShape method to get object of type shape 
   public Shape getShape(String shapeType){
      if(shapeType == null){
         return null;
      }		
      if(shapeType.equalsIgnoreCase("CIRCLE")){
         return new Circle();
         
      } else if(shapeType.equalsIgnoreCase("RECTANGLE")){
         return new Rectangle();
         
      } else if(shapeType.equalsIgnoreCase("SQUARE")){
         return new Square();
      }
      
      return null;
   }
}
```

<!-- Line breaks -->
<br />

Step 4: use the factory to get object of concrete class by passing an inforatmion such as type.

```java

   public static void main(String[] args) {
      ShapeFactory shapeFactory = new ShapeFactory();

      //get an object of Circle and call its draw method.
      Shape shape1 = shapeFactory.getShape("CIRCLE");

      //call draw method of Circle
      shape1.draw();

      //get an object of Rectangle and call its draw method.
      Shape shape2 = shapeFactory.getShape("RECTANGLE");

      //call draw method of Rectangle
      shape2.draw();

      //get an object of Square and call its draw method.
      Shape shape3 = shapeFactory.getShape("SQUARE");

      //call draw method of square
      shape3.draw();
   }
}
```

Reference

<https://www.tutorialspoint.com/design_pattern/factory_pattern.htm>
