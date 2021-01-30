---
layout: post
title:  MySQL Transactions
date:   2021-01-30 20:32
image:  mysql.jpg
tags:   [Database, MySQL]
---

**MySQL transactions allow you to execute a set of MySQL operations to ensure that database never contains the result of partial operations, if one of them fails, the rollback occurs to restore the database to its original state. If no error occurs, the entire set of statements is committed to the database**.

## MySQL and ACID Model

ACID(Atomicity, Consistency, Isolation, Durability) is a set of properties that guarantee the database transactions are processed reliably. InnoDB storage engine supports ACID-compliant features.

## Atomicity

The atomicity aspect of the ACID model mainly involves InnoDB transactions. Related MySQL features include:

* Autocommit setting.
* Commit setting.
* Rollback setting.
* Operational data from the INFORMATION_SCHEMA tables.

## Consistency

The consistency aspect of the ACID model mainly involves internal InnoDB processing to protect data from crashes. Releated MySQL features include:

* InnoDB doublewrite buffer.
* InnoDB crash Recovery.

## Isolation

The isolation aspect of the ACID model mainly involves InnoDB transaction. In particular, the isolation level applies to each transaction. Related MySQL features include:

* Autocommit setting.
* SET ISOLATION LEVEL statement.
* The low-level details of InnoDB locking.

## Durability

The durability aspect of the ACID model involves MySQL software features interacting with you particular hardware configuration. Because of many possibilities depending on the capibilities of your CPU, network and storage devices. This aspect is the most complicated to provide concrete guideliness for.

## Isolation Levels in MySQL

The isolation defines the way in which the MySQL server(InnoDB) seperates each transaction from other concurrent running transaction in the server and also ensures that the transactions are processed in a reliable way.

If transactions are not isolated then one transaction could modify the data that another transaction is reading hence creating data inconsistency. Isolation levels determine how isolated the transactions are from each other. 

MySQL supports all four the isolation levels that SQL-Standard defines. The four isolation levels are:

1. Read Uncommitted
2. Read Committed
3. Repeatable Read
4. Serializable

![Isolation Level](https://mydbops.files.wordpress.com/2018/03/output.gif?w=475&zoom=2)


### Read Uncommitted

In a **Read Uncommitted** isolation level, there isn't much isolation present between the transactions at all.
**No locks**. A transaction can see changes to data made by other transactions that are not committed yet. This is the lowest level in isolation and highly performant since there is no overhead of maintaining locks, with this isolation level, there is always for getting a **"Dirty Read"**.

That means transactions could be reading data that may not even exist eventually because other transaction that was updating the data roll-back the changes and didn't commit. 

### Read committed

In **Read Committed** isolation level, the phenomeon of dirty read is avoided, because any uncommitted changes are not visible to any other transaction until the change is committed. This is the default isolation level with most popular RDBMS software, but not with MySQL.

With this isolation level, each **SELECT** uses its snapshot of the committed data that was committed before the execution of the **SELECT**. Now because each **SELECT** has its own snapshot, here is the trade-off, so the same **SELECT**, when running multiple times during the same transaction, could return different result sets. This phenomenon is called **no-repeatable read**.

Read-committed is the recommended isolation level for Galera ( PXC, MariaDB Cluster ) and InnoDB clusters.

### Repeatable Read

In **Repeatable-Read** isolation level, the phenomenon of non-repeatable read is avoid. **It is the default isolation in MySQL**. This isolation level returns the same result set throughout transaction execution for the same **SELECT** run any number of times during the progression of a transaction.

This is how it works, a snapshot of the SELECT is taken the first time the SELECT is run during the transaction and the same snapshot is used throughout the transaction when the same SELECT is executed. A transaction running in this isolation level does not take into account any changes to data make by other transactions, regardless of whether the changes have been committed or not. This ensures that reads are always consistent(repeatable). Maintaining a snapshot can cause extra overhead and impact some performance.

Although this isolation level solves the problem of non-repeatable read, another possible problem that occurs is **phantom reads**.

**A Phantom is a row that appears where it is not visible before.** InnoDB and XtraDB solve the phantom read problem with multi-version concurrency control.

### Serializable

**Serialiable** completely isolates the effect of one transaction from others. It is similar to REPEATABLE READ with the additional restriction that row selected by one transaction cannot be changed by another until the first transaction finishes. The phenomenon of phantom reads is avoided. This isolation level is the strongest possible isolation level. AWS Aurora do not support this isolation level.



## MySQL transaction statements

MySQL provides us with the following important statement to control transactions:

* To start a transaction, you use the **START TRANSACTION** statement. Then **BEGIN** or **BEGIN WORK** are the aliases of the **START TRANSACTION**.

* To commit the current transaction and make its changes permanent, you use the **COMMIT** statement. 

* To roll back the current transaction and cancel its changes, you use **ROLLBACK** statement.

* To disable or enable the auto-commit mode for the current transaction, you use the **SET autocommit** statement.
* 

```sql
# By default, MySQL automatically commits the changes permanently to the database.
SET autocommit = OFF

SET autocommit = ON;
```

## Commit Rollback Example

```sql
mysql> use RUNOOB;
Database changed
mysql> CREATE TABLE runoob_transaction_test( id int(5)) engine=innodb;  # 创建数据表
Query OK, 0 rows affected (0.04 sec)
 
mysql> select * from runoob_transaction_test;
Empty set (0.01 sec)
 
mysql> begin;  # 开始事务
Query OK, 0 rows affected (0.00 sec)
 
mysql> insert into runoob_transaction_test value(5);
Query OK, 1 rows affected (0.01 sec)
 
mysql> insert into runoob_transaction_test value(6);
Query OK, 1 rows affected (0.00 sec)
 
mysql> commit; # 提交事务
Query OK, 0 rows affected (0.01 sec)
 
mysql>  select * from runoob_transaction_test;
+------+
| id   |
+------+
| 5    |
| 6    |
+------+
2 rows in set (0.01 sec)
 
mysql> begin;    # 开始事务
Query OK, 0 rows affected (0.00 sec)
 
mysql>  insert into runoob_transaction_test values(7);
Query OK, 1 rows affected (0.00 sec)
 
mysql> rollback;   # 回滚
Query OK, 0 rows affected (0.00 sec)
 
mysql>   select * from runoob_transaction_test;   # 因为回滚所以数据没有插入
+------+
| id   |
+------+
| 5    |
| 6    |
+------+
2 rows in set (0.01 sec)
```


Reference:

https://www.mysqltutorial.org/mysql-transaction.aspx

https://www.runoob.com/mysql/mysql-transaction.html

https://www.w3resource.com/mysql/mysql-transaction.php
