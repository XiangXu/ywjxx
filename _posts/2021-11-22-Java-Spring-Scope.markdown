---
layout: post
title:  Spring Bean Scope
date:   2022-11-22 22:33
image:  spring.png
tags:   [Java, Spring]
---

The latest version of the Spring framework defines 6 types of scopes:

* singleton
* prototype
* request
* session
* application
* webscoket

The last four scopes mentioned, request, session, application and websocket, are only available in a web-aware application.

## Singleton Scope

When we define a bean with *singleton* scope, the container creates a single instance of that bean. all requests for that bean will return then same object, which is cached. A**ny modifications to the object will be reflected in all reference to the bean**. This scope is the default value if no other scope is specified.

## Prototype Scope

A bean with *prototype scope* will return a different instance every time it is requested from the container. We can use a constant to define: `@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)`.

## Web Aware Scope

The *request scope* creates a bean instance for a single HTTP request, while the *session scope* creates a bean instance for an HTTP session.

The *applicaiton scope* creates the bean instance for the lifecycle of a ServletContext and the *websocket* scope creates it for a particular WebSocket session.

Reference

<https://www.baeldung.com/spring-bean-scopes>