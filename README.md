# frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Deploying with docker

Change backend ip address and port in file main.js

Change env variables.

```sh
docker build -t sis-vsalome-frontend:v1 .
```

```sh
docker run -p 3002:80 sis-vsalome-frontend:v1
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
