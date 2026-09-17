# ---- Этап 1: Сборка приложения ----
FROM maven:3.8.1-jdk-21 AS build
WORKDIR /app

# Копируем файлы проекта и собираем JAR
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# ---- Этап 2: Запуск приложения ----
FROM openjdk:21-jre-slim
WORKDIR /app

# Копируем собранный JAR-файл из первого этапа
COPY --from=build /app/target/*.jar app.jar

# Указываем порт, который слушает приложение
EXPOSE 8080

# Команда для запуска
ENTRYPOINT ["java","-jar","app.jar"]