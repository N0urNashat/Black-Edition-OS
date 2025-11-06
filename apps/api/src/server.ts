import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import leadsRoutes from './routes/leads.routes';
import customersRoutes from './routes/customers.routes';
import projectsRoutes from './routes/projects.routes';
import milestonesRoutes from './routes/milestones.routes';
import tasksRoutes from './routes/tasks.routes';
import timeTrackingRoutes from './routes/time-tracking.routes';
import settingsRoutes from './routes/settings.routes';
import invoicesRoutes from './routes/invoices.routes';
import meetingsRoutes from './routes/meetings.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import reportsRoutes from './routes/reports.routes';
import workflowsRoutes from './routes/workflows.routes';
import paymentRoutes from './routes/payment.routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/leads', leadsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', milestonesRoutes);
app.use('/api', tasksRoutes);
app.use('/api', timeTrackingRoutes);
app.use('/api', settingsRoutes);
app.use('/api', invoicesRoutes);
app.use('/api', meetingsRoutes);
app.use('/api', aiRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', reportsRoutes);
app.use('/api', workflowsRoutes);
app.use('/api/payments', paymentRoutes);

// API root
app.get('/api', (_req, res) => {
  res.json({
    message: 'BLACK EDITION OS API',
    version: '1.0.0',
    endpoints: {
      leads: '/api/leads',
      customers: '/api/customers',
      projects: '/api/projects',
      milestones: '/api/projects/:projectId/milestones',
      tasks: '/api/tasks',
      timeTracking: '/api/projects/:projectId/time-entries',
      invoices: '/api/invoices',
      meetings: '/api/meetings',
      ai: '/api/ai',
      analytics: '/api/analytics/dashboard',
      reports: '/api/reports',
      workflows: '/api/workflows',
      settings: '/api/settings/payment',
      payments: '/api/payments/paymob/checkout',
      health: '/health',
    },
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

export default app;
