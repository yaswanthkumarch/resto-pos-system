import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/resto_pos',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'resto_pos',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  upload: {
    path: process.env.UPLOAD_PATH || 'uploads/',
    maxFileSize: process.env.MAX_FILE_SIZE || '5MB',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10), // Increased for development
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  
  sync: {
    interval: parseInt(process.env.SYNC_INTERVAL || '15000', 10),
    queueSize: parseInt(process.env.OFFLINE_QUEUE_SIZE || '1000', 10),
  },
  
  store: {
    name: process.env.STORE_NAME || 'My Restaurant',
    address: process.env.STORE_ADDRESS || '123 Main St, City, State 12345',
    phone: process.env.STORE_PHONE || '+1234567890',
    email: process.env.STORE_EMAIL || 'contact@myrestaurant.com',
    currency: process.env.DEFAULT_CURRENCY || 'USD',
    taxRate: parseFloat(process.env.DEFAULT_TAX_RATE || '0.08'),
    timezone: process.env.DEFAULT_TIMEZONE || 'America/New_York',
  },
};

export default config; 