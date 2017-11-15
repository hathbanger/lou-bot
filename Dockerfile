FROM node:latest

WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .

ARG port
ENV port=${LOU_PORT}

EXPOSE port
CMD [ "node", "index.js" ]