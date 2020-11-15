---
layout: post
title:  Spring Profile
date:   2020-11-15 21:21
image:  spring.png
tags:   [Java, Spring]
---

**Spring profiles allow us to map our bean to different profiles** - for example, dev, test and prod.

## Use @Profile on a Bean

If we have a bean that should only be active during development, but not deployed in production.

<!-- Line breaks -->
<br />

```java
@Component
@Profile("dev")
public class DevDatasourceConfig{}

// Exclude example
@Component
@Profile("!dev")
public class DevDatasourceConfig{}
```

```xml
<beans profile="dev">
    <bean id="devDatasourceConfig"
      class="org.baeldung.profiles.DevDatasourceConfig" />
</beans>
```

<!-- Line breaks -->
<br />

## Set Profiles

Any Bean does not specify a profile belongs to "default" profile. **spring.profile.default** can be used to set the default profile.

### Programmatically via WebApplicationInitializer

WebApplicationInitializer can be used to configure the ServletContext programmatically.

```java
@Configuration
public class MyWebApplicationInitializer implements WebApplicationInitializer {
 
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
  
        servletContext.setInitParameter(
          "spring.profiles.active", "dev");
        }
}
```

<!-- Line breaks -->
<br />

### Programmatically via ConfigurableEnvironment

```java
@Autowired
private ConfigurableEnvironment env;
...
env.setActiveProfiles("someProfile");
```

<!-- Line breaks -->
<br />

### Context Paramter in web.xml

```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/app-config.xml</param-value>
</context-param>
<context-param>
    <param-name>spring.profiles.active</param-name>
    <param-value>dev</param-value>
</context-param>
```

<!-- Line breaks -->
<br />

### JVM System Paramter

```
-Dspring.profiles.active=dev
```

<!-- Line breaks -->
<br />

### Unix Environment

```
export spring_profiles_active=dev
```

<!-- Line breaks -->
<br />

### Maven Profile

```xml
<profiles>
    <profile>
        <id>dev</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <properties>
            <spring.profiles.active>dev</spring.profiles.active>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <spring.profiles.active>prod</spring.profiles.active>
        </properties>
    </profile>
</profiles>
```

<!-- Line breaks -->
<br />


Its value will be used to replace the @spring.profiles.active placeholder in application.properties:

```
spring.profiles.active=@spring.profiles.active
```

<!-- Line breaks -->
<br />

And append a -P parameter to switch which Maven profile will be applied:

```
mvn clean package -Pprod
```

<!-- Line breaks -->
<br />

## @ActiveProfile in Tests

```
@ActiveProfiles("dev")
```

<!-- Line breaks -->
<br />


## Profile in Spring Boot

Spring Boot supports all the profile configuration outlined so far, with a few additional features.

The initialization parameter spring.profiles.active, introduced in Section 4, can also be set up as a property in Spring Boot to define currently active profiles. This is a standard property that Spring Boot will pick up automatically:

```
spring.profiles.active=dev
```

<!-- Line breaks -->
<br />


To set profiles programmatically, we can also use the SpringApplication class:

```
SpringApplication.setAdditionalProfiles("dev");
```

<!-- Line breaks -->
<br />


To set profiles using Maven in Spring Boot, we can specify profile names under spring-boot-maven-plugin in pom.xml:

```xml
<plugins>
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <configuration>
            <profiles>
                <profile>dev</profile>
            </profiles>
        </configuration>
    </plugin>
    ...
</plugins>
```

<!-- Line breaks -->
<br />

and execute the Spring Boot-specific Maven goal:

```
mvn spring-boot:run
```

<!-- Line breaks -->
<br />

But the most important profiles-related feature that Spring Boot brings is profile-specific properties files. These have to be named in the format application-{profile}.properties.

Spring Boot will automatically load the properties in an application.properties file for all profiles, and the ones in profile-specific .properties files only for the specified profile.

For example, we can configure different data sources for dev and production profiles by using two files named application-dev.properties and application-production.properties:

In the application-production.properties file, we can set up a MySql data source:

```
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/db
spring.datasource.username=root
spring.datasource.password=root
```

<!-- Line breaks -->
<br />

Then we can configure the same properties for the dev profile in the application-dev.properties file, to use an in-memory H2 database:

```
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.url=jdbc:h2:mem:db;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=sa
```

<!-- Line breaks -->
<br />

In this way, we can easily provide different configurations for different environments.


Reference

<https://www.baeldung.com/spring-profiles>




