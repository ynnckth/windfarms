FROM node:alpine

WORKDIR /app
EXPOSE 5001

COPY . .
RUN cd client && npm run build

WORKDIR /app/server

CMD ["npm", "start"]