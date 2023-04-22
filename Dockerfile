FROM node:18

WORKDIR /usr/src/api_server

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
CMD [ "npm", "start", "dev" ]
