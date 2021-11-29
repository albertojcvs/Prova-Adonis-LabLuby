FROM node:alpine

WORKDIR /usr/app

COPY package.json .
COPY yarn.lock .

RUN yarn

EXPOSE 3333

COPY . .

CMD [ "node","ace","serve","--watch" ]
