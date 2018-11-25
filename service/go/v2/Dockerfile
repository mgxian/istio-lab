FROM golang:1.11-alpine as builder
LABEL maintainer="will835559313@163.com"
COPY . /app
WORKDIR /app
RUN apk update && apk add git \
    && go get github.com/gin-gonic/gin \
    && go build

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/app .
EXPOSE 80
CMD ["./app"]