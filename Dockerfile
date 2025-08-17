FROM node

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5500 3000

CMD ["npm", "run", "start"]