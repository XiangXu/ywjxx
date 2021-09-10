---
layout: post
title:  Path Parameter vs Query Parameter in A RESTful API
date:   2021-09-09 21:51
image:  oop.jpg
tags:   [Fundation, API]
---

It is very important to konw how to use Query Parameter or URI Parameter while designing an API. **URI Parameter is basically used to identify a specific resource or resources whereas Query Parameter is used to sort/filter those resources**.

Here's an example. Suppose you are implementing RESTful API endpoints for an entity called car. You would structure your endpoints like this:

* GET /cars
* GET /cars/:id
* POST /cars
* PUT /cars/:id
* DELETE /cars/:id

This way you are only using path parameters when you are specifying which resource to fetch, but this does not sort/filter the resources in any way.

Now suppose you wanted to add the capability to filter the cars by color in your GET requests. Because color is not a resource - it is a property of a resource, you could add a query parameter does this. You would add that query parameter to your **GET /cars** request like this:

GET /cars?colour=blue

This endpoint would be implemented so that only blue cars would be returned. Some people may ask, what about /cars?id=1&color=blue instead of cars/1/?color=blue. you are basically filtering cars resource in each scenario. That is incorrect since car with id 1 only exist one but cars with color blue maybe many. There is the distinction between identity and filter

Reference

<https://stackoverflow.com/questions/30967822/when-do-i-use-path-params-vs-query-params-in-a-restful-api#>