
ARG NODE_VERSION=18-alpine

FROM node:${NODE_VERSION}

RUN npm install -g npm@latest

WORKDIR /app

COPY package*.json ./
COPY tsconfig.* ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]