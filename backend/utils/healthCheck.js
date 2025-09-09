// backend/utils/healthCheck.js
import mongoose from 'mongoose';

/**
 * Comprehensive health check for the application
 */
export const getHealthStatus = async () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };

  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    health.services.mongodb = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStates[dbState] || 'unknown',
      database: mongoose.connection.name || 'unknown'
    };

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.services.memory = {
      status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB threshold
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };

    // Overall status
    const unhealthyServices = Object.values(health.services).filter(
      service => service.status === 'unhealthy'
    );
    
    if (unhealthyServices.length > 0) {
      health.status = 'unhealthy';
    } else {
      const warningServices = Object.values(health.services).filter(
        service => service.status === 'warning'
      );
      if (warningServices.length > 0) {
        health.status = 'warning';
      }
    }

  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
  }

  return health;
};

/**
 * Simple health check for load balancers
 */
export const getSimpleHealth = () => {
  return {
    ok: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  };
};
