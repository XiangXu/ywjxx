---
layout: post
title:  FactoryBean
date:   2020-09-30 20:48
image:  spring.jpg
tags:   [Java, Spring]
---

**A FactoryBean is a pattern to encapsulate interesting object construction logic in a class**. It might be used, for example, to encode the construction of a complex object graph in a reusable way. **Often this is used to construct complex objects that have many dependencies**. It might also be used when the construction logic itself is highly volatile and depends on the configuration.

**A FactoryBean is also useful to help String construct object that it couldn't easily construct itself**. For example, in order to inject a reference to a bean that was obtained from JNDI(Java Naming Directory Interface), the reference must first be obtained. You can use the JndiFactoryBean to obtain this reference in a consistent way. You may inject the result of a FactoryBean's getObject() method into any other property.

Suppose you have a **CalendarFactory** class whose definition is thus:

```java
package com.xiang.util;

import org.springframework.beans.factory.FactoryBean;
import java.util.Calendar;

public class CalendarFactory implements FactoryBean<Calendar>
{
    private final Calendar instance = Calendar.getInstance();
    
    @Override
    public Calendar getObject() {
        return instance;
    }

    @Override
    public Class<?> getObjectType() {
        return Calendar.class;
    }

    // Default is false
    @Override
    public boolean isSingleton() {
        return false;
    }

    public void addDays(int num) {
        instance.add(Calendar.DAY_OF_YEAR, num);
    }
}
```

<!-- Line breaks -->
<br />

In this example, the result of FactoryBean's **getObject** method will be passed, not the actual FactoryBean itself. Spring knows that the result can be injected into the target property because it will consult the FactoryBean's **getObjectType()** return value to determine the type of factorid object, and then it will check whether that type can be injected into the injection site. Spring reserves - but in practice doesn’t always exercise - the right to cache the returned bean if the FactoryBean’s isSingleton() method returns true.

```java
import com.xiang.util.CalendarFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.util.Calendar;

@Configuration
@ComponentScan({"com.xiang"})
public class AppConfig
{
    public CalendarFactory calendarFactory()
    {
        System.out.println("call calendarFactory");
        CalendarFactory factory = new CalendarFactory();
        factory.addDays(2);
        return factory;
    }

    @Bean
    public Calendar calendar() throws Exception
    {
        System.out.println("call calendar");
        return calendarFactory().getObject();
    }
}
```

<!-- Line breaks -->
<br />

Please notice that you must reference the **FactoryBean** explicitly in Java configuration and call **getObject()** yourself like above.

```java
package com.xiang.repository;

import com.xiang.model.Speaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

@Repository("speakerRepository")
@Profile("dev")
public class HibernateSpeakerRepositoryImpl implements SpeakerRepository
{
    @Autowired
    private Calendar calendar;

    @Value("#{ T(java.lang.Math).random() * 100 }")
    private double seedNum;

    public List<Speaker> findAll()
    {
        List<Speaker> speakers = new ArrayList<>();

        Speaker speaker = new Speaker();
        speaker.setFirstName("Xiang");
        speaker.setLastName("Xu");
        speaker.setSeedNum(seedNum);

        System.out.println("calendar" + calendar.getTime());

        speakers.add(speaker);

        return speakers;
    }
}
```

<!-- Line breaks -->
<br />

One important takeaway here is that **it is the FactoryBean, not the factoried object itself, that lives in the Spring container and enjoys the lifecycle hooks and container services**. The returned instance is transient - Spring knows nothing about what you’ve returned from getObject() , and will make no attempt to exercise any lifecycle hooks or anything else on it.

Reference

<https://spring.io/blog/2011/08/09/what-s-a-factorybean>