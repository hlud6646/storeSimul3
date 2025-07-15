# Builder. Specify JDK version, sbt version and scala version. 
FROM sbtscala/scala-sbt:eclipse-temurin-21.0.7_6_1.11.3_3.7.1 AS builder
WORKDIR /app
COPY build.sbt .
COPY project ./project
# This funny looking line is very smart. It opens sbt and downloads dependencies.
# Then it exits, creating a layer that can be cached. On later builds, if all you 
# changed is the source code (i.e. not the dependencies), the builds will be a lot
# faster.
RUN sbt exit
COPY src ./src
RUN sbt assembly

# Runner. Only need the java runtime now. 
FROM alpine/java:21-jre
WORKDIR /app
COPY --from=builder /app/target/scala-3.7.1/products-assembly-0.1.0-SNAPSHOT.jar app.jar

# Simple health check - just verify Java process is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD pgrep -f "java.*app.jar" || exit 1

CMD ["java", "-jar", "app.jar"]
