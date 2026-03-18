FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3010

RUN chown -R node:node /usr/src/app
USER node

CMD ["npm", "run", "start", "--", "-p", "3010"]
