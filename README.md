# Proyecto 1: Deploy Web App con Docker + Nginx

## 🎯 Objetivo del Proyecto

Aprender containerización desde los fundamentos y entender cómo funcionan los reverse proxies en producción.

## 🧠 ¿Qué Aprenderás?

### Conceptos Core
1. **Containerización con Docker**
   - Qué es un contenedor vs una VM
   - Capas de imagen y cómo se construyen
   - Sistema de archivos overlay
   - Namespaces y cgroups

2. **Networking en Docker**
   - Bridge networks
   - Comunicación inter-contenedor
   - Port mapping y exposición
   - DNS interno de Docker

3. **Reverse Proxy con Nginx**
   - ¿Qué es un reverse proxy?
   - Load balancing
   - Headers y forwarding
   - SSL/TLS termination

4. **Docker Compose**
   - Orquestación multi-contenedor
   - Dependencies entre servicios
   - Volumes y persistencia
   - Variables de entorno

## 📋 Requisitos Previos

- Docker instalado
- Docker Compose instalado
- Editor de código
- Terminal

Verifica tu instalación:
```bash
docker --version
docker compose version
```

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────────────────────────────┐
│           Internet (Port 80)            │
└──────────────────┬──────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Nginx Container │
         │  (Reverse Proxy) │
         └────────┬─────────┘
                  │
                  │ Docker Network
                  │ (app:3000)
                  ▼
         ┌─────────────────┐
         │   App Container  │
         │   (Node.js/Py)   │
         └──────────────────┘
```

## 🚀 Quick Start

```bash
# 1. Construir las imágenes
docker compose build

# 2. Levantar los servicios
docker compose up

# 3. Acceder a la app
# Abre tu navegador en http://localhost
```

## 📚 Estructura del Proyecto

```
project-1-docker-nginx/
├── README.md              # Esta guía
├── LEARNING.md            # Conceptos profundos explicados
├── CHALLENGES.md          # Ejercicios adicionales
├── TROUBLESHOOTING.md     # Problemas comunes
├── app/                   # Aplicación web
│   ├── app.js            # Código de la aplicación
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf        # Configuración del reverse proxy
└── docker-compose.yml    # Orquestación de servicios
```

## 🎓 Ruta de Aprendizaje

### Fase 1: Entender la App Base (15 min)
- [ ] Lee y entiende el código de la aplicación
- [ ] Ejecuta la app sin Docker primero
- [ ] Entiende qué hace cada archivo

### Fase 2: Containerizar (30 min)
- [ ] Estudia el Dockerfile línea por línea
- [ ] Construye la imagen manualmente
- [ ] Ejecuta el contenedor sin docker-compose
- [ ] Inspecciona el contenedor corriendo

### Fase 3: Añadir Nginx (30 min)
- [ ] Entiende la configuración de Nginx
- [ ] Configura el reverse proxy
- [ ] Entiende proxy_pass y headers
- [ ] Prueba la comunicación

### Fase 4: Docker Compose (20 min)
- [ ] Orquesta ambos servicios
- [ ] Configura la red Docker
- [ ] Maneja dependencies
- [ ] Prueba el sistema completo

### Fase 5: Mejoras (opcional)
- [ ] Añade HTTPS con Let's Encrypt
- [ ] Implementa health checks
- [ ] Añade logs estructurados
- [ ] Multi-stage builds

## 🧪 Comandos Útiles para Aprender

```bash
# Ver imágenes construidas
docker images

# Ver contenedores corriendo
docker ps

# Ver logs de un servicio
docker compose logs app
docker compose logs nginx

# Inspeccionar un contenedor
docker inspect <container_id>

# Ejecutar shell dentro del contenedor
docker exec -it <container_id> /bin/sh

# Ver redes Docker
docker network ls
docker network inspect project-1-docker-nginx_default

# Reconstruir sin caché (para ver cada paso)
docker compose build --no-cache
```

## 💡 Preguntas para Reflexionar

Después de completar el proyecto, deberías poder responder:

1. ¿Por qué usamos un reverse proxy en lugar de exponer la app directamente?
2. ¿Qué sucede si el contenedor de la app se reinicia? ¿Nginx lo encuentra?
3. ¿Cómo se comunican los contenedores entre sí?
4. ¿Qué información pierde el servidor de la app cuando está detrás de Nginx?
5. ¿Qué pasa con los datos cuando detenemos los contenedores?

## 🎯 Criterios de Éxito

Has completado este proyecto cuando:

- ✅ Puedes acceder a tu app a través de Nginx en el puerto 80
- ✅ Entiendes cada línea del Dockerfile
- ✅ Puedes explicar cómo funciona el reverse proxy
- ✅ Sabes leer los logs y hacer troubleshooting
- ✅ Puedes modificar la configuración sin romper nada

## 🚀 Siguiente Paso

Una vez domines esto, estarás listo para el **Proyecto 2: CI/CD Pipeline**, donde automatizaremos el deployment de esta aplicación.

---

**📖 Para explicaciones detalladas de conceptos, ve a [LEARNING.md](./LEARNING.md)**