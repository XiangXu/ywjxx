---
layout: post
title:  Spring @Qualifier Annotation
date:   2021-06-28 17:06
image:  spring.png
tags:   [Java, Spring]
---

## Autowire Need for Disambiguation

The @Autowired annotation is a great way of making the need to inject a dependency in Spring explicit. Although it's useful, there are use cases for which this annotation isn't enough for Spring to understand which bean to inject. **By default, Spring resolves autowired entries by type**.

**If more than one bean of the same type is available in the container, the framework will throw NoUniqueBeanDefinitionException**, indicating that more than one bean is available for autowiring. 

```java
@Component("fooFormatter")
public class FooFormatter implements Formatter {
 
    public String format() {
        return "foo";
    }
}

@Component("barFormatter")
public class BarFormatter implements Formatter {
 
    public String format() {
        return "bar";
    }
}

@Component
public class FooService {
     
    @Autowired
    private Formatter formatter;
}
```

<!-- Line breaks -->
<br />

If we try to load FooService into our context, the Spring framework will throw a *NoUniqueBeanDefinitionException*. This is because **Spring doesn't know which bean to inject**. To avoid this problem, there are several solution, the @Qualifier annotaiton is one of them.

## @Qualifier Annotation

By using the @Qualifier annotation, we can **eliminate the issue of which bean needs to be injected**.

```java
public class FooService {
     
    @Autowired
    @Qualifier("fooFormatter")
    private Formatter formatter;
}
```

<!-- Line breaks -->
<br />

By including the @Qualifier annotation, together with the name of the specific implementation we want to use, in this example Foo, we can avoid ambiguity when Spring finds multiple beans of the same type.

We need to take into consideration that the qualifier name to be used is the one declared in the @Component annotation.

Note that we could have also used the @Qualifier annotation on the Formatter implementing classes, instead of specifying the names in their @Component annotations, to obtain the same effect:

```java
@Component
@Qualifier("fooFormatter")
public class FooFormatter implements Formatter {
    //...
}

@Component
@Qualifier("barFormatter")
public class BarFormatter implements Formatter {
    //...
}
```

<!-- Line breaks -->
<br />

## @Aualifier vs @Primary

There's another annotation called @Primary taht we can use to decide which bean to inject when ambiguity is present regarding dependency injection.

This annotation **defines a preference when multiple beans of the same type are present**. The bean associated with the @Primary annotation will be used unless otherwise indicated.

```java
@Configuration
public class Config {
 
    @Bean
    public Employee johnEmployee() {
        return new Employee("John");
    }
 
    @Bean
    @Primary
    public Employee tonyEmployee() {
        return new Employee("Tony");
    }
}
```

<!-- Line breaks -->
<br />

In this example, both methods return the same *Employee* type. The bean that Spring will inject is the one returned by the method *tonyEmployee*. This is because it contains the *@Primary* annotation. This annotation is useful when we want to **specify which bean of a certain type should be injected by default**.

If we arequire the other bean at some injection point, we should need to specifically inidate it. We can do taht via the *@Qualifier* annotation. For instance, we could specify that we want to use the bean returned by the *johnEmployee* method by using the *@Qualifier* annotation.

It's worth noting that if both the @Qualifier and @Primary annotations are present, then the @Qualifier annotation will have precedence. Basically, @**Primary defines a default, while @Qualifier is very specific**.

```java
@Component
@Primary
public class FooFormatter implements Formatter {
    //...
}

@Component
public class BarFormatter implements Formatter {
    //...
}
```

<!-- Line breaks -->
<br />

**In this case, the @primary annotation is placed in one of the implementing classes**, and will disambiguate the scenario.

## @Qualifier vs Autowiring by Name

Another way to decide between multiple beans when autowiring, is by using the anme of the field to inject. **This is the default in case there are no other hints for Spring**.

```java
public class FooService {
     
    @Autowired
    private Formatter fooFormatter;
}
```

<!-- Line breaks -->
<br />

In this case, Spring will determine that the bean to inject is the FooFormatter one, since the field name is matched to the value that we used in the @Component annotation for that bean.

Reference 

<https://www.baeldung.com/spring-qualifier-annotation>