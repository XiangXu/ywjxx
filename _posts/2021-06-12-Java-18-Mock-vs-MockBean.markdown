---
layout: post 
title:  Mock vs Mock Bean
date:   2021-06-12 11:03
image:  java.jpeg
tags:   Java, Mock
---

## Mockito.mock()

The `Mockito.mock()` method allows us to create a mock object of a class or an interface. Then, we ca use the mock to stub return values for its methods and verify if they were called.

Let's look at an example:

```java
@Test
public void givenCountMethodMocked_WhenCountInvoked_ThenMockedValueReturned() {
    UserRepository localMockRepository = Mockito.mock(UserRepository.class);
    Mockito.when(localMockRepository.count()).thenReturn(111L);

    long userCount = localMockRepository.count();

    Assert.assertEquals(111L, userCount);
    Mockito.verify(localMockRepository).count();
}
```

<!-- Line breaks -->
<br />

This method doesn't need anything else to be done before it can be used. We can use it to create mock class fields as well as local mocks in a method.

## Mockito's @Mock Annotation

This annotation is a shorthand for Mockito.mock() method. As well, we should only use it in a test class. Unlike the `mock()` method, we need to enable Mockito annotations to use this annotation.

We can do this either by using the `MockitoJUnitRunner` to run the test or calling the `MockitoAnnotations.initMocks()` method explicitly.

Let's look at an example using `MockitoJUnitRunner`.

```java
@RunWith(MockitoJUnitRunner.class)
public class MockAnnotationUnitTest {
    
    @Mock
    UserRepository mockRepository;
    
    @Test
    public void givenCountMethodMocked_WhenCountInvoked_ThenMockValueReturned() {
        Mockito.when(mockRepository.count()).thenReturn(123L);

        long userCount = mockRepository.count();

        Assert.assertEquals(123L, userCount);
        Mockito.verify(mockRepository).count();
    }
}
```

<!-- Line breaks -->
<br />

Apart from making the code more readable, **@Mock makes it easier to find the problem mock in case of a failure, as the name of the field apears in the failure message**

```
Wanted but not invoked:
mockRepository.count();
-> at org.baeldung.MockAnnotationTest.testMockAnnotation(MockAnnotationTest.java:22)
Actually, there were zero interactions with this mock.

  at org.baeldung.MockAnnotationTest.testMockAnnotation(MockAnnotationTest.java:22)
```

<!-- Line breaks -->
<br />

Also, when used in conjunction with `@InjectMock`, it can reduce the amount of setup code significantly.

* **@Mock** creates a mock implementation for the classes you need.
* **@InjectMock** creates a instance of class and injects the mocks that are marked with the annotation @Mock into it.

**Note that @InjectMock are about to be deprecated** <https://github.com/mockito/mockito/issues/1518>

**You Should Not Use InjectMocks Annotation to Autowire Fields** <https://tedvinke.wordpress.com/2014/02/13/mockito-why-you-should-not-use-injectmocks-annotation-to-autowire-fields/>

## Spring Boot's @MockBean Annotation

We can use the `@MockBean` to add mock objects to the Spring applicaiton context. The mock will replace any existing bean of the same type in the application context.

If no bean of the same type is defined, a new one will be added. This annotation is useful in integration tests where a particular bean - for example, an external service - needs to be mocked.

To use this annotation, we have to use **SpringRunner** to run the test:

```java
@RunWith(SpringRunner.class)
public class MockBeanAnnotationIntegrationTest {
    
    @MockBean
    UserRepository mockRepository;
    
    @Autowired
    ApplicationContext context;
    
    @Test
    public void givenCountMethodMocked_WhenCountInvoked_ThenMockValueReturned() {
        Mockito.when(mockRepository.count()).thenReturn(123L);

        UserRepository userRepoFromContext = context.getBean(UserRepository.class);
        long userCount = userRepoFromContext.count();

        Assert.assertEquals(123L, userCount);
        Mockito.verify(mockRepository).count();
    }
}
```

<!-- Line breaks -->
<br />

When we use the annotation on a field, as well as being registered in the application context the mock will also be injected into the field. This is evident in the code above. Here, we have used the injected UserRepository mock to stub the count method. We have then used the bean from the application context to verify that it is indeed the mocked bean.

Reference

<https://www.baeldung.com/java-spring-mockito-mock-mockbean>

