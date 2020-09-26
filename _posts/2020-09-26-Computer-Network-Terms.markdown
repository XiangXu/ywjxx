---
layout: post
title:  Network Terms
date:   2020-09-26 15:34
image:  computer_network.jpg
tags:   [Fundation, Network]
---

* **LAN**: Local area network is a group of computers and network devices connected together, usually within the same building.
  
* **MAN**: Metropolitan area network is a larger network that usually spans several buildings in the same city or town.

* **WAN**: Wide area network, in comparision to a MAN, is not restricted to a geographical location, although it might be confined within the bounds of a state or country. A WAN connects several LANs, and may be limited to an enterprise (a corporation or an organization) or accessible to the public. The technology is high speed and relatively expensive. The Internet is an example of a worldwide public WAN.

* **Router**: A router is a networking device that forwards data packets between computer networks. 

* **HUB -> Bridge -> Switch**: A switch is designed to a connect computer within a network. 

* **Subnet Mask**: It is a 32 bit number that masks IP address, and divides the IP address into network address and host address.

* **IP**: An Internet Protocol Address is known as IP address. It is a numerical label which assigned to each device connected to a computer network which use the IP for communication.

* **MAC(Media Access Control) Address**: It is a unique identifier assigned to network interface controller for use as a network address in communication within a network segment.

* **DNS(Domain Name System)**: The Domain Name System(DNS) is the phonebook of the Internet. Humans access information through domain names, like google.ie.

* **NFS(Network File System)**: It allows a user on a client computer to access files over a computer network much like local storage is accessed. 

* **SNMP(Simple Network Management Protocol)**: It is an Internet Standard Protocol for collecting and organizing information about managed devices on IP network and for modifying that information to change device behavior. 

### TCP/IP

TCP is stands for transmission protocol. The IP protocol breaks up data into packets and sends them to a destination over the Internet. Once packets reach their destination, they are reassembled by the receiving device back into their original form.

TCP requires both parties to communicate in order to establish a connection and send data. TCP guarantees the recipient will receive packets in order according to sequence numbers included in the header. The recipient will send a message back to the sender for each packet, acknowledging that they have been received. Packets are checked for errors using a checksum, which is also included in the header.

### UDP

UDP stands for User Datagram Protocol. Compare to TCP/IP, it is simpler and faster. The main difference is the **UDP doesn't require the recipient to acknowledge that each packet has been received**. Any packets that get lost in transit are not resent. 

UDP is used when speed is preferred over integrity and error correction. For example, applications like streaming video and music, voice call and online gaming. DNS traffic is usually exchanged over the UDP protocol.



