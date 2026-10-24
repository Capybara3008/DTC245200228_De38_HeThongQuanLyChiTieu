FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

# Biện pháp Hardening: Phân quyền và chạy container bằng user non-root (node)
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000
CMD ["npm", "start"]
