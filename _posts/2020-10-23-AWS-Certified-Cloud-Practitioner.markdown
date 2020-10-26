---
layout: post
title:  AWS Certified Cloud Practitioner
date:   2020-10-18 14:59
image:  aws.jpg
tags:   AWS
---

## What is a server composed of?

* Compute: CPU
* Memory: RAM
* Storage: Data
* Database: Store data in a structural way 
* Network: Router, Switch, DNS Server

* **Network**: Cables, routers and servers connected with each other.
* **Router**: A networking device that forwards data packets between computer networks. They know where to send you packets on the Internet.
* **Switch**: Takes a packet and send it to the correct server client on your network.

## What is cloud computing?

* Cloud computing is the **on-demand delivery** of compute power, database storage, applications, and other IT resources.
* Through a cloud services platform with **pay as you go** pricing.
* You can **provision exactly the right type and size of computing** resources you need.
* You can access as many resources as you need, **almost instantly**.
* Simple way to access **servers, storage, databases** and set of **application services**.

## The Deployment Models of the Cloud

### Private Cloud

* Cloud services used by a single organization, not exposed to the public.
* Complete control.
* Security for sensitive applications.
* Meet specific business needs.

### Public Cloud

* Cloud resources owned and operated by a third-party cloud service provider delivered over the Internet.
* Six Advantages of Cloud Computing.

### Hybrid Cloud:

* Keep some servers on premises and extend some capabilities to the Cloud.
* Control over sensitive assets in your private infrastructure.
* Flexibility and cost-effectiveness of the public cloud.


## Types of Cloud Computing

### Infrastructure as a Service (IaaS) - Amazone EC2

* Provide building blocks for cloud IT.
* Provide networking, computers, data storage space.
* Highest level of flexibility.
* Easy parallel with traditional on-premises IT.

### Platform as a Service (PaaS) - Elastic Beanstalk 

* Remove the need for your organization to manage the underlying infrastructure.
* Focus on the deployment and management of your applicaitons.

### Software as a Service (SaaS) - Rekognition for Machine Learning

* Completed product that is run and managed by the service provider.

### Differences between each Service

* On-Premises: Applications, Data, Runtime, Middleware, O/S, Virtualization, Services, Storage, Networking.
* IaaS: Applications, Data, Runtime, Middleware, O/S, **Virtualization**, **Services**, **Storage**, **Networking**.
* PaaS: Applications, Data, **Runtime**, **Middleware**, **O/S**, **Virtualization**, **Services**, **Storage**, **Networking**.
* SaaS: **Applications**, **Data**, **Runtime**, **Middleware**, **O/S**, **Virtualization**, **Services**, **Storage**, **Networking**.

## Pricing of the Cloud

* AWS has 3 pricing fundamentals, following the pay-as-you-go pricing model.
* Compute: **pay for compute time**.
* Storage: **Pay for data stored in the cloud**.
* Data transer OUT of the Cloud: **Data transfer IN is free**.

## AWS Availability Zones

* Each region has many availability zones.
* Each availability zone is one or more discrete data centers with redudant power, networking, and connectivity.

## IAM 

### Users & Groups

* IAM = Identity and Access Management, Global service. We can create users and assign group. 
* Root account created by default, shouldn't be used or shared.
* Users are people within your organization, and can be grouped.
* Groups only contain users, not other groups.
* User don't have to belong to a group, and user can belong to multiple groups.

### Permissions

* Users or Groups can be assigned **JSON** documents called policies.
* These policies define the **permissions** of the users.
* In AWS you apply the **least privilege principle**: don't give more permissions than a user needs.

### Password Policy

* Strong passwords - including uppercase letters, lowercase letters, numbers, non-alphanumeric characters.
* Allow all IAM users to change their own passwords.
* Require users to change their password after some time.
* Prevent password re-use.

### Multi Factor Authentication - MFA

* You want to protect your Root Accounts and IAM users.
* MFA = password you know + security device you own.

MFA devices options AWS

