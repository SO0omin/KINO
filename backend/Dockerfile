# 1. 빌드 스테이지: 소스 코드를 빌드하여 JAR 파일 생성
FROM openjdk:17-jdk-slim AS build
WORKDIR /app
# 프로젝트 파일 전체 복사
COPY . .
# 실행 권한 부여 및 빌드 (테스트 제외)
RUN chmod +x ./gradlew
RUN ./gradlew build -x test

# 2. 실행 스테이지: 빌드된 JAR만 실행 (이미지 용량 최적화)
FROM openjdk:17-jdk-slim
WORKDIR /app
# 빌드 스테이지에서 생성된 jar만 가져옴
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]