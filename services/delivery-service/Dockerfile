FROM node:22-alpine

WORKDIR /app

RUN apk upgrade --no-cache

COPY package*.json ./
RUN npm install --omit=dev \
    && npm cache clean --force \
    && npm uninstall -g npm

COPY src ./src

EXPOSE 5002

USER 1000

CMD ["node", "src/index.js"]
