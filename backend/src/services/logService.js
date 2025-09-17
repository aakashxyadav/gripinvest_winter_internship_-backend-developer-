import { logModel } from '../models/logModel.js';
import { summarizeErrors, summarizeErrorsSmart } from '../utils/ai.js';

export const logService = {
  me: async (db, user) => {
    const logs = await logModel.byUser(db, user.id);
    let ai;
    try { ai = await summarizeErrorsSmart(logs.filter(l => l.status >= 400)); } catch (_) { /* no-op */ }
    if (!ai) ai = summarizeErrors(logs.filter(l => l.status >= 400));
    return { logs, ai };
  },
  byUser: async (db, userIdOrEmail) => {
    const logs = await logModel.byUser(db, userIdOrEmail);
    let ai;
    try { ai = await summarizeErrorsSmart(logs.filter(l => l.status >= 400)); } catch (_) { /* no-op */ }
    if (!ai) ai = summarizeErrors(logs.filter(l => l.status >= 400));
    return { logs, ai };
  },
  all: async (db, limit) => logModel.all(db, limit || 500),
};
