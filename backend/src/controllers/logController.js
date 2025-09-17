import { db } from '../config/db.js';
import { logService } from '../services/logService.js';
import { wrapRoute } from '../utils/txLogger.js';

export default {
  me: wrapRoute(async (req, res) => {
    const result = await logService.me(db, req.user);
    res.json(result);
  }),
  byUser: wrapRoute(async (req, res) => {
    const { q } = req.query || {};
    const result = await logService.byUser(db, q);
    res.json(result);
  }),
  all: wrapRoute(async (req, res) => {
    const rows = await logService.all(db, 500);
    res.json(rows);
  }),
};
