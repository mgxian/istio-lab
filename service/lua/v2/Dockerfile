FROM openresty/openresty:1.13.6.1-2-alpine
LABEL maintainer="will835559313@163.com"
COPY . /app
WORKDIR /app
EXPOSE 80
ENTRYPOINT ["/usr/local/openresty/bin/openresty", "-c", "/app/nginx.conf", "-g", "daemon off;"]