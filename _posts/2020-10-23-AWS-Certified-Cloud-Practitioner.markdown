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

### Multi Factor Authentication -MFA

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
