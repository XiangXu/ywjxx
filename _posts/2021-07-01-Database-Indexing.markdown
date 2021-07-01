---
layout: post
title:  Indexing
date:   2021-07-01 21:56
image:  mysql.jpg
tags:   [Database]
---

## What is Indexing?

**Indexing makes columns faster to query by creating pointers to where data is stored within a database**. 

Imagine you want to find a piece of information that is within a large database. To get this information out of the database the computer will look through every row until it finds it. If the data you are looking for is towards the very end, this query would take a long time to run.

If the table was ordered alphabetically, searching for a name could happen a lot faster because we could skip looking for the data in certain rows. If we wanted to search for "Zack" and we know the data is in alphabetical order we could jump down to halfway through the data to see if Zack comes before or after that row. We would then half the remaining rows and make the same comparision.

**Indexes allow us to create stored lists withouth having to create all new sorted tables, which would take up a lot of storage space**.

## What Exactly is an Index?

**An index is a structure that holds the field the index is sorting and a pointer from each record to their correspoinding record in the original table where the data is actually stored**. Indexes are used in things like a contact list where the data may be physically stored in the order you add people's contact information but it is easier to find people when listed out in alphabetical order.

## Types of Indexing

There are two types of database indexes:

1. Clustered
2. Non-Clustered

Both clustered and non-clustered indexes are stored and searched as B-trees, a data structure similar to a binary tree. A B-tree is a "self-balancing" tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time. Basically it creates a tree-like structure that sorts data for quick searching.

To increase efficiency, many B-trees will limit the number of characters you can enter into an entry. The B-tree will do this on it’s own and does not require column data to be restricted.

### Clustered Indexes

**Clustered indexes are the unique index per table that uses the primary key to organize the data that is within the table**. The clustered index ensures that the primary key is stored in increasing order, which is also the order the table holds in memory.

* Clustered indexes do not have to be explicitly declared. 
* Created when the table is created.
* User the primary key sorted in ascending order.

### Non-Clustered Indexes

**Non-Clustered indexes are sorted references for a specific field, from the main table, that hold pointers back to the original entries of the table**. They are used to increase the speed of queries on the table by creating columns that are more easily searchable. Non-clustered indexes can be created by data analysts/ developers after a table has been created and filled.

Note: Non-clustered indexes are not new tables. Non-clustered indexes hold the field that they are responsible for sorting and a pointer from each of those entries back to the full entry in the table. You can think of these just like indexes in a book. The index points to the location in the book where you can find the data you are looking for.

Non-clustered indexes point to memory addresses instead of storing data themselves. This makes them slower to query than clustered indexes but typically much faster than a non-indexed column.

## Searching Indexes

After your non-clustered indexes are created you can begin querying with them. Indexes use an optimal search method known as **binary search**. Binary searches work by constantly cutting the data in half and checking if the entry you are searching for comes before or after the entry in the middle of the current portion of data. This works well with B-trees because they are designed to start at the middle entry; to search for the entries within the tree you know the entries down the left path will be smaller or before the current entry and the entries to the right will be larger or after the current entry.

## When to use Indexes

Indexes are meant to speed up the performance of a database, so use indexing whenever it significantly improves the performance of your database. As your database becomes larger and larger, the most likely you are to see benefits from indexing.

## When not to use Indexes

When data is written to the database, the original table (the clustered index) is updated first and then all of the indexes off of that table are updated. Every time a write is made to the database, the indexes are unusable until they have updated. If the database is constantly receiving writes then the indexes will never be usable. This is why indexes are typically applied to databases in data warehouses that get new data updated on a scheduled basis(off-peak hours) and not production databases which might be receiving new writes all the time.

Reference

<https://dataschool.com/sql-optimization/how-indexing-works/>