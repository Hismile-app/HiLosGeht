import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';

dotenv.config({ path: path.join(__dirname, 'config', '.env') });
dotenv.config();

const app: Express = express();

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Root Health & Service Info
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    platform: 'Hi Los Geht (HLG) Heavy Machinery API',
    location: 'Meru, Kenya',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
