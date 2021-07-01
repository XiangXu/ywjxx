---
layout: post
title:  Different between Table and View
date:   2021-07-01 16:13
image:  mysql.jpg
tags:   [Database]
---

Table and view are the two basic terms used in the relational database environment. The difference between table and view is debated among begineers and database administrators because both share some common similarities. **The main difference between them is that a table is an object that consists of rows and columns to store and retrieve data whenever the user needs it. In contrast, the view is a virtual table based on an SQL statements's result set and will dissappear when the current sesion is closed**. 

## What is a table?

**A table consists of rows and columns used to organize data** to store and display records in a structured format. It is similar to worksheets in the spreadsheet applications. It occupies space on our system. We need three things to create a table:

* Table name
* Columns/Fields name
* Definitions for each field

We can create a table in MySQL using the below syntax:

```sql
CREATE TABLE [IF NOT EXISTS] table_name (    
    column_definition1,    
    column_definition2,    
    ........,    
    table_constraints    
);  
```

<!-- Line breaks -->
<br />

The following are the main advantages of the table:

1. It provides an efficient way to summarize the given information into structured form that helps to find out the information quickly. 
2. It allows us to add the data ina specific way rather than in a paragraph that makes the data more understandable.
3. It enables **quick searching** for the data we need.
4. It helps in introducing relationships between various data using referential constraints.
5. It can be associated with data security that following only authorized people for data accessing.

## What is a view?

The view is a **virtual/logical table** formed as a result of a query and used to view or manipulate parts of the table. We can create the column of the view from one or more tables. Its content is based on base tables.

The view is a database object with no values and contains rows and columns the smae as real tables. **It does not occupy space** on our systems.

We can create a view in MySQL using the below syntax:

```sql
CREATE VIEW view_name AS      
SELECT columns      
FROM tables      
[WHERE conditions];   
```

<!-- Line breaks -->
<br />

The following are the main advantages of the view:

1. Views are usually virtual and do not occupy space in systems.
2. Views enable us to hide some of the columns from the table.
3. It simplifies complex queries because it can draw data from multiple tables and present it as a single table.
4. It helps in data security that shows only authorized information to the users.
5. It presents a consitent, unchanged image of the database structure, even if the source tables are renamed, split, or restructured. 

## Key differences between Table and View

The following points explain the differences between tables and views:

* A table is a database object that holds information used in applications and reports. On the other hand, a view is also a database object utilized as a table and can also link to other tables.
* A table consists of rows and columns to store and organized data in a structured format, while the view is a result set of SQL statements.
* A table is structured with columns and rows, while a view is a virtual table extracted from a database.\
* The table is an independent data object while views are usually depending on the table.
* The table is an actual or real table that exists in physical locations. On the other hand, views are the virtual or logical table that does not exist in any physical location.
* A table allows to performs add, update or delete operations on the stored data. On the other hand, we cannot perform add, update, or delete operations on any data from a view. If we want to make any changes in a view, we need to update the data in the source tables.
* We cannot replace the table object directly because it is stored as a physical entry. In contrast, we can easily use the replace option to recreate the view because it is a pseudo name to the SQL statement running behind on the database server.


Reference 

<https://www.javatpoint.com/table-vs-view>


