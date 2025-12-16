const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para logging - aprenderás sobre esto
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Health check endpoint - útil para monitoring
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta principal
app.get('/', (req, res) => {
    const responseData = {
        message: '🚀 ¡Bienvenido a tu primer proyecto DevOps!',
        project: 'Proyecto 1: Docker + Nginx',
        concepts: [
            'Containerización con Docker',
            'Reverse Proxy con Nginx',
            'Networking entre contenedores',
            'Orquestación con Docker Compose'
        ],
        serverInfo: {
            hostname: require('os').hostname(),
            platform: process.platform,
            nodeVersion: process.version,
            pid: process.pid
        },
        requestInfo: {
            // Estos headers son añadidos por Nginx
            realIP: req.headers['x-real-ip'] || 'No proxy detected',
            forwardedFor: req.headers['x-forwarded-for'] || 'Not set',
            forwardedProto: req.headers['x-forwarded-proto'] || 'Not set',
            host: req.headers['host'],
            userAgent: req.headers['user-agent']
        },
        nextSteps: [
            '1. Verifica los logs: docker compose logs -f',
            '2. Inspecciona los contenedores: docker ps',
            '3. Prueba el health check: curl http://localhost/health',
            '4. Modifica este código y ve hot reload en acción (con volumes)'
        ]
    };

    res.status(200).json(responseData);
});

// Endpoint para demostrar diferentes códigos de estado
app.get('/status/:code', (req, res) => {
    const statusCode = parseInt(req.params.code);
    res.status(statusCode).json({
        requestedStatus: statusCode,
        message: `Respondiendo con código ${statusCode}`
    });
});

// Endpoint para simular carga (útil para testing)
app.get('/load', (req, res) => {
    const delay = parseInt(req.query.delay) || 0;
    const cpu = parseInt(req.query.cpu) || 0;

    // Simula CPU intensivo
    if (cpu > 0) {
        const start = Date.now();
        while (Date.now() - start < cpu) {
            Math.sqrt(Math.random());
        }
    }

    // Simula latencia
    setTimeout(() => {
        res.json({
            message: 'Load test completed',
            delay: delay,
            cpuTime: cpu
        });
    }, delay);
});

// Endpoint para información del sistema
app.get('/info', (req, res) => {
    const os = require('os');
    res.json({
        system: {
            hostname: os.hostname(),
            platform: os.platform(),
            architecture: os.arch(),
            cpus: os.cpus().length,
            totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            uptime: `${(os.uptime() / 60 / 60).toFixed(2)} hours`
        },
        process: {
            pid: process.pid,
            nodeVersion: process.version,
            uptime: `${(process.uptime() / 60).toFixed(2)} minutes`,
            memoryUsage: process.memoryUsage()
        },
        secret: {
            databaseUrl: process.env.DATABASE_URL || 'No secret found'
        }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `La ruta ${req.url} no existe`,
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /info',
            'GET /status/:code',
            'GET /load?delay=1000&cpu=500'
        ]
    });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 Servidor iniciado exitosamente!');
    console.log('='.repeat(50));
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Escuchando en todas las interfaces (0.0.0.0)`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💻 Node.js: ${process.version}`);
    console.log(`📦 PID: ${process.pid}`);
    console.log('='.repeat(50));
    console.log('\n📚 Endpoints disponibles:');
    console.log('  - GET  /           → Información del proyecto');
    console.log('  - GET  /health     → Health check');
    console.log('  - GET  /info       → Información del sistema');
    console.log('  - GET  /status/:code → Test diferentes HTTP status');
    console.log('  - GET  /load       → Simular carga (query params: delay, cpu)');
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Recibido SIGTERM, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Recibido SIGINT, cerrando servidor...');
    process.exit(0);
});