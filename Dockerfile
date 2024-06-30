FROM node:lts-slim
COPY ./package.json ./package.json

RUN npm i

COPY . .

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]