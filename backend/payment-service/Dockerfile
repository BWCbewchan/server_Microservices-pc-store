FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
# RUN npm install
RUN npm ci
COPY . .
EXPOSE 4545
# CMD ["npm", "run", "dev"]
CMD ["npm", "start"]