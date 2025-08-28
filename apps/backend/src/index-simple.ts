import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Simple configuration without complex imports
const corsConfig = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' as const }
};

// Security Middlewares
app.use(helmet(helmetConfig));
app.use(cors(corsConfig));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = process.env.USE_MOCK_DB === 'true' ? 'mock' : 'connected';
  console.log('🔧 Using mock database for development');
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    supabase: {
      url: process.env.SUPABASE_URL ? 'configured' : 'missing',
      anon_key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing',
      service_role: process.env.SUPABASE_SERVICE_ROLE ? 'configured' : 'missing'
    }
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'MCP Supabase Authentication Backend is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health',
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'POST /api/auth/forgot-password',
      'POST /api/auth/confirm-email',
      'POST /api/auth/refresh',
      'GET /api/auth/me'
    ]
  });
});

// Import auth routes only (simpler approach)
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Try /health or /api/test'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});