# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm config set '@bit:registry' https://node.bit.dev
RUN npm install
# not working in production: RUN npm install --production
RUN npm audit fix
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/src/app/frsfe_dist/
COPY nginx.frsfe.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]