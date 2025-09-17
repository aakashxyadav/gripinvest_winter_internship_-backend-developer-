import { db } from '../config/db.js';
import { logModel } from '../models/logModel.js';

export async function logTransaction({ req, status, error }) {
  const user_id = req.user?.id || null;
  const email = req.user?.email || req.body?.email || null;
  await logModel.log(db, {
    user_id,
    email,
    endpoint: req.originalUrl,
    method: req.method,
    status,
    error: error || null,
  });
}

export function wrapRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
      await logTransaction({ req, status: res.statusCode || 200 });
      req._txLogged = true;
    } catch (err) {
      await logTransaction({ req, status: err.status || 500, error: err.message });
      req._txLogged = true;
      next(err);
    }
  };
}
