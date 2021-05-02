---
layout: post
title:  Best practices for building secure API Keys
date:   2021-05-01 23:01
image:  oop.jpg
tags:   [Fundation, API]
---

We all know how valuable APIs are. They're the gateway to exploring other services, integrating with them, and building great solutions faster.

You might have built or are thinking of building APIs for other developers to use. An API needs some form of authentication to provide authorised access to the data it returns.

There are several authentication standards availabe today suck as API Keys, OAuth, JWT, etc.

## So Why API Keys?

API Keys are simple to use, they're short, static, and don't expire unless revoked. They provide an easy way for multiple services to communicate.

If you provide an API for your clients to consume, it's essential for you to build it in the right way.

## API Key Generation

Since the API key itself is an identity by which to identify the application or the user, it needs to be unique, random and non-guessable. API keys that are generated must also use Alphanumeric and special characters. An example of such an API key is `zaCELgL.0imfnc8mVLWwsAawjYr4Rx-Af50DDqtlx`.

## Secure API Key Storage

Since the API key provides direct access to data, it's pretty much like a password that a user of a web or mobile app provides to gain access to the same data.

Think about it. The reason we need to store API keys is to make sure that the API key is the request is valid and issued by us (just like a pasword).

We don't need to know the raw API key, but just need to validate that the key is correct. So instead of storing the key in plain text(bad) or encrypting it, **we should store it as a hashed value within our database**.

A hashed value means that even if someone gains unauthorised access to our database, no API keys are leaked and it's all safe. The ned user would send the raw API key in each API request, and we can validate it by hashing the API key in the request and compare the hashed key with the hash stored within our database. Here is a rough implementation of it in Java:

In the code above, the primary key will be a combination of the prefix and the hash of the API key `{prefix}.{hash_of_whole_api_key}`.

But hold on, there is more. Storing a hashed value brings specific usability problems. Let's address those now.

## Presenting the API Key to users

Since we don't store the original API key, we can show it only once to the user, at the time of creation. So be sure to alert users that it cannot be retrived again, and they need to generate a new token if they forget to get copy the API key and store it safetly.

## How users can identify a generated API Key later

Another problem is how users identify the right API key in your console if they need to edit or revoke it. This can be solved by adding a prefix to the API key. Notice in the picture above the first 7 characters separated by the dot.

Now you can store this prefix in the database and display it in the console so users are able to quickly identify the right API key entry.

## Don't give the API key all the power

**One common mistake that API key providers make is providing one key to access everything**, since it's easy to manage. Don't do that. Assume that a user just needs to read an email, and generates an API key. But that key now has full access to other services, including deleting recoreds in the database.

The right approach is to allow the end users to properly restrict API key access and choose specific actions that an API key can carry out. This can be done by providing scopes, where scope represents a specific permission.

For example,

* if you need an API key to just send emails, you can generate an API key with the scope as "email.send".
* if the end user has multiple servers and each carries out a specific action, then a separate API key can be generated with a specific scope.

## Rate limiting API keys

Yes, you might already know it, but it is important to rate limit requests made with specific API Keys to ensure no bad actor can take down your API servers or cause performance issues that affect your other customers. Having a proper rate limiting and monitoring solution keeps the API service healthy.


Reference

https://www.freecodecamp.org/news/best-practices-for-building-api-keys-97c26eabfea9/