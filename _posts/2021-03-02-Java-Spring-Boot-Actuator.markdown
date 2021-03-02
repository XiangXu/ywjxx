---
layout: post
title:  Spring Boot Actuator
date:   2021-03-02 20:04
image:  spring.png
tags:   [Java, Spring]
---

## What is an Actuator?

In essence, Actuator brings production-ready features to our application.

**Monitoring our app, gathering metrics, understanding traffic, or the state of our database become trivial with this dependency**.

The main benfit of this library is that we can get production-grade tools without having to actually implement these features ourselves.

**Actuator is mainly used to expose operational information about the running application** - health, metrics, info, dump, env, etc. It uses HTTP endpoints or JMX beans to enable us to interact with it.

Once this dependency is on the classpath, several endpoints are available for us out of the box. As with most Spring modules, we can easily configure or extend it in many ways.

To enable Spring Boot Actuator, we just need to add the *spring-boot-actuator* dependency to our package manager.

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

<!-- Line breaks -->
<br />

## Spring Boot 2.x Actuator

**Actuator comes with most endpoints disabled**. The only two available by default are */health* and */info*.

If we want to enable all of them, we could set *management.endpoints.web.exposure.include=*.* Alternatively, we can list endpoints that should be enabled.

**Acutator now shares the security config with the regular App security rules, so the security model is dramatically simplified**. Therefore, to tweak Actuator security rules, we could just add an entry for */actuator/**.

```
@Bean
public SecurityWebFilterChain securityWebFilterChain(
  ServerHttpSecurity http) {
    return http.authorizeExchange()
      .pathMatchers("/actuator/**").permitAll()
      .anyExchange().authenticated()
      .and().build();
}
```

<!-- Line breaks -->
<br />

As by default, **all Actuator endpoints are now placed under the */acutator* path**.

### Predefined Endpoints

* /auditevents lists security audit-related events such as user login/logout. Also, we can filter by principal or type among other fields.
* /beans returns all available beans in our BeanFactory. Unlike /auditevents, it doesn't support filtering.
* /conditions, formerly known as /autoconfig, builds a report of conditions around autoconfiguration.
* /configprops allows us to fetch all @ConfigurationProperties beans.
* env returns the current environment properties. Additionally, we can retrieve single properties.
* /flyway provides details about our Flyway database migrations.
* /health summarizes the health status of our application.
* /heapdump builds and returns a heap dump from the JVM used by our application.
* /info returns general information. It might be custom data, build information or details about the latest commit.
* /liquibase behaves like /flyway but for Liquibase.
* /logfile returns ordinary application logs.
* /loggers enables us to query and modify the logging level of our application.
* /metrics details metrics of our application. This might include generic metrics as well as custom ones.
* /prometheus returns metrics like the previous one, but formatted to work with a Prometheus server.
* /scheduledtasks provides details about every scheduled task within our application.
* /sessions lists HTTP sessions given we are using Spring Session.
* /shutdown performs a graceful shutdown of the application.
* /threaddump dumps the thread information of the underlying JVM.

### Hypermedia for Acutator Endpoints

Spring Boot adds a discovery endpoint that returns links to all available acutator endpoints. This will facilitate discovering actuator endpoints and their correspoinding URLs.

**By default, this discovery endpoints is access through the */actuator* endpoint**. Therefore, if we wend a GET request to this URL, it will return the actuator links for the various endpoints:

```json
{
  "_links": {
    "self": {
      "href": "http://localhost:8080/actuator",
      "templated": false
    },
    "features-arg0": {
      "href": "http://localhost:8080/actuator/features/{arg0}",
      "templated": true
    },
    "features": {
      "href": "http://localhost:8080/actuator/features",
      "templated": false
    },
    "beans": {
      "href": "http://localhost:8080/actuator/beans",
      "templated": false
    },
    "caches-cache": {
      "href": "http://localhost:8080/actuator/caches/{cache}",
      "templated": true
    },
    // truncated
}
```

<!-- Line breaks -->
<br />

Moreover, if we configure a custom management base path, then we should use that base path as the discovery URL.

For instance, if we set the management.endpoints.web.base-path to /mgmt, then we should send a request to the /mgmt endpoint to see the list of links.

Quite interestingly, when the management base path is set to /, the discovery endpoint is disabled to prevent the possibility of a clash with other mappings.

### Health Indicators

```java
@Component
public class DownstreamServiceHealthIndicator implements ReactiveHealthIndicator {

    @Override
    public Mono<Health> health() {
        return checkDownstreamServiceHealth().onErrorResume(
          ex -> Mono.just(new Health.Builder().down(ex).build())
        );
    }

    private Mono<Health> checkDownstreamServiceHealth() {
        // we could use WebClient to check health reactively
        return Mono.just(new Health.Builder().up().build());
    }
}
```

<!-- Line breaks -->
<br />

### Health Groups

We can organize health indicators into groups and apply the same configuration to all the group members.

For example, we can create a health group named custom by adding this to our *application.properties*.

```
management.endpoint.health.group.custom.include=diskSpace,ping
```

<!-- Line breaks -->
<br />

This way, the custom group contains the diskSpacen and ping health indicators. Now if we call the */actuator/health* endpoint, it would tell us about the new health group in the JSON response

```json
{"status":"UP","groups":["custom"]}
```

<!-- Line breaks -->
<br />

**With health groups, we can see the aggregated results of a few health indicators**.

In this case, if we send a request to */actuator/health/custom* then:

```json
{"status":"UP"}
```

<!-- Line breaks -->
<br />

We can configure the group to show more details vie application.properties:

```
management.endpoint.health.group.custom.show-components=always
management.endpoint.health.group.custom.show-details=always
```

<!-- Line breaks -->
<br />

