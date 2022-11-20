---
layout: post
title:  Mapped Diagnostic Context(MDC)
date:   2022-11-20 22:07
image:  spring.png
tags:   [Java, Spring]
---

One of the design goals of logback is to audit and debug complex distributed applications. Most real-world distributed systems need to deal with multiple clients simultaneously. In a typical multithreaded implementation of such a system, different threads will handle different clients. A possible but slightly discouraged approach to differentiate the logging output of one client from another consists of instantiating a new and separate logger for each client. This technique promotes the proliferation of loggers and may increase their management overhead.

**A Mapped Diagnostic Context, or MDC in short, is an instrument for distinguishing interleaved log output from different sources. Log output is typically interleaved when a server handles multiple clients near-simultaneously.**

## 1. Stamping Requests with MDC

MDC is used to stamp each request. It is done by **putting the contextual information about the rquest into MDC**.

MDC class contain the following static methods:

* void put(String key, String val): puts a context value as identified by key into the current thread’s context map. We can place as many value/key associations in the MDC as needed.
String get(String key): gets the context value identified by the key parameter.
* void remove(String key): removes the context value identified by the key parameter.
* void clear(): clears all entries in the MDC.

A sample example of stamping the requests with MDC API is:
```java
MDC.put("sessionId", "abcd");
MDC.put("userId", "1234")
```

<!-- Line breaks -->
<br />

## 2. Printing MDC Values in Logs

To print the contet information in the logs, we can **use MDC keys in the log pattern** String.

For referring to the MDC context keys, we use the %X specifier that is used to print the current thread’s Nested Diagnostic Context (NDC) and/or Mapped Diagnostic Context (MDC).

* Use %X to include the full contents of the Map.
* Use %X{key} to include the specified key.
* Use %x to include the full contents of the Stack.

For example, we can refer the userId and the sessionId keys created in the first section, as follows. During application runtime, MDC information will be appended to every log message using the given appended.

```xml
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender"> 
  <layout>
    <Pattern>%d{DATE} %p %X{sessionId} %X{userId} %c - %m%n</Pattern>
  </layout> 
</appender>
```

<!-- Line breaks -->
<br />

## 3. Adding MDC using Server Filter

**Putting MDC context inforamtion arbitarily in serveral places in application is not a good idea**. It can be hard to maintain such code.

Due to **MDC being thread-local in nature**, we can use the servlet filters as a good place to add MDC logging because Servlet use a single thread to process the whole request. In this way, we can be sure that MCD information is not mixing up with other requests handled by the same handler/controller.

Handling it using framework provided servlet filter also frees us from thread-safety or synchronization concerns because frameworks handle these issues safely and transparently.

Servlet containers are thread per request. When an HTTP request is made, a thread is created or retrieved from a pool to serve it.So, **DO NOT forget to clear the MDC context after the request processing is complete, otherwise when the same thread serves another request next time, they MDC information will be stale and can create wrong log entries**.

```java
import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import org.slf4j.MDC;
 
//To convert to a Spring Boot Filter 
//Uncomment @Component and Comment our @WebFilter annotation
//@Component 
@WebFilter( filterName = "mdcFilter", urlPatterns = { "/*" } )
public class MDCFilter implements Filter {
 
    @Override
    public void destroy() {
    }
 
    @Override
    public void doFilter( final ServletRequest request, 
    			final ServletResponse response, final FilterChain chain )
        throws IOException, ServletException {
 
        MDC.put( "sessionId", request.getParameter("traceId") );
 
        try {
            chain.doFilter( request, response );
        } finally {
            MDC.clear();
        }
    }
 
    @Override
    public void init( final FilterConfig filterConfig ) 
    	throws ServletException {
    }
}
```

<!-- Line breaks -->
<br />

## 4. MDC with Logging Framework

### 4.1 MDC with Log4J2

Log4j2 supports both, the MDC and the NDC, but merges them into a single class ThreadContext. The Thread Context Map is the equivalent of the MDC and the Thread Context Stack is the equivalent of the NDC.

To enable automatic inheritance of copies of the MDC to newly created child threads, enable the “isThreadContextMapInheritable” Log4j system property.

An example of Log4j2 ThreadContext.

```java
import org.apache.logging.log4j.ThreadContext;

//Add information in context
ThreadContext.put("id", UUID.randomUUID().toString());
ThreadContext.put("ipAddress", request.getRemoteAddr());

//To clear context
ThreadContext.clear();
```

<!-- Line breaks -->
<br />

To print the context values, we can use the %X based pattern layout as discussed in the section printing MDC values.

### 4.2 MDC with SLF4J, Logback and Log4j

MDC with SLF4J is dependent on MDC support by the underlying logging library. If the underlying library does not support MDC then all the MDC-related statements will be skipped without any side effects.

Note that at this time, only two logging systems, namely log4j and logback, offer MDC functionality. For java.util.logging which does not support MDC, BasicMDCAdapter will be used. For other systems, NOPMDCAdapter will be used.

MDC is supported by the above frameworks in the following classes:

* org.slf4j.MDC (SLF4J and Logback)
* org.apache.log4j.MDC (Log4j)

An example of SLF4J MDC.

```java
import org.slf4j.MDC;

//Add information in context
MDC.put("id", UUID.randomUUID().toString());
MDC.put("ipAddress", request.getRemoteAddr());

//To clear context
MDC.clear();
```
Printing the context values, we need to use the %X based pattern layout as discussed previously.

<!-- Line breaks -->
<br />

Reference

<https://howtodoinjava.com/logback/logging-with-mapped-diagnostic-context/>