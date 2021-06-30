---
layout: post
title:  Database Trigger
date:   2021-06-30 19:24
image:  mysql.jpg
tags:   [Database]
---

**A database trigger is procedural code that is automatically executed in response to certain events on a particular table or view in a database**. The trigger is mostly used for maintaining the integrity of the information on the database. For example, when a new record(representing a new worker) is added to the employee table, new records should also be created in the tables of the taxes, vacations and salaries. Trigger can also be used to log historicial data, for example to keep track of employee's previous salaries.

Using triggers is quite valid when their use is justified. For example, **they have good value in auditing(keep history of data)** without requiring explicit procedural code with every CRUD command on every table.

**I was always told, only use triggers if you really need to and opt to use stored procedures instead if possible**.

1. Some functions that triggers used to do in the old days could now be performed in other ways such as updating totals and automatic calculation on a column.
2. You don't see where the trigger is invoked by examining code alone without knowing they exist. You see their effect when you see the data changes and it is sometimes puzzling to figure out why the change occurred unless you know there is a trigger or more acting on the table(s).
3. If you use several database controls such as CHECK, RI, Triggers on several table, your transaction detailed flow becomes complex to understand and maintain. You will need to know exactly what happens when. Again, you will need good documentation for this.

Some differences between triggers and non-trigger stored procedures are (amongst others):

* A non-trigger stored procedure is like a program that has to be invoked explicitly either from code or from a scheduler or from a batch job, etc. to do its work, whereas a a trigger is a special type of stored procedure that fires as a response of an event rather than be directly executed by the user. The event may be a change of data in a data column for example.
* Triggers have types. DDL Triggers and DML Triggers (of types: INSTEAD OF, For, and AFTER)
* Non-Trigger Stored procedures can reference any type of object, however, to reference a view, you must use INSTEAD OF triggers.
* In SQLServer, you can have any number on non-trigger stored procedures but only 1 INSTEAD OF trigger per table.


Reference

<https://softwareengineering.stackexchange.com/questions/123074/sql-triggers-and-when-or-when-not-to-use-them/123089>

<https://en.wikipedia.org/wiki/Database_trigger>