FROM node:alpine

WORKDIR /app

EXPOSE 5000

COPY package*.json ./

RUN npm i

COPY . ./

RUN npm run build

CMD ["npm", "run", "start:prod"]
