import { db } from '../config/db.js';
import { authService } from '../services/authService.js';
import { wrapRoute } from '../utils/txLogger.js';

export default {
  signup: wrapRoute(async (req, res) => {
    const { email, password, risk_appetite, full_name, phone, profile_photo_url } = req.body;
    const result = await authService.signup(db, { email, password, risk_appetite, full_name, phone, profile_photo_url });
    res.status(201).json(result);
  }),
  login: wrapRoute(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(db, { email, password });
    res.json(result);
  }),
  requestReset: wrapRoute(async (req, res) => {
    const { email } = req.body;
    const result = await authService.requestReset(db, { email });
    res.json(result);
  }),
  reset: wrapRoute(async (req, res) => {
    const { email, code, newPassword } = req.body;
    const result = await authService.resetPassword(db, { email, code, newPassword });
    res.json(result);
  }),
};
