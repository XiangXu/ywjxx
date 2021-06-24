---
layout: post
title:  Spring JDBC Fetch Size and Batch Size
date:   2021-06-24 21:02
image:  spring.png
tags:   [Java, Spring, JDBC]
---

## hibernate.jdbc.fetch_size

The `hibernate.jdbc.fetch_size` Hibernate configuration property is used for setting the JDBC `Statement#setFetchSize` property for every statement that Hibernate uses during the currently Persistence Context.

Usually, you don't need to set this property as the default is fine, especially for MySQL and PostgreSQL which fetch the entire ResultSet in a single database roundtrip. Becuase Hibernate traverses the entire ResultSet, you are better off fetching all rows in a single shot instead of using multiple roundtrips.

**Only for Oracle, you might want to set it since the default fetchsize is just 10**.

## hibernate.jdbc.batch_size

The `hibernate.jdbc.batch_size` property is used to batch multiple INSERT, UPDATE, and DELETE statements together so that they can be set in a single database call.

If you set this property, you are better off setting these two as well:

* hibernate.order_inserts to true
* hibernate.order_updates to true

Reference

<https://stackoverflow.com/questions/21257819/what-is-the-difference-between-hibernate-jdbc-fetch-size-and-hibernate-jdbc-batc>