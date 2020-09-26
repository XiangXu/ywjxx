---
layout: post
title:  HTTP Methods
date:   2020-09-21 22:40
image:  computer_network.jpg
tags:   [Fundation, Network]
---

## What is Http?

The Hypertext Transfer Protocol (HTTP) is designed to enable communcations between clients and servers.

HTTP works as a request-response protocol between client and server.

Every URL link that begins with HTTP use a basic type of "hypertext transfer protocol". This network protocol standard is what allows web browser and server communicate through the exchange data.

## HTTP Methods:

* GET
* POST
* PUT
* HEAD
* DELETE
* PATCH
* OPTIONS

### The GET Method

**GET is used to request data from a specified source**. The query(name/value) is sent in URL. 

```
test/demo_form.php?name1=value1&name2=value2
```

Some notes on GET requests:

* GET requests can be cached.
* GET requests reamin in browser history.
* GET requests can be bookmarked.
* GET requests should never be used when deal with sensitive data.
* GET requests have length restrictions.
* GET requests are only used to request data (not modify).

### The POST Method:

**POST is used to send data to server to create/update a resource**. POST can be used to create/update when you known the URL of the "factory" or manager for the category of things you want to create.

```
POST /expense-report
```

<!-- Line breaks -->
<br />
Sending the same post packet twice will create two resources.

### The PUT Method

**PUT is used to create/update a resource in its entirety at the client defined URL**. PUT creates/updates the resource at the **known URL if it already exists**, so sending the same request twice has no effect. In other word, **calls to PUT are idempotent**.

```
PUT  /expense-report/10929
```

<!-- Line breaks -->
<br />

### The PATCH Method

**PATCH is used to update part of the resource at the client defined URL**.

### Some nots of POST/PUT/PATCH requests:

* POST/PUT/PATC requests are never cached.
* POST/PUT/PATC requests do not remain in the browser history.
* POST/PUT/PATC requests cannot be cached.
* POST/PUT/PATC requests have no restrictions on data length.

When to use PUT and POST Http methods in RESTFul web service, **use POST to create a resource and use PUT to update the resource**. It is not mandatory, but this seems more logical unless you can forsee any issue which completely changes the option.

### The HEAD Method

**HEAD is almost identical to GET, but without response body**. In other words, if GET /users returns a list of users, then HEAD /users will make the same request but will not return the list of users.

HEAD requests are useful for checking what a GET request will return before actually making a GET request - like before downloading a large file or response body.

### The DELETE Method

The DELETE method deletes the specified resource.

## The OPTION Method

The OPTION method describes the communication options for the target resource.

More to read:

<https://www.cnblogs.com/logsharing/p/8448446.html>

Reference

<https://www.w3schools.com/tags/ref_httpmethods.asp>



