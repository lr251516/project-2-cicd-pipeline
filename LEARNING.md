# 📚 Conceptos Profundos - Proyecto 1

Esta guía explica los conceptos fundamentales que aprenderás en este proyecto.

## 🐳 Docker & Containerización

### ¿Qué es un Contenedor Realmente?

Un contenedor NO es una VM ligera. Es un proceso aislado que corre en tu host.

**Diferencias clave:**

```
Virtual Machine:
┌─────────────────────────┐
│    App A    │   App B   │
├─────────────┼───────────┤
│   Guest OS  │  Guest OS │
├─────────────┴───────────┤
│       Hypervisor        │
├─────────────────────────┤
│        Host OS          │
└─────────────────────────┘

Container:
┌─────────────────────────┐
│   App A   │   App B     │
├───────────┼─────────────┤
│    Docker Engine        │
├─────────────────────────┤
│        Host OS          │
└─────────────────────────┘
```

**Los contenedores usan:**
1. **Namespaces** - Aíslan procesos, redes, sistemas de archivos
2. **Cgroups** - Limitan recursos (CPU, memoria, I/O)
3. **Union File System** - Capas de solo lectura + capa escribible

### Anatomía de una Imagen Docker

Las imágenes son capas de solo lectura apiladas:

```dockerfile
FROM node:18-alpine        # Capa 1: Sistema base (Alpine Linux + Node)
WORKDIR /app              # Capa 2: Metadata (no añade archivos)
COPY package*.json ./     # Capa 3: package.json + package-lock.json
RUN npm install           # Capa 4: node_modules instalados
COPY . .                  # Capa 5: Código de la aplicación
CMD ["npm", "start"]      # Metadata: comando por defecto
```

**¿Por qué capas?**
- **Caché:** Si package.json no cambia, reutiliza la capa 4
- **Espacio:** Imágenes comparten capas base
- **Velocidad:** Solo descarga/sube las capas que cambiaron

**Ver las capas:**
```bash
docker history <image_name>
```

### Sistema de Archivos en Contenedores

Cuando corres un contenedor:

```
┌─────────────────────────────┐
│  Capa Escribible (Container)│  ← Cambios del contenedor
├─────────────────────────────┤
│  Capa 5: Código de app      │  ← COPY . .
├─────────────────────────────┤
│  Capa 4: node_modules       │  ← npm install
├─────────────────────────────┤
│  Capa 3: package.json       │  ← COPY package*.json
├─────────────────────────────┤
│  Capa 2: /app dir           │  ← WORKDIR /app
├─────────────────────────────┤
│  Capa 1: Alpine + Node      │  ← FROM node:18-alpine
└─────────────────────────────┘
```

**Estrategia de capas para caché óptimo:**

```dockerfile
# ❌ MALO - Invalida caché cada vez que cambia el código
COPY . .
RUN npm install

# ✅ BUENO - Caché de npm install se preserva
COPY package*.json ./
RUN npm install
COPY . .
```

## 🌐 Networking en Docker

### Bridge Network (Default)

Cuando corres `docker compose up`, crea una red bridge:

```
Host Machine (tu computadora)
┌─────────────────────────────────────────────┐
│  Docker Bridge Network                      │
│  (project-1-docker-nginx_default)           │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │    nginx     │      │     app      │   │
│  │  172.18.0.2  │─────▶│  172.18.0.3  │   │
│  │  Port: 80    │      │  Port: 3000  │   │
│  └──────┬───────┘      └──────────────┘   │
│         │                                   │
└─────────┼───────────────────────────────────┘
          │
          │ Port mapping: 80:80
          ▼
    localhost:80
```

### DNS Interno de Docker

Docker incluye un servidor DNS embebido:

```yaml
# En docker-compose.yml
services:
  app:
    container_name: app
  nginx:
    depends_on:
      - app
```

**Cómo funciona:**
1. Nginx hace request a `http://app:3000`
2. Docker DNS resuelve `app` → `172.18.0.3`
3. Request llega al contenedor de la app

**Verifica el DNS:**
```bash
docker exec -it nginx ping app
# Debería resolver a la IP del contenedor app
```

### Port Mapping Explicado

```yaml
ports:
  - "80:80"    # host_port:container_port
```

```
                     ┌─────────────────┐
User Browser ───────▶│  localhost:80   │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │   Docker Host   │
                     │   iptables NAT  │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │ nginx:80 (cont) │
                     └─────────────────┘
```

**Tipos de exposición:**

```yaml
# Expuesto solo dentro de Docker network (NO accesible desde host)
expose:
  - "3000"

# Mapeado al host (accesible desde localhost)
ports:
  - "3000:3000"

# Puerto aleatorio en el host
ports:
  - "3000"  # Docker asigna puerto random tipo 32768
```

## 🔀 Nginx como Reverse Proxy

### ¿Qué es un Reverse Proxy?

**Forward Proxy (como VPN):**
```
Cliente → Proxy → Internet
(Cliente oculto del servidor)
```

**Reverse Proxy:**
```
Cliente → Proxy → Backend Server
(Servidor oculto del cliente)
```

### ¿Por Qué Usar Nginx?

1. **SSL/TLS Termination**
   - Nginx maneja HTTPS
   - Backend solo ve HTTP (más simple)

