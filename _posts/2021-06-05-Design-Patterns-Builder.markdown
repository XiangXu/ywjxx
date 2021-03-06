---
layout: post 
title:  Design Pattern - Builder Pattern
date:   2021-06-05 13:16
image:  design_pattern.jpg
tags:   Design_Pattern
---

Builder pattern aims to **Separate the construction of a complex object from its representation so that the same construction process can create different representations**. It is used to construct a complex object step by step and the final step will return the object. The process of constructing an object should be generic so that it can be used to create different representations of the same object.

* **Product** – The product class defines the type of the complex object that is to be generated by the builder pattern.
* **Builder** – This abstract base class defines all of the steps that must be taken in order to correctly create a product. Each step is generally abstract as the actual functionality of the builder is carried out in the concrete subclasses. The GetProduct method is used to return the final product. The builder class is often replaced with a simple interface.
* **ConcreteBuilder** – There may be any number of concrete builder classes inheriting from Builder. These classes contain the functionality to create a particular complex product.
* **Director** – The director class controls the algorithm that generates the final product object. A director object is instantiated and its Construct method is called. The method includes a parameter to capture the specific concrete builder object that is to be used to generate the product. The director then calls methods of the concrete builder in the correct order to generate the product object. On completion of the process, the GetProduct method of the builder object can be used to return the product.

## Lets see an Example of Builder Design Pattern:

Consider a construction of a home. Home is the final end product (object) that is to be returned as the output of the construction process. It will have many steps like basement construction, wall construction and so on roof construction. Finally the whole home object is returned. Here using the same process you can build hourses with different properties.

```java

interface HousePlan
{
    public void setBasement(String basement);
  
    public void setStructure(String structure);
  
    public void setRoof(String roof);
  
    public void setInterior(String interior);
}

class House implements HousePlan
{
    private String basement;
    private String structure;
    private String roof;
    private String interior;
  
    public void setBasement(String basement) 
    {
        this.basement = basement;
    }
  
    public void setStructure(String structure) 
    {
        this.structure = structure;
    }
  
    public void setRoof(String roof) 
    {
        this.roof = roof;
    }
  
    public void setInterior(String interior) 
    {
        this.interior = interior;
    }
  
}

interface HouseBuilder
{
    public void buildBasement();
  
    public void buildStructure();
  
    public void bulidRoof();
  
    public void buildInterior();
  
    public House getHouse();
}

class IglooHouseBuilder implements HouseBuilder
{
    private House house;
  
    public IglooHouseBuilder() 
    {
        this.house = new House();
    }
  
    public void buildBasement() 
    {
        house.setBasement("Ice Bars");
    }
  
    public void buildStructure() 
    {
        house.setStructure("Ice Blocks");
    }
  
    public void buildInterior() 
    {
        house.setInterior("Ice Carvings");
    }
  
    public void bulidRoof() 
    {
        house.setRoof("Ice Dome");
    }
  
    public House getHouse() 
    {
        return this.house;
    }
}

class TipiHouseBuilder implements HouseBuilder
{
    private House house;
  
    public TipiHouseBuilder() 
    {
        this.house = new House();
    }
  
    public void buildBasement() 
    {
        house.setBasement("Wooden Poles");
    }
  
    public void buildStructure() 
    {
        house.setStructure("Wood and Ice");
    }
  
    public void buildInterior() 
    {
        house.setInterior("Fire Wood");
    }
  
    public void bulidRoof() 
    {
        house.setRoof("Wood, caribou and seal skins");
    }
  
    public House getHouse() 
    {
        return this.house;
    }
}

class CivilEngineer 
{
  
    private HouseBuilder houseBuilder;
  
    public CivilEngineer(HouseBuilder houseBuilder)
    {
        this.houseBuilder = houseBuilder;
    }
  
    public House getHouse()
    {
        return this.houseBuilder.getHouse();
    }
  
    public void constructHouse()
    {
        this.houseBuilder.buildBasement();
        this.houseBuilder.buildStructure();
        this.houseBuilder.bulidRoof();
        this.houseBuilder.buildInterior();
    }
}
  
class Builder
{
    public static void main(String[] args)
    {
        HouseBuilder iglooBuilder = new IglooHouseBuilder();
        CivilEngineer engineer = new CivilEngineer(iglooBuilder);
  
        engineer.constructHouse();
  
        House house = engineer.getHouse();
  
        System.out.println("Builder constructed: "+ house);
    }
}
```

<!-- Line breaks -->
<br />

There is another approach to implement builder design pattern:

When a constructor method requires more than 4 parameters and some of them are optional. In this case you need to think about to use a builder.

```java
// Builder 
public class Computer {
    private String cpu;//mandatory
    private String ram;//mandatory
    private int usbCount;//optional
    private String keyboard;//optional
    private String display;//optional
}

// Without builder
public class Computer {
     ...
    public Computer(String cpu, String ram) {
        this(cpu, ram, 0);
    }
    public Computer(String cpu, String ram, int usbCount) {
        this(cpu, ram, usbCount, "Apple keyboard");
    }
    public Computer(String cpu, String ram, int usbCount, String keyboard) {
        this(cpu, ram, usbCount, keyboard, "Apple display");
    }
    public Computer(String cpu, String ram, int usbCount, String keyboard, String display) {
        this.cpu = cpu;
        this.ram = ram;
        this.usbCount = usbCount;
        this.keyboard = keyboard;
        this.display = display;
    }
}

// with builder
public class Computer {
    private String cpu;//mandatory
    private String ram;//mandatory
    private int usbCount;//optional
    private String keyboard;//optional
    private String display;//optional

    private Computer(Builder builder){
        this.cpu=builder.cpu;
        this.ram=builder.ram;
        this.usbCount=builder.usbCount;
        this.keyboard=builder.keyboard;
        this.display=builder.display;
    }
    public static class Builder{
        private String cpu;//mandatory
        private String ram;//mandatory
        private int usbCount;//optional
        private String keyboard;//optional
        private String display;//optional

        public Builder(String cup,String ram){
            this.cpu=cup;
            this.ram=ram;
        }

        public Builder setUsbCount(int usbCount) {
            this.usbCount = usbCount;
            return this;
        }
        public Builder setKeyboard(String keyboard) {
            this.keyboard = keyboard;
            return this;
        }
        public Builder setDisplay(String display) {
            this.display = display;
            return this;
        }        
        public Computer build(){
            return new Computer(this);
        }
    }
}

Computer computer=new Computer.Builder("Intel","Apple")
                .setDisplay("Apple display")
                .setKeyboard("Apple keyboard")
                .setUsbCount(2)
                .build();
```

<!-- Line breaks -->
<br />

Advantages of Builder Design Pattern:

* The parameters to the constructor are reduced and are provided in highly readable method calls.
* Builder design pattern also helps in minimizing the number of parameters in constructor and thus there is no need to pass in null for optional parameters to the constructor.
* Object is always instantiated in a complete state.
* Immutable objects can be build without much complex logic in object building process.

Disadvantages of Builder Design Pattern:

* The number of lines of code increase at least to double in builder pattern, but the effort pays off in terms of design flexibility and much more readable code.
* Requires creating a separate ConcreteBuilder for each different type of Product.

## Reference

<https://www.geeksforgeeks.org/builder-design-pattern/>