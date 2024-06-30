FROM node:lts-slim
COPY ./package.json ./package.json

RUN apt-get update -y && apt-get install -y openssl

RUN npm i

COPY . .
