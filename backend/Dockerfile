FROM gradle:8.14-jdk21-alpine

WORKDIR /app

COPY . .

RUN gradle wrapper
RUN chmod +x gradlew
RUN ./gradlew build

CMD ["./gradlew", "run"]