---
layout: post 
title:  Comparator and Comparable in Java
date:   2020-12-27 18:57
image:  java.jpeg
tags:   Java
---

Let's take an example of football team - where we want to line up the players by their rankings.

We will start by creating a simple player class:

```java
public class Player {
    private int ranking;
    private String name;
    private int age;
     
    // constructor, getters, setters  
}
```

<!-- Line breaks -->
<br />

Next, let's create a PlaySorter class to create our collection and make an attempt to sort using Collection.sort.   

```java
public static void main(String[] args) {
    List<Player> footballTeam = new ArrayList<>();
    Player player1 = new Player(59, "John", 20);
    Player player2 = new Player(67, "Roger", 22);
    Player player3 = new Player(45, "Steven", 24);
    footballTeam.add(player1);
    footballTeam.add(player2);
    footballTeam.add(player3);
 
    System.out.println("Before Sorting : " + footballTeam);
    Collections.sort(footballTeam);
    System.out.println("After Sorting : " + footballTeam);
}
```

<!-- Line breaks -->
<br />

Here as expected, this results in a compile - error:

```
The method sort(List<T>) in the type Collections is not applicable for the arguments (ArrayList<Player>)
```

<!-- Line breaks -->
<br />

Let's understand what we did wrong here.

## Comparator

The Comparator interface defines a compare(arg1, arg2) method with two arguments which represent compared objects works similarly to Comparable.compareTo() method.

In our first example, we will create a comparator to use the ranking attribute of Player to sort the players:

```java
public class PlayerRankingComparator implements Comparator<Player> {
  
    @Override
    public int compare(Player firstPlayer, Player secondPlayer) {
       return (firstPlayer.getRanking() - secondPlayer.getRanking());
    }
}
```

<!-- Line breaks -->
<br />

Similarly, we can create a Comparator to use the age attribute of Player to sort the players:

```java
public class PlayerAgeComparator implements Comparator<Player> {
    @Override
    public int compare(Player firstPlayer, Player secondPlayer) {
       return (firstPlayer.getAge() - secondPlayer.getAge());
    }
}
```

<!-- Line breaks -->
<br />

Comparators in Action

```java
PlayerRankingComparator playerComparator = new PlayerRankingComparator();
Collections.sort(footballTeam, playerComparator);

// Before Sorting : [John, Roger, Steven]
// After Sorting by ranking : [Steven, John, Roger]

PlayerAgeComparator playerComparator = new PlayerAgeComparator();
Collections.sort(footballTeam, playerComparator);

// Before Sorting : [John, Roger, Steven]
// After Sorting by age : [Roger, John, Steven]
```

<!-- Line breaks -->
<br />

## Java 8 Comparators

Java 8 provides new ways of defining Comparators by using lambda expressions and the comparing() static factory method.

```java
Comparator<Player> byRanking = (Player player1, Player player2) -> player1.getRanking() - player2.getRanking();
```

## Comparator vs Comparable

The Comparable interface is a good choice when used for defining the default ordering, or in other words, if it's the main way of comparing objects.

Then we must ask ourselves why we use a Comparator if we already have comparable? 

There are serveral reasons why:

* Sometimes we cannot modify the source code of the class whose objects we want to sort, thus making the use fom Comparable impossible.
* Using comparators allow us to avoid adding additional code to our domain classes.
* We can define multiple different comparison stragegies which isn't possible when using Comparable.

Reference

<https://www.baeldung.com/java-comparator-comparable>