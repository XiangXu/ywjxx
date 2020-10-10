---
layout: post
title:  Maven
date:   2020-10-10 10:36
image:  oop.jpg
tags:   [Fundation, Command]
---

## What is Maven?

Maven is a project management and comprehension tool that provides developers a complete build lifecycle framework. **Maven uses Convention over Configuration**, which means developers are not required to create build process themselves. Developer do not have to mention each and every configuration detail. Maven provides sensible default behavior for projects. Maven creates default project structure and developer is only required to place files accordingly and he/she needs to define nay configuration in pom.xml.

* **Source Code**: ${basedir}/src/main/java
* **Resource**: ${basedir}/src/main/resources
* **Tests**: ${basedir}/src/test
* **Compiled Byte Code**: ${basedir}/target
* **Distributable JAR**: ${basedir}/target/classes

## POM

POM stands for Project Object Model. It is fundamental unit of work in Maven. It is an XML file that resides in the base directory of the project as pom.xml.

```xml
<project xmlns = "http://maven.apache.org/POM/4.0.0"
   xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation = "http://maven.apache.org/POM/4.0.0
   http://maven.apache.org/xsd/maven-4.0.0.xsd">
   <modelVersion>4.0.0</modelVersion>

   <groupId>com.companyname.project-group</groupId>
   <artifactId>project</artifactId>
   <version>1.0</version>
</project>
```

* **groupId**: This is an Id of project's group. This is generally unique amongst an organziation or a project.
* **artifactId**: This is an Id of the project. This is generally name of the project.
* **version**: This is the version of the project.

## What is Build Lifecycle

A Build Lifecycle is a well-defined sequence of phases, which define the order in which the goals are to be executed. Here phase represents a stage in lifecycle. 

* **prepare-resource**: resource copying can be customized in this phases.
* **validate**: validates if the project is correct and if all necessary information is available.
* **compile**: source code compilation is done in this phase.
* **test**: tests the compiled source code suitable for testing framework.
* **package**: this phase creates the JAR/WAR package as mentioned in the packaging in POM.xml.
* **install**: this phase installs the package in local/remote maven repository.g
* **deploy**: copies the final package to the remote repository.

There are always **pre** and **post** phases to register **goals**, which must run prior to, or after a particular phase.

**A goal represents a specific task which contributes to the building and managing of a project**. It may be bound to zero or more build phases. A goal not bound to any build phase could be executed outside of the build lifecycle by direct invocation.

```
mvn clean dependency:copy-dependencies package
```

Here the clean phase will be executed first, followed by the dependency:copy-dependencies goal, and finally package phase will be executed.、

### Clean Lifecycle

When we execute **mvn post-clean**, Maven invokes the clean lifecycle consisting of the following phases.

* **pre-clean**
* **clean**
* **post-clean**

### Default Lifecycle

1. **validate**: validates whether project is correct and all necessary information is available to complete the build process.
2. **initialize**: initializes build state, for example set properties.
3. **generate-sources**: generate any source code to be included in compilation phase.
4. **process-sources**: process the source code, for example, filter any value.
5. **generate-resources**: generate resources to be included in the package.
6. **process-resources**: copy and process the resources into the destination directory, ready for packaging phase.
7. **compile**: compile the source code of the project.
8. **process-classes**: post-process the generated files from compilation, for example to do bytecode enhancement/optimization on Java classes.
9. **generate-test-sources**: generate any test source code to be included in compliation phase.
10. **process-test-sources**: porocess the test source code, for example, filter any values.
11. **test-compile**: compile the test source code into the test destination directory.
12. **process-test-classes**: compile the test source code into the test destination directory.
13.	**test**: run tests using a suitable unit testing framework (Junit is one).
14.	**prepare-package**: perform any operations necessary to prepare a package before the actual packaging.
15.	**package**: take the compiled code and package it in ints distributable foramt, such as a JAR, WAR, or EAR file.
16. **pre-integration-test**: perform actions required before integration tests are executed. For example, setting up the required environment.
17. **integration-test**: process and deploy the package if necessary into an environment where integration tests can be run.
18. **post-integration-test**: perform actions required after integration tests have been executed. For example, cleaning up the environment.
19. **verify**: run any check-ups to verify the package is valid and meets quality criteria.
20.	**install**: install the package into the local repository, which can be used as a dependency in other projects locally.
21.	**deploy**: copies the final package to the remote repository for sharing with other developers and projects.

## What is a Repository

In Maven terminology, a repository is a directory where all the project jars, library jar, plugins or any other project specific artifacts are stored and can be used by Maven easily.

Maven repository are of three types:

* local: it is a folder location on your machine. It gets created when you run any maven command for the first time. It keeps your project's all dependencies.
* central: it is provided by Maven community. It contains a large number of commonly used libraries.
* remote: it is developer's own custom repository containing required libraries or other project jars.

## What are Maven Plugins

Maven is actually a plugin execution framework where every task is actually done by plugins.

* create jar file
* create war file
* compile code files
* unit testing of code
* create project documentation
* create project reports

**A plugin generally provides a set of goals**, which can be executed using the following syntax −

```
mvn [plugin-name]:[goal-name]
```

For example, a Java project can be compiled with the maven-compiler-plugin's compile-goal by running the following command.

```
mvn compiler:compile
```

## What is SNAPSHOT?

SNAPSHOT is a special version that indicates a current development copy. Unlike regular version, Maven checks for a new SNAPSHOT version in a remote repository for every build.

```
<project xmlns = "http://maven.apache.org/POM/4.0.0" 
   xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation = "http://maven.apache.org/POM/4.0.0 
   http://maven.apache.org/xsd/maven-4.0.0.xsd">
   <modelVersion>4.0.0</modelVersion>
   <groupId>app-ui</groupId>
   <artifactId>app-ui</artifactId>
   <version>1.0</version>
   <packaging>jar</packaging>
   <name>health</name>
   <url>http://maven.apache.org</url>
   <properties>
      <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
   </properties>
   <dependencies>
      <dependency>
      <groupId>data-service</groupId>
         <artifactId>data-service</artifactId>
         <version>1.0-SNAPSHOT</version>
         <scope>test</scope>
      </dependency>
   </dependencies>
</project>
```

Reference

<https://www.tutorialspoint.com/maven/index.htm>