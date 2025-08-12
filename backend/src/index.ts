import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import routes
import appRoutes from './routes/apps';
import uploadRoutes from './routes/upload';
import { initDatabase } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Global database status
let databaseConnected = false;

// Middleware to check database connection
const checkDatabaseMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!databaseConnected && !req.path.includes('/health')) {
    return res.status(503).json({ 
      error: 'Database not available. Please install and configure PostgreSQL.',
      message: 'Service temporarily unavailable'
    });
  }
  next();
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database check middleware (disabled to allow fallback to mock data)
// app.use('/api', checkDatabaseMiddleware);

// Static files
const uploadsPath = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/apps', appRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: databaseConnected ? 'connected' : 'disconnected',
    message: databaseConnected ? 'All systems operational' : 'Database not available - install PostgreSQL to enable full functionality'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Try to initialize database, but don't fail if it's not available
    try {
      await initDatabase();
      console.log('Database initialized successfully');
    } catch (dbError: any) {
      console.warn('Database not available, starting without DB:', dbError.code || dbError.message);
      console.warn('Install and configure PostgreSQL to enable full functionality');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📝 API Docs: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
