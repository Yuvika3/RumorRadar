import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { connectDatabase, isMongoConnected } from './config/database';
import { MLClient } from './services/mlClient';
import datasetRoutes from './routes/datasetRoutes';
import experimentRoutes from './routes/experimentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import predictionRoutes from './routes/predictionRoutes';
import exportRoutes from './routes/exportRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory if needed
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  let mlHealth: any = { status: 'offline' };
  try {
    mlHealth = await MLClient.getHealth();
  } catch (err: any) {
    mlHealth = { status: 'unreachable', error: err.message };
  }

  res.json({
    status: 'healthy',
    service: 'RumorRadar Express Backend API',
    database: {
      connected: isMongoConnected,
      mode: isMongoConnected ? 'MongoDB' : 'Local Persistent Fallback Store'
    },
    mlService: mlHealth,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/datasets', datasetRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/export', exportRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server & Connect DB
async function bootstrap() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 RumorRadar Backend API running on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Datasets:     http://localhost:${PORT}/api/datasets`);
    console.log(`   Experiments:  http://localhost:${PORT}/api/experiments`);
    console.log(`====================================================`);
  });
}

bootstrap();

export default app;
