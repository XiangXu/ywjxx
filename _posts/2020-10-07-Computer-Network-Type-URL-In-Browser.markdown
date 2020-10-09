---
layout: post
title:  What happens when you type a URL in the browser and press enter?
date:   2020-10-09 21:36
image:  computer_network.jpg
tags:   [Fundation, Network]
---

### 1. You type www.google.com into the address bar of your browser.

### 2. The browser checks the cache for DNS record to find the corresponding IP Address of www.google.com.

**DNS(Domain Name System) is a database that maintans the name of the website(URL) and the particular IP address it links to**. Every single URL on the Internet has an unique IP Address assigned to it. The IP address belows to the computer which hosts the server of the website we are requesting to access. For example, www.google.com has an IP address of 209.85.227.104. So if you’d like, you can reach www.google.com by typing http://209.85.227.104 on your browser. DNS is a list of URLs, and their IP addresses, like how a phone book is a list of names and their corresponding phone numbers.

The primary purpose of DNS is human-friendly navigation. You can easily access a website by typing the correct IP address for it on your browser, but imagine having to remember different sets of numbers for all the sites we regularly access? Therefore, it is easier to rember the name of website using a URL and let DNS do the work for us mapping it to the correct    IP.

The find DNS record, the browser checks four caches:

1. First, it checks the browser cache. The browser maintains a repository of DNS records for a fixed duration for websites you have previously visited. So, it is the first place to run a DNS query.

2. Second, the browser checks the OS cache. If it is not in browser cache, the browser will make a system call to your underlying computer OS to fetch the record since the OS also maintains a cache of DNS records.

3. Third, it checks the router cache. If it's not on your computer, the browser will communicate with the router that maintain it's own cache of DNS records.

4. Fourth, it checks the ISP(Internet Service Provider) cache. If all steps fail, the browser will move on to the ISP. Your ISP maintains its own DNS server, which includes a cache of DNS records, which the browser would check with the last hope of finding your requested URL.

You may wonder why there are so many caches maintained at so many levels. Although our information being cached somewhere doesn’t make us feel very comfortable when it comes to privacy, caches are essential for regulating network traffic and improving data transfer times.

### 3. If the requested URL is not in the cache, ISP's DNS server initiates a DNS query to find the IP address of the server that hosts www.google.com.

As mentioned earlier, for my computer to connect with the server that hosts www.google.com, I need the IP address of www.google.ie. The purpose of a DNS query is to search multiple DNS serves on the Internet until it finds the correct IP address for the website. This type of search is called a recursive search since the search will repeatedly continue from a DNS server to a DNS server until it either finds the IP address we need or returns an error response saying it was unable to find it.

In this situation, we would call the ISP’s DNS server a DNS recursor whose responsibility is to find the proper IP address of the intended domain name by asking other DNS servers on the internet for an answer. The other DNS servers are called name servers since they perform a DNS search based on the domain architecture of the website domain name.

![alt text](https://miro.medium.com/max/1400/0*udK6jZ3PjlhjqW8U.png)

Many website URLs we encounter today contain a third-level domain, a second-level domain, and a top-level domain. Each of these levels contains their own name server, which is queried during the DNS lookup process.

For www.google.ie, first, the recursor will contact the root name server. The root name server will redirect it to the **.com** domain name server. **.com** name server will redirect it to the **google.com** name server. The **google.com** name server will find the matching IP address for www.google.ie in it's DNS records and return it to your DNS recursor, which will send it back to your browser. 

These requests are sent using small data packets that contain information such as the content of the request and the IP address it is destined for (IP address of the DNS recursor). These packets travel through multiple networking equipment between the client and the server before it reaches the correct DNS server. This equipment use routing tables to figure out which way is the fastest possible way for the packet to reach its’ destination. If these packets get lost, you’ll get a request failed error. Otherwise, they will reach the correct DNS server, grab the correct IP address, and come back to your browser.

### 4. The browser initiates a TCP connection with the server.

Once the browser receives the correct IP address, it will build a connection with the server that matches the IP address to transfer indormation. Browsers use Internet protocols to build such connections. There are several different Internet protocols that can be used, but TCP is the most common protocol used for many types of HTTP requests. 

To transfer data packets between your computer and the server, it is important to have a TCP connection established. This connect is established using a process called the **TCP/IP three-way handshake**.

You can find more details about TCP/IP three-way handshake here: <https://juejin.im/post/5d9c284b518825095879e7a5>

### 5. The browser sends an an HTTP request to the webserver

Once the TCP connection is established, it is time to start transferring data! The browser will send GET request asking for www.google.com web page. If you're entering credentails or submitting a form, this could be a POST request. This request also contain additional information such as browser identification(User-Agent header), types of requests that it will accept(Accept header), and connection headers asking it to keep the TCP connection alive for additional requests. It wil also pass information taken from cookies the browser has in store for this domain.

### 6. The server handles the requests and sends back a response.

The server contains a webserver that receives the request from the browser and passes it to a request handler to read and generate a response. The request handler is a program that reads the request, it's headers, and cookies to chek what is being requested and also update the information on the server if needed. Then it will assemble a response in a particular format.

### 7. The server sends out an HTTP response.

The server response contains the web page you rquested as well as the status code, compression type, how to cache the page, any cookies to set, privacy information, etc.

The first line in fresponse shows a status code, this is quite important as it tells us the status of the response. There are five types of statuses detailed using a numerical code.

* 1xx indicates an informational message only.
* 2xx indicates success of some kind.
* 3xx redirects the client to another URL.
* 4xx indicates an error on the client's part.
* 5xx indicates an error on ther server's part.

### 8. The browser displays the HTML content (for HTML responses, which is the most common).

The browser diaplays the HTML content in phases. First, it will render the bare bone HTML skeleton. Then it will check the HTML tags and send out GET requests for additional elements on the web page, such as images, CSS stylesheets, JavaScript files, etc. These static files are cached by the browser, so it doesn't have to fetch them again the next time you visit the page. In the end, you'll see www.google.com appearing on you browser.

Reference

<https://medium.com/@maneesha.wijesinghe1/what-happens-when-you-type-an-url-in-the-browser-and-press-enter-bb0aa2449c1a>
