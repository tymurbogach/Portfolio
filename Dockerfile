# ETAPA 1: Construcción (Node.js compila el código)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar configuración de dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar resto del código fuente y compilar Astro
COPY . .
RUN npm run build

# ETAPA 2: Producción (Solo Nginx limpio)
FROM nginx:alpine

# Copiamos la web estática ya compilada
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos la configuración personalizada de Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
