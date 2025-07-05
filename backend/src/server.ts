import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase } from './database/connection';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';
import { performanceMiddleware, getPerformanceStats } from './middleware/performance';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import customerRoutes from './routes/customers';
import tableRoutes from './routes/tables';
import dashboardRoutes from './routes/dashboard';
import syncRoutes from './routes/sync';
import configRoutes from './routes/config';

import { initWebSocketServer } from './websocket/server';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);
app.use(performanceMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/tables', authMiddleware, tableRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/sync', authMiddleware, syncRoutes);
app.use('/api/config', authMiddleware, configRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant POS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get('/api/performance', authMiddleware, getPerformanceStats);

app.use(errorHandler);

initWebSocketServer(server);

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('Database connected successfully');

    server.listen(config.port, () => {
      logger.info(`Server running on ${config.host}:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const shutdown = () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server shutdown complete');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer(); 