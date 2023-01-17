---
layout: post
title:  ID Token 
date:   2023-01-07 17:43
image:  computer_network.jpg
tags:   [Fundation, OAuth]
---

## What is an ID Token?

An ID token is an artifact that proves that **the user has been authenticated**. It was introduced by OpenID Connect(OIDC).

A user with their browser authenticates against an OpenID provider and gets access to a web application. The result of that authentication process based on OpenID Connect is the ID token, which is passed to the application as proof that the user has been authenticated. 

An ID Token is **encoded as a JSON Web Token(JWT)**.

```json
An example of ID token looks like this:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbXktZG9tYWluLmF1dGgwLmNvbSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsImF1ZCI6IjEyMzRhYmNkZWYiLCJleHAiOjEzMTEyODE5NzAsImlhdCI6MTMxMTI4MDk3MCwibmFtZSI6IkphbmUgRG9lIiwiZ2l2ZW5fbmFtZSI6IkphbmUiLCJmYW1pbHlfbmFtZSI6IkRvZSJ9.bql-jxlG9B_bielkqOnjTY9Di9FillFb6IMQINXoYsw

The relevant information carried by the ID token above looks like the following:
{ 
  "iss": "http://my-domain.auth0.com", 
  "sub": "auth0|123456", 
  "aud": "1234abcdef", 
  "exp": 1311281970, 
  "iat": 1311280970, 
  "name": "Jane Doe", 
  "given_name": "Jane", 
  "family_name": "Doe"
}

```
<br>

One important claim is the **aud** claim. This claim defines the **audience** of the token, i.e., the web application that is meant to be **the final recipient of the token**. In the case of the ID token, its value is the client ID of the application that should consume the token.

The ID token may have additional information about the user, such as their email address, picture, birthday, and so on.

Finally, maybe the most important thing: the ID token is signed by the issuer with its private key. This guarantees you the origin of the token and ensures that it has not been tampered with. You can verify these things by using the issuer's public key.

## What can you do with an ID token?

* Assume the user is authenticated.
* Get user profile data.

## Waht is an ID token NOT suitable for?

* Call an API
* Check if the client is allowed to access something.

Reference

<https://auth0.com/blog/id-token-access-token-what-is-the-difference/>