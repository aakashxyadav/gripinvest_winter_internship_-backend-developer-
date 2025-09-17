import { logTransaction } from '../utils/txLogger.js';

export function txMiddleware(req, res, next) {
  const origEnd = res.end;
  let finished = false;
  res.end = function (...args) {
    if (!finished) {
      finished = true;
      // If a route handler already logged, it can set req._txLogged = true
      if (!req._txLogged) {
        // statusCode may not be final yet, schedule microtask
        queueMicrotask(() => {
          logTransaction({ req, status: res.statusCode }).catch(() => {});
        });
      }
    }
    return origEnd.apply(this, args);
  };
  next();
}