1. Google Authenticator - phone only
2. Authy - Multi - device
3. Universal 2nd Factor(J2F) Security Key - physical device
4. Hardware Key Fob MMA Device
5. Hardware Key Fob MFA Device for AWS GovCloud(US)

### How can users access AWS

* AWS Management Console (protected by password + MFA).
* AWS Command Line Interface (CLI): protected by access keys.
* AWS Software Developer kit (SDK): for code: protected by access keys.
* Access keys are generated through the AWS Console.
* Users manage their own access keys.
* Access Keys are secret, just like a password. Don't share them.
* Access Key ~= username.
* Secret Access Key ~= password.

### Roles for Services

* Some AWS service will need to perform actions on your behalf.
* To do so, we will assign permissions to AWS services with IAM Roles.

### Security Tools

* IAM Credentials Report (account-level)
  * a report that lists all your account's users and the status of their various credentials.
  
* IAM Access Advisor (user-level)
  * Access advisor shows the service permissions granted to a user and when those services were last accessed.
  * You can use this information to revise your policies.

## Amazone EC2

Elastic Compute Cloud = Infrastructure as a Service. It mainly consists in the capability of:

* Renting virtual machines (EC2).
* Storing data on virtual drives (EBS).
* Distributing load across machines (ELB).
* Scaling the services using an auto-scaling group (ASG).

### Introduction to Security Groups

* Security Groups are the fundamental of network security in AWS.
* They control how traffic is allowed into or out of our EC2 instances.
* Security groups only contain **allow** rules.
* Security groups rules can reference by IP or by security group. 

### Security Groups Deeper Dive

* Security groups are acting as a "firewall" on EC2 instances.
* They regulate:
  * Access to Ports.
  * Authorised IP ranges - IPv4 and IPv6.
  * Control of inbound network (from other to the instance).
  * Control of outbound network (from the instance to other).

#### Classis Ports to know

* 22 = SSH (Secure Shell) - log into a Linux instance.
* 21 = FTP (File Transport Protocol) - upload files into a file share.
* 22 = SFTP (Secure File Transport Protocol) - upload files using SSH.
* 80 = HTTP - access unsecured websites.
* 443 = HTTPS - access secured websites.
* 3389 = RDP (Remote Desktop Protocol) - log into a Windows instance.

### EC2 Instances Purchasing Options

#### On-Demand Instances

* Pay for what you use: Linux - billing per second, after the first minute; all other opearting system - billing per hour.
* Has the highest cost but no upfront payment.
* No long-term commitment.

Recommended for **short term** and **un-interrupted workloads**, where you cann't predict how the applicaiton will behave.
  
#### Reserved: (Minimum 1 year)

* Reserved Instances: long workloads.
* Convertible Reserved Instances: long workloads with flexible instances.
* Scheduled Reserved Instances: example - every Thursday between 3 and 6 pm.

* Up to 75% discount compared to On-demand.
* Reservation period: 1 year = + discount | 3 years = +++ discount
* Purchasing options: no upfront | partial upfront = +| All upfront = ++ discount
* Reserve a specific instance type. 

Recommended for **steady - state useage applications** (think database).

#### Spot Instance: short workloads, cheap, can lose instances(less reliable).

* Can get a discount of up to 90% compared to On - demand.
* Instance that you can lose at any point of time if your max price is less than the current spot price.
* The MOST cost-efficient instances in AWS.

Not suitable for critical jobs or databases. 

#### Dedicated Hosts: book an entire physical server, control instance placement.

* Dedicated Hosts can help you adress **compliance requirements** and reduce costs by allowing you to **use your existing server-bound software licenses**.
* Allocated for your account for a 3-year period reservation.
* More expensive.
* Useful for sotware that have complicated licensing model.
* Or for companies that hvae strong regulatory or compliance needs.

#### Dedicated Instances

* Instances running on hardware that's dedicated to you.
* May share hardware with other instances in same account.
* No Control over instance placement (can move hardware after stop / start).

