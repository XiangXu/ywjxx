---
layout: post
title:  SOLID - LESS Design Principles
date:   2020-09-24 22:40
image:  oop.jpg
tags:   [Fundation, Design]
---

## Single Responsibility Principle

One class should have one and only one responsibility.

## Open Closed Principle

Software components should open for extension but close for modification.

## Liskov's Substitution Principle

Derived type must be completely substitutable for their base types.

## Interface Segregation Principle

Client should not be forced to implement unnecessary methods if they will not use.

## Dependency Inversion Principle

Depends on abstractions not concertions.

In other word, we should design our software in such way that various modules can be separated from each other using an abstract layer to bind them together.

In spring framework, all modules are provided as separate components which can work together by simply injected dependencies in other module.

## Law of Demeter

The Law of Demeter principle states that a module should not have the knowledge on the inner details of the objects it manipulates. In other words, a software component or an object should not have the knowledge of the internal working of other objects or components.

Reference

<https://stackify.com/solid-design-principles/>
