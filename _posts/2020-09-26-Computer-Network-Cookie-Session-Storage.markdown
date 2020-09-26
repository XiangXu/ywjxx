---
layout: post
title:  Cookie vs Session vs LocalStorage vs SessionStorage
date:   2020-09-26 12:02
image:  computer_network.jpg
tags:   [Fundation, Computer Network]
---

## Stateless Applications

Web application servers are generally "stateless"

* Each HTTP Request is independent, server cannot tell if two requests came from the same browser or user.
* Web server applications maintian no information in memory from request to request.
* Stateless not always convenient for application developers. Sometimes we need to tie together a series of requests from the same user.

## Cookie

**Cookies are name-value pair messages that web servers pass to you web browser when you visit websites**. Common uses of cookies are authentication, storing of site perference, shopping cart item, and server session identification.

* The first time a browser connects with a particular server, there are no cookies.
* When the server responses it includes a **Set-Cookie**: header that defines a cookie.
* In the future whenever the browser connects with the same server, it includes a **Cookie**: header containing the name and value, which the server can use to connect related requests. 
* Data size limited by browser, typically less than 4kB.
* A server can define multiple cookies with different names, but browsers limit the number of cookies per server - normally around 50.
* Domain of this cookie - server, port(optional), URL Prefix(optional). The cookie is only included the requests matching its domain.
* Expiration data - browser can delete old cookies. 
* Cookies are primarily for server-side reading, can also be read on client - side. 
* Cookies are considered **highly insecure** because the user can easily manipulate their content, that is why you should **always validate cookie data**.
* Cookies can be made more secure by setting the **httpOnly flag as true for that cookie**, this prevents client-side access to that cookie.

## Session

* A session is a global variable stored on the server.
* Each session is assigned an unique id which is used to retrive stored values. 
* Whenever a session is created, a cookie containing the unique id is stored on the user's computer and returned with every request to the server. If the client browser doesn't not support cookies, the unique id is displayed in the URL. 
* Session have capacity to store relatively large data compared to cookie. 
* The session values are automatically deleted when the browser is closed. If you want to store the value permanently, then you should store them in database. 

## Local Storage

* Store data with no expireation date and gets cleared only through Javascript, or clearing the browser / locally stored data. 
* Storage limit is the maximum amongest(10MB per origin in Google Chrome, Mozilla, Firefox, Internet Explorer and Opera).
* Data is never transferred to server.

## Session Storage

* The session storage object stores data only for a session, meanting that the data is stored until the browser or tab is closed.
* Storage limit is larger than a cookie.
* Data nenver transferred to server.

Reference

<https://www.jianshu.com/p/25802021be63>

<https://web.stanford.edu/~ouster/cgi-bin/cs142-fall10/lecture.php?topic=cookie>

<https://www.guru99.com/cookies-and-sessions.html>
