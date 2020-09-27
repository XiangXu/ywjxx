---
layout: post
title:  Network Terms
date:   2020-09-27 21:36
image:  computer_network.jpg
tags:   [Fundation, Network]
---

## Physical Layer

It provides the hardware means of sending and receiving data on a carrier, including defing cables, cards and physical aspects.

## Data Link Layer

Data packets are encoded and decoded into bits. It furnishes transmission protocol knowledge, management and handles error in the physical layer, flow control and frame synchronization.

The data link layer is divided into two sub layers: The Media Access Control(MAC) layers and Logical Link Control(LLC) layer. 

The MAC sub layer controls how a computer on the network gains access to the data and permission to transmit it. 

The LLC layer controls frame synchronization, flow control and error check.

## Network Layer

This layer provides switching and routing technologies, create login paths known as virtual circuits, for transmitting data from node to node. Routing and forwarding are functions of this layer, as well as addressing, internet working, error handling, congestion control and packet sequencing. 

## Transport Layer

This layer provides transparent transfer of data between systems, or hosts and is responsible for end-to-end erro recovery and flow control. It ensures complete data transfer. 

## Session Layer

This layer establishes, manages and terminates connections between applications. The session layer sets up, coordinates and terminates conversations, exchanges, and dialogues between the applications at each end. It deals with session and connection coordination. 

## Presentation Layer

This layer provides independence from differences in data presentation by translating from application to network format, and vice versa. The presentation layer works to tranform data into the form that the application layer can accept. This layer formats and encrypts data to be sent across a network, providing freedom from capability problems.

## Application Layer

It supports application and end-user processes. Communication partners are identified, quality of service is identified, user authentication and privacy are considered, and any constraints on data syntax are identified. Everything at this layer is application-specific. This layer provides application services for file transfers, email and other network software services. Telent and FTP are applications that exist entirely in the application level. Tiered application architectures are part of this layer.

Reference

<https://www.webopedia.com/quick_ref/OSI_Layers.asp#OSI-5>




