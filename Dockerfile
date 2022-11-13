FROM node:16.15.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./moresapigateway .

RUN npm install

EXPOSE 3000
CMD [ "node", "index.js" ]