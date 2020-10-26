---
layout: post
title:  MySQL Storage Engine
date:   2020-10-26 21:20
image:  mysql.jpeg
tags:   [Database, MySQL]
---

Storage Engines are MySQL components, that can handle SQL operations for different types to store and manage information in a database. **InnoDB** is the mostly used general-purpose storage and as MySQL 5.5 and later it is the default engine.

## InnoDB

1. This is the default storage engine for MySQL 5.5 and higher. 
2. It provides **transaction-safe**(ACID compliant) tables. 
3. It supports **FOREIGN KEY** referential-integrity constraints. 
4. It supports **commit, rollback, and crash-recovery capabilities to protect data**. 
5. It supports **row-level locking**. 
6. It's **consistent nolocking reads** increases performance when used in multiuser environment.
7. It **stores data in clustered indexes** which reduce I/O queries based on primary key.

## MyISAM

This storage engine, manage no-transactional tables, provide high-speed storage and retrieval, support full text searching.

## Memory

Provides in-memory tables, formerly known as HEAP. It stores all data in RAM for faster access than storing data on disks. Userful for quick look up of reference and other identical data.

## Merge

Groups more than one similar MyISAM tables to be treated as a single table, can handle no transactional tables, included by default.

## Example

You can create tables with this engine, but cannot store or fetch. Purpose of this is to teach developers about how to write a new storage engine.

## Archieve

Used to store large amount of data, doesn't support index.

## CSV

Stores data in common seperated value format in a text ile.

## BlackHole

Accepts data to store but always return empty.

## Federated

Stores data in a remote database.

Reference

<https://www.w3resource.com/mysql/mysql-storage-engines.php>