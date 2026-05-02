require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const morgan = require('morgan');
const { Server } = require('socket.io');
const { createStore } = require('./data/store');
const { analyticsRoutes } = require('./routes/analytics');
const { authRoutes } = require('./routes/auth');
const { orderRoutes } = require('./routes/orders');
const { productRoutes } = require('./routes/products');

const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = new Set([
  clientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
};

async function start() {
  const store = await createStore();
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: [...allowedOrigins], methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }
  });

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, datastore: process.env.MONGODB_URI ? 'mongodb' : 'json-file' });
  });

  app.use('/api/auth', authRoutes());
  app.use('/api/products', productRoutes(store, io));
  app.use('/api/orders', orderRoutes(store, io));
  app.use('/api/analytics', analyticsRoutes(store));

  io.on('connection', (socket) => {
    socket.emit('socket:ready', { id: socket.id });
  });

  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || 'Something went wrong.' });
  });

  server.listen(port, () => {
    console.log(`Twenty Five API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
