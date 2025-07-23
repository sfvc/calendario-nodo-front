# Etapa de construcción
FROM node:22-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app


ARG VITE_API_URL
ARG VITE_TEMPLATE_URL
ARG VITE_CARBONE_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TEMPLATE_URL=$VITE_TEMPLATE_URL
ENV VITE_CARBONE_URL=$VITE_CARBONE_URL

# Copiar archivos de configuración e instalación de dependencias
# Copiar el resto del código
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa de construcción
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar un archivo de configuración de Nginx personalizado si es necesario
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto en el que se sirve la aplicación
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
