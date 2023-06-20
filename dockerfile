# Fase de construcción
FROM node:14 AS build-stage

WORKDIR /app

COPY package.json .env ./

RUN npm install

COPY . .

# RUN npm run serve
RUN npm run build

# CMD ["npm", "run", "serve"]

# Fase de producción
FROM nginx:1.21-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
# COPY --from=build-stage . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
