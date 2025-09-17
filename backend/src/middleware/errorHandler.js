import { logger } from '../config/logger.js';
import { logTransaction } from '../utils/txLogger.js';

export function errorHandler(err, req, res, next) { // eslint-disable-line
  logger.error(err.message || 'Server error', { stack: err.stack });
  logTransaction({
    req,
    status: err.status || 500,
    error: err.message,
  }).catch(() => {});
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}
