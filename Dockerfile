FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-slim

ENV TZ="Europe/Paris"

WORKDIR /app

COPY --from=builder /app .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

CMD [ "node", "./dist/index.js" ]
