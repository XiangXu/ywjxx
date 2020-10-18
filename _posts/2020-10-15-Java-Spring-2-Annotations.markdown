---
layout: post
title:  Spring Bean Annotations
date:   2020-10-15 21:21
image:  spring.png
tags:   [Java, Spring]
---

## @ComponentScan

@ComponentScan configures which **packages to scan for classes with annotation configuration**.

```java
@Configuration
@ComponentScan(basePackages = "com.baeldung.annotations")
class VehicleFactoryConfig {}
```

<!-- Line breaks -->
<br />

We can also point to classes in the base packages with the **basePackageClasses** arguments:

```java
@Configuration
@ComponentScan(bbasePackageClasses = VehicleFactoryConfig.class)
class VehicleFactoryConfig {}
```

<!-- Line breaks -->
<br />


Both arguments are arrays so that we can provide multiple packages for each.

If no argument is specified, the scanning happens from the same package where the @ComponentScan annotated class is present. 

## @Component

Component is a class level annotation. During the component scan, **Spring Framework automatically detects classes annotated with @Component**.

```java
@Component
class CarUtility {
    // ...
}
```

<!-- Line breaks -->
<br />


@Repository, @Service, @Configuration and @Controller are all meta-annotation of @Component.

## @Repository

**DAO or Repository classes usually represent the database access layer in application, and should be annotated with @Repository**.

```java
@Repository
class VehicleRepository {
    // ...
}
```

<!-- Line breaks -->
<br />

**It has automatically persistence exception translation enabled. Spring wraps all those exceptions and then wraps them into DataAccessException class**. When you want to switch to different persistence technology, you don't have to worry about refactoring your code.

## @Service

The **business logic** of application usually resides within the service layer.

```java
@Service
public class VehicleService {
    // ...    
}
```

<!-- Line breaks -->
<br />

## @Controller

@Controller is a class level annotation which tells the Spring Framework that this class serves as controller in Spring MVC.

```java
@Controller
public class VehicleController {
    // ...
}
```

<!-- Line breaks -->
<br />


## @Configuration

@Configuration classes can **contain bean definition methods** annotated with @Bean.

```java
@Configuration
class VehicleFactoryConfig {
 
    @Bean
    Engine engine() {
        return new Engine();
    }
 
}
```

<!-- Line breaks -->
<br />

Reference

<https://www.baeldung.com/spring-bean-annotations>

<https://stackoverflow.com/questions/32186035/spring-dao-repository-exception-handling>

