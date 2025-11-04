const express = require('express');
const client = require('prom-client'); //  добавили библиотеку для метрик
const app = express();
const PORT = process.env.PORT || 3001;

// === Prometheus metrics setup ===
const register = new client.Registry();

// Собираем стандартные метрики Node.js (CPU, память, uptime)
client.collectDefaultMetrics({ register });

// Пример пользовательской метрики (можно удалить или изменить)
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestCounter);

// Middleware для подсчёта запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.path,
            status_code: res.statusCode,
        });
    });
    next();
});

// === Routes ===
app.get('/', (req, res) => {
    res.send('<h1>🚀 My AWS DevOps Web App</h1>');
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// 🧠 Новый маршрут для Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// === Start server ===
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
