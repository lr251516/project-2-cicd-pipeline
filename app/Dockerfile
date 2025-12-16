# ================================
# Dockerfile con Explicaciones
# ================================
# Este Dockerfile construye una imagen para nuestra aplicación Node.js
# Cada línea está comentada para que entiendas exactamente qué hace

# --- STAGE: Base Image ---
# FROM especifica la imagen base desde la cual construimos
# node:18-alpine = Node.js v18 sobre Alpine Linux (distribución minimalista ~5MB)
# ¿Por qué Alpine? Es extremadamente ligera, perfecta para contenedores
FROM node:18-alpine

# Instalar wget para health checks
# Alpine usa 'apk' como package manager (no apt-get)
RUN apk add --no-cache wget

# LABEL añade metadata a la imagen (buena práctica para documentación)
LABEL maintainer="lucasro01@gmail.com"
LABEL description="DevOps Learning App - Proyecto 1"
LABEL version="1.0"

# --- STAGE: Setup Working Directory ---
# WORKDIR crea y establece el directorio de trabajo dentro del contenedor
# Todos los comandos siguientes se ejecutarán en /app
# Si el directorio no existe, Docker lo crea automáticamente
WORKDIR /app

# --- STAGE: Dependencies Installation ---
# COPY copia archivos desde tu máquina (contexto de build) al contenedor
# Primero copiamos solo package*.json (package.json y package-lock.json)
# ¿Por qué solo estos archivos primero? Para aprovechar el CACHE de Docker
# Si solo cambia el código (no las dependencias), Docker reutiliza esta capa
COPY package*.json ./

# RUN ejecuta comandos durante la construcción de la imagen
# 1. Instalamos dependencias de la app
RUN npm install

# 2. Instalamos nodemon globalmente para hot reload
RUN npm install -g nodemon

# Limpiar cache de npm para reducir tamaño de imagen
RUN npm cache clean --force

# --- STAGE: Copy Application Code ---
# Ahora copiamos el resto del código
# Esto se hace DESPUÉS de npm install para aprovechar cache
# Si cambias app.js pero no package.json, Docker solo reconstruye desde aquí
COPY . .

# --- STAGE: Fix Permissions ---
# IMPORTANTE: Cambiar ownership de todos los archivos al usuario 'node'
# Esto es necesario porque los archivos copiados pertenecen a root por defecto
# Sin esto, el usuario 'node' no podría leer/escribir los archivos
RUN chown -R node:node /app

# --- STAGE: Configuration ---
# ENV establece variables de entorno que estarán disponibles en el contenedor
ENV NODE_ENV=development
ENV PORT=3000

# EXPOSE documenta qué puerto usará el contenedor
# ⚠️ IMPORTANTE: EXPOSE NO publica el puerto, solo es documentación
# El puerto real se publica en docker-compose.yml o con -p en docker run
EXPOSE 3000

# --- STAGE: User Security ---
# Por seguridad, NO ejecutes aplicaciones como root
# Alpine ya incluye un usuario 'node' que podemos usar
# Esto previene que procesos en el contenedor tengan privilegios de root
USER node

# --- STAGE: Health Check ---
# HEALTHCHECK le dice a Docker cómo verificar si el contenedor está saludable
# Docker ejecutará este comando cada 30s
# Si falla 3 veces consecutivas, marca el contenedor como unhealthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# --- STAGE: Startup Command ---
# CMD define el comando por defecto cuando el contenedor inicia
# Usamos nodemon para iniciar la app y vigilar cambios
# -L es legacy watch, a veces necesario en Docker con algunos sistemas de archivos, pero probemos sin él primero o con.
# Lo estándar: nodemon app.js
CMD ["nodemon", "app.js"]

# ================================
# ALTERNATIVAS Y MEJORAS
# ================================

# Multi-stage build (para apps que necesitan compilación):
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
#
# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY package*.json ./
# RUN npm ci --only=production
# CMD ["node", "dist/index.js"]

# Para desarrollo con hot reload:
# RUN npm install -g nodemon
# CMD ["nodemon", "app.js"]

# ================================
# COMANDOS ÚTILES
# ================================
# Construir imagen:
#   docker build -t devops-app:latest .
#
# Construir sin cache (ver cada paso):
#   docker build --no-cache -t devops-app:latest .
#
# Ver capas de la imagen:
#   docker history devops-app:latest
#
# Inspeccionar la imagen:
#   docker inspect devops-app:latest
#
# Ejecutar contenedor:
#   docker run -p 3000:3000 devops-app:latest
#
# Ejecutar con variables de entorno:
#   docker run -p 3000:3000 -e NODE_ENV=development devops-app:latest
#
# Ejecutar en modo interactivo:
#   docker run -it -p 3000:3000 devops-app:latest sh
# ================================

# Multi-stage build (para apps que necesitan compilación):
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
#
# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY package*.json ./
# RUN npm ci --only=production
# CMD ["node", "dist/index.js"]

# Para desarrollo con hot reload:
# RUN npm install -g nodemon
# CMD ["nodemon", "app.js"]

# ================================
# COMANDOS ÚTILES
# ================================
# Construir imagen:
#   docker build -t devops-app:latest .
#
# Construir sin cache (ver cada paso):
#   docker build --no-cache -t devops-app:latest .
#
# Ver capas de la imagen:
#   docker history devops-app:latest
#
# Inspeccionar la imagen:
#   docker inspect devops-app:latest
#
# Ejecutar contenedor:
#   docker run -p 3000:3000 devops-app:latest
#
# Ejecutar con variables de entorno:
#   docker run -p 3000:3000 -e NODE_ENV=development devops-app:latest
#
# Ejecutar en modo interactivo:
#   docker run -it -p 3000:3000 devops-app:latest sh