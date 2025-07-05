import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  path: string;
  method: string;
  duration: number;
  timestamp: Date;
  statusCode: number;
  userAgent?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    if (metric.duration > 1000) {
      logger.warn(`Slow request detected: ${metric.method} ${metric.path} took ${metric.duration}ms`);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageResponseTime() {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / this.metrics.length;
  }

  getSlowestRequests(limit = 10) {
    return this.metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getRequestsByPath() {
    const pathStats = new Map<string, { count: number; totalTime: number; avgTime: number }>();
    
    this.metrics.forEach(metric => {
      const existing = pathStats.get(metric.path) || { count: 0, totalTime: 0, avgTime: 0 };
      existing.count++;
      existing.totalTime += metric.duration;
      existing.avgTime = existing.totalTime / existing.count;
      pathStats.set(metric.path, existing);
    });

    return Array.from(pathStats.entries()).map(([path, stats]) => ({
      path,
      ...stats
    }));
  }

  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    performanceMonitor.recordMetric({
      path: req.path,
      method: req.method,
      duration,
      timestamp: new Date(),
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
    });

    return originalSend.call(this, data);
  };

  next();
};

export const getPerformanceStats = (req: Request, res: Response) => {
  const stats = {
    totalRequests: performanceMonitor.getMetrics().length,
    averageResponseTime: performanceMonitor.getAverageResponseTime(),
    slowestRequests: performanceMonitor.getSlowestRequests(),
    requestsByPath: performanceMonitor.getRequestsByPath(),
  };

  res.json({
    success: true,
    data: stats,
  });
}; 