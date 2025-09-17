import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { db } from './config/db.js';
import { logger, requestLogger } from './config/logger.js';
import { txMiddleware } from './middleware/txMiddleware.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import investmentRoutes from './routes/investments.js';
import logRoutes from './routes/logs.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(requestLogger);
app.use(txMiddleware);

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'ok', db: 'up' });
  } catch (e) {
    return res.status(500).json({ status: 'error', db: 'down', error: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/logs', logRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`Backend running on port ${PORT}`));
