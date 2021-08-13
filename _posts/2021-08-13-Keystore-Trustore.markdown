---
layout: post
title:  Keystore vs. Trustore
date:   2021-08-13 21:38
image:  oop.jpg
tags:   [Fundation, security]
---

In most cases, **we use a keystore and a trustore when our application needs to communicate over SSL/TLS**.

Usually, these are password-protected files that sit on the same file system as our running application. The default format used for these file is **JKS until Java 8**.

Since Java 9, **the default keystore format is PKCS12**. The biggest difference between JKS and PKCS12 is that JKS is a format specific to Java, while PKCS12 is a standardized and language-neutral way of storing encrypted private keys and certificates.

**Keystore is used to store private key and identity certificates that a specific program should present to both parties (server or client) for verification**.

**Truststore is used to store certificates from certified Authorities (CA) that verify the certificate presented by the server in SSL connection**.

![keystore_truststore](/images/keystore_truststore.png)