```json
{
  "status": "UP",
  "components": {
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963170816,
        "free": 91300069376,
        "threshold": 10485760
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```
<!-- Line breaks -->
<br />

It is also possible to show these details only for authorized users:

```
management.endpoint.health.group.custom.show-components=when_authorized
management.endpoint.health.group.custom.show-details=when_authorized
```

<!-- Line breaks -->
<br />

**We can also have a custom status mapping**. For instance, instead of an HTTP 200 OK response, it can return 207 status code:

```
management.endpoint.health.group.custom.status.http-mapping.up=207
```

<!-- Line breaks -->
<br />

Here, we're telling Spring Boot to return a 207 HTTP status code if the custom group status is UP.

### Metrics in Spring Boot 2

**In Spring Boot 2.0, the in-house metrics were replaced with Micrometer support**, so we can expect breaking changes. Micrometer is now part of Actuator's dependencies, so we should be good to go as long as the Actuator is in the classpath.

Moreover, we'll get a completely new response from */metrics* endpoint:

```json
{
  "names": [
    "jvm.gc.pause",
    "jvm.buffer.memory.used",
    "jvm.memory.used",
    "jvm.buffer.count",
    // ...
  ]
}
```

<!-- Line breaks -->
<br />

As we can see, there are no actual metrics. To get the actual value of a specific metric, we can now navigate to the desired metric, e.g.g */actuator/metrics/jvm.gc.pause*, and get a detailed response:

```json
{
  "name": "jvm.gc.pause",
  "measurements": [
    {
      "statistic": "Count",
      "value": 3.0
    },
    {
      "statistic": "TotalTime",
      "value": 7.9E7
    },
    {
      "statistic": "Max",
      "value": 7.9E7
    }
  ],
  "availableTags": [
    {
      "tag": "cause",
      "values": [
        "Metadata GC Threshold",
        "Allocation Failure"
      ]
    },
    {
      "tag": "action",
      "values": [
        "end of minor GC",
        "end of major GC"
      ]
    }
  ]
}
```

<!-- Line breaks -->
<br />

### Customizing the /info Endpoint

The */info* endpoint remains unchanged. As before, we can add git details using the respective Maven or Gradle dependency:

```
<dependency>
    <groupId>pl.project13.maven</groupId>
    <artifactId>git-commit-id-plugin</artifactId>
</dependency>
```

<!-- Line breaks -->
<br />

Likewise, we could also include build information including name, group, and version using the Maven or Gradle plugin:

```
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <executions>
        <execution>
            <goals>
                <goal>build-info</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

<!-- Line breaks -->
<br />

## Creating a Custom Endpoint

Let's create an Actuator endpoint to query, enable and disable feature flags in our application:

```java
@Component
@Endpoint(id = "features")
public class FeaturesEndpoint {

    private Map<String, Feature> features = new ConcurrentHashMap<>();

    @ReadOperation
    public Map<String, Feature> features() {
        return features;
    }

    @ReadOperation
    public Feature feature(@Selector String name) {
        return features.get(name);
    }

    @WriteOperation
    public void configureFeature(@Selector String name, Feature feature) {
        features.put(name, feature);
    }

    @DeleteOperation
    public void deleteFeature(@Selector String name) {
        features.remove(name);
    }

    public static class Feature {
        private Boolean enabled;

        // [...] getters and setters 
    }

}
```

<!-- Line breaks -->
<br />

To get the endpoint, we need a bean. In our example, we're using @Component for this. Also, we need to decorate this bean with @Endpoint.

The path of our endpoint is determined by the id parameter of @Endpoint. In our case, it'll route requests to /actuator/features.

Once ready, we can start defining operations using:

* @ReadOperation: It'll map to HTTP GET.
* @WriteOperation: It'll map to HTTP POST.
* @DeleteOperation: It'll map to HTTP DELETE.

When we run the application with the previous endpoint in our application, Spring Boot will register it.

### Extending Existing Endpoints

Let's imagine we want to make sure the production instance of our application is never a SNAPSHOT version.

We decide to do this by changing the HTTP status code of the Actuator endpoint that returns this information, i.e., /info. If our app happened to be a SNAPSHOT, we would get a different HTTP status code.

**We can easily extend the behavior of a predefined endpoint using the @EndpointExtension annotations, or its more concrete specializations @EndpointWebExtension or @EndpointJmxExtension**:

```java
@Component
@EndpointWebExtension(endpoint = InfoEndpoint.class)
public class InfoWebEndpointExtension {

    private InfoEndpoint delegate;

    // standard constructor

    @ReadOperation
    public WebEndpointResponse<Map> info() {
        Map<String, Object> info = this.delegate.info();
        Integer status = getStatus(info);
        return new WebEndpointResponse<>(info, status);
    }

    private Integer getStatus(Map<String, Object> info) {
        // return 5xx if this is a snapshot
        return 200;
    }
}
```

<!-- Line breaks -->
<br />

### Enable All Endpoints

**In order to access the actuator endpoints using HTTP, we need to both enable and expose them**.

By default, all endpoints but */shutdown* are enabled. Only the */health* and */info* endpoints are exposed by default.

We need to add the following configuration to expose all endpoints:

```
management.endpoints.web.exposure.include=*
```

<!-- Line breaks -->
<br />

To explicitly enable a specific endpoint(/shutdown), we use;

```
management.endpoint.shutdown.enabled=true
```

<!-- Line breaks -->
<br />

To expose all enabled  endpoints except one(/loggers), we use:

```
management.endpoints.web.exposure.include=*
management.endpoints.web.exposure.exclude=loggers
```

<!-- Line breaks -->
<br />



Reference

<https://www.baeldung.com/spring-boot-actuators>
