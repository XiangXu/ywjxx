---
layout: post 
title:  Design Pattern - Factory Pattern
date:   2021-03-20 13:15
image:  design_pattern.jpg
tags:   Design_Pattern
---

Abstract Factory patterns work around a super-factory which creates other factories. This factory is also called as factory of factories. This type of design pattern comes under creational pattern as this pattern provides one of the best ways to create an object.

In Abstract Factory pattern an interface is responsible for creating a factory of related objects whithout explicitly speficying their classes. Each generated factory can give the objects as per the Factory pattern.

**The main difference between a factory method and an abstract factory is that the factory method is a method, and an abstract factory is an object**. The intended purpose of the class containing a factory method **is not to create objects**, while an abstract factory should only be used to create objects.

Step1: Create an interface of Shapes.

```java
public interface Shape {
   void draw();
}
```

<!-- Line breaks -->
<br />

Step2: Create concrete classes implementing the same interface.

```java
public class RoundedRectangle implements Shape {
   @Override
   public void draw() {
      System.out.println("Inside RoundedRectangle::draw() method.");
   }
}

public class RoundedSquare implements Shape {
   @Override
   public void draw() {
      System.out.println("Inside RoundedSquare::draw() method.");
   }
}

public class Rectangle implements Shape {
   @Override
   public void draw() {
      System.out.println("Inside Rectangle::draw() method.");
   }
}
```

<!-- Line breaks -->
<br />

Step3: Create an Abstract class to get factories for Normal and Rounded Shap Objects.

```java
public abstract class AbstractFactory {
   abstract Shape getShape(String shapeType) ;
}
```

<!-- Line breaks -->
<br />

Step4: Create Factory classes extending AbstractFactory to generate object of concrete class based on given information.

```java
public class ShapeFactory extends AbstractFactory {
   @Override
   public Shape getShape(String shapeType){    
      if(shapeType.equalsIgnoreCase("RECTANGLE")){
         return new Rectangle();         
      }else if(shapeType.equalsIgnoreCase("SQUARE")){
         return new Square();
      }	 
      return null;
   }
}

public class RoundedShapeFactory extends AbstractFactory {
   @Override
   public Shape getShape(String shapeType){    
      if(shapeType.equalsIgnoreCase("RECTANGLE")){
         return new RoundedRectangle();         
      }else if(shapeType.equalsIgnoreCase("SQUARE")){
         return new RoundedSquare();
      }	 
      return null;
   }
}
```

<!-- Line breaks -->
<br />

Step5: Create a Factory generator/producer class to get factories by passing an information such as Shape.

```java
public class FactoryProducer {
   public static AbstractFactory getFactory(boolean rounded){   
      if(rounded){
         return new RoundedShapeFactory();         
      }else{
         return new ShapeFactory();
      }
   }
}
```

<!-- Line breaks -->
<br />

Step6: Use the FactoryProducer to get AbstractFactory in order to get factories of concrete classes by passing an inforamtion such as type.

```java
public class AbstractFactoryPatternDemo {
   public static void main(String[] args) {
      //get shape factory
      AbstractFactory shapeFactory = FactoryProducer.getFactory(false);
      //get an object of Shape Rectangle
      Shape shape1 = shapeFactory.getShape("RECTANGLE");
      //call draw method of Shape Rectangle
      shape1.draw();
      //get an object of Shape Square 
      Shape shape2 = shapeFactory.getShape("SQUARE");
      //call draw method of Shape Square
      shape2.draw();
      //get shape factory
      AbstractFactory shapeFactory1 = FactoryProducer.getFactory(true);
      //get an object of Shape Rectangle
      Shape shape3 = shapeFactory1.getShape("RECTANGLE");
      //call draw method of Shape Rectangle
      shape3.draw();
      //get an object of Shape Square 
      Shape shape4 = shapeFactory1.getShape("SQUARE");
      //call draw method of Shape Square
      shape4.draw();
      
   }
}
```

<!-- Line breaks -->
<br />


Reference

<https://www.tutorialspoint.com/design_pattern/abstract_factory_pattern.htm>

<https://stackoverflow.com/questions/5739611/what-are-the-differences-between-abstract-factory-and-factory-design-patterns>