2. **Load Balancing**
   ```nginx
   upstream backend {
       server app1:3000;
       server app2:3000;
       server app3:3000;
   }
   ```

3. **Caché**
   - Respuestas estáticas cacheadas en Nginx
   - Reduce carga en el backend

4. **Compresión**
   - Nginx comprime respuestas (gzip)
   - Ahorra bandwidth

5. **Rate Limiting**
   ```nginx
   limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
   ```

6. **Seguridad**
   - Oculta detalles del backend
   - WAF (Web Application Firewall)
   - Headers de seguridad

### Configuración de Nginx Explicada

```nginx
server {
    listen 80;  # Escucha en puerto 80 (HTTP)

    # Este bloque maneja todas las rutas
    location / {
        # Proxy pass: reenvia requests a http://app:3000
        proxy_pass http://app:3000;

        # Preserve el Host header original
        proxy_set_header Host $host;

        # Añade la IP real del cliente (importante para logs)
        proxy_set_header X-Real-IP $remote_addr;

        # Añade toda la cadena de proxies
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Indica si fue HTTP o HTTPS
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**¿Por qué son importantes estos headers?**

Sin headers:
```
App ve:
- IP del cliente: 172.18.0.2 (IP de Nginx)
- Host: app:3000
```

Con headers:
```
App ve:
- X-Real-IP: 203.0.113.45 (IP real del usuario)
- Host: example.com
- X-Forwarded-Proto: https
```

### Configuraciones Avanzadas

**Static files serving:**
```nginx
location /static/ {
    alias /var/www/static/;
    expires 30d;  # Cache por 30 días
}

location /api/ {
    proxy_pass http://app:3000;
}
```

**Compression:**
```nginx
gzip on;
gzip_types text/plain text/css application/json;
gzip_min_length 1000;
```

## 🎼 Docker Compose Deep Dive

### Orden de Inicio

```yaml
services:
  nginx:
    depends_on:
      - app  # Docker inicia 'app' antes de 'nginx'
```

**⚠️ Advertencia:** `depends_on` solo espera que el contenedor inicie, NO que la app esté lista.

**Solución: Health checks**
```yaml
app:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 10s
    timeout: 3s
    retries: 3

nginx:
  depends_on:
    app:
      condition: service_healthy  # Espera a que app pase health check
```

### Volumes Explicados

**Tipos de volumes:**

1. **Named volume** (persistente)
   ```yaml
   volumes:
     - db_data:/var/lib/postgresql/data
   volumes:
     db_data:  # Define el volume
   ```

2. **Bind mount** (desarrollo)
   ```yaml
   volumes:
     - ./app:/app  # Sincroniza directorio local con contenedor
   ```

3. **Tmpfs mount** (temporal en RAM)
   ```yaml
   tmpfs:
     - /tmp
   ```

**¿Cuándo usar cada uno?**

- **Named volume:** Bases de datos, datos que deben persistir
- **Bind mount:** Desarrollo (hot reload), configs
- **Tmpfs:** Datos temporales, caches

### Variables de Entorno

```yaml
app:
  environment:
    - NODE_ENV=production
    - DB_HOST=postgres
  env_file:
    - .env  # Lee variables de archivo
```

**.env file:**
```bash
DB_PASSWORD=super_secret
API_KEY=xyz123
```

**⚠️ Seguridad:** NUNCA commitees `.env` a git!

```bash
# .gitignore
.env
```

## 🔍 Troubleshooting Mental Models

### Cuando algo falla, pregúntate:

1. **¿El contenedor está corriendo?**
   ```bash
   docker ps  # ¿Ves tu contenedor?
   ```

2. **¿La app dentro del contenedor está funcionando?**
   ```bash
   docker logs <container>
   docker exec -it <container> curl localhost:3000
   ```

3. **¿La red Docker está configurada?**
   ```bash
   docker network inspect <network_name>
   ```

4. **¿Los ports están mapeados correctamente?**
   ```bash
   docker ps  # Mira la columna PORTS
   ```

5. **¿Nginx puede alcanzar la app?**
   ```bash
   docker exec -it nginx curl http://app:3000
   ```

### Herramientas de Debugging

```bash
# Ver todos los logs en tiempo real
docker compose logs -f

# Inspeccionar configuración de Nginx
docker exec nginx cat /etc/nginx/conf.d/default.conf

# Ver procesos dentro del contenedor
docker exec <container> ps aux

# Estadísticas de recursos
docker stats

# Inspeccionar imagen (ver capas)
docker history <image>
```

## 🎯 Conceptos Clave para Memorizar

1. **Contenedores son procesos**, no VMs
2. **Las imágenes son inmutables** (capas de solo lectura)
3. **Docker usa DNS interno** para resolver nombres de servicio
4. **Nginx es un gateway** entre internet y tu app
5. **docker-compose.yml define infraestructura como código**
6. **Los datos en contenedores son efímeros** (sin volumes)

## 📖 Recursos para Profundizar

- Docker Documentation: https://docs.docker.com
- Nginx Beginner's Guide: http://nginx.org/en/docs/beginners_guide.html
- Docker Networking Deep Dive: https://docs.docker.com/network/

---

**Siguiente:** Practica con [CHALLENGES.md](./CHALLENGES.md) para solidificar estos conceptos.