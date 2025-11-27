# Build stage
FROM gradle:8.5-jdk17-alpine AS build
WORKDIR /app

# Copy gradle files
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle ./
COPY settings.gradle ./

# Copy source code
COPY src ./src

# Build
RUN ./gradlew clean build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install curl + tzdata (for healthcheck & timezone)
RUN apk add --no-cache curl tzdata
ENV TZ=Asia/Seoul

# Create non-root user
RUN addgroup -S appgroup && adduser -S -G appgroup appuser

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Give ownership to non-root user
RUN chown -R appuser:appgroup /app

# Run everything as non-root
USER appuser

# Expose port
EXPOSE 8080

# Health check (컨테이너 내부에서 /actuator/health 호출)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run
# SPRING_PROFILES_ACTIVE 가 설정돼 있으면 그 값을, 없으면 prod 사용
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar app.jar"]