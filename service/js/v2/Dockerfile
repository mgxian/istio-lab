FROM node:8-alpine
LABEL maintainer="will835559313@163.com"
COPY . /app
WORKDIR /app
RUN npm i && npm run build \
    && rm -rf ./node_modules \
    && npm install -g serve
EXPOSE 80
CMD ["serve", "-s", "dist", "-p", "80"]
