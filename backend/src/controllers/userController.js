import { db } from '../config/db.js';
import { userService } from '../services/userService.js';
import { wrapRoute } from '../utils/txLogger.js';

export default {
  me: wrapRoute(async (req, res) => {
    const user = await userService.me(db, req.user.id);
    res.json({ id: user.id, email: user.email, risk_appetite: user.risk_appetite, role: user.role, full_name: user.full_name, first_name: user.first_name, last_name: user.last_name, phone: user.phone, profile_photo_url: user.profile_photo_url });
  }),
  updateRisk: wrapRoute(async (req, res) => {
    const { risk_appetite } = req.body;
    const user = await userService.updateRisk(db, req.user.id, risk_appetite);
    res.json({ id: user.id, email: user.email, risk_appetite: user.risk_appetite, role: user.role, full_name: user.full_name, first_name: user.first_name, last_name: user.last_name, phone: user.phone, profile_photo_url: user.profile_photo_url });
  }),
  updateProfile: wrapRoute(async (req, res) => {
    const { full_name, first_name, last_name, phone, profile_photo_url, risk_appetite } = req.body;
    const user = await userService.updateProfile(db, req.user.id, { full_name, first_name, last_name, phone, profile_photo_url, risk_appetite });
    res.json({ id: user.id, email: user.email, risk_appetite: user.risk_appetite, role: user.role, full_name: user.full_name, first_name: user.first_name, last_name: user.last_name, phone: user.phone, profile_photo_url: user.profile_photo_url });
  }),
  uploadPhoto: wrapRoute(async (req, res) => {
    const url = `/${req.file.path}`.replace(/\\/g, '/');
    const user = await userService.updateProfile(db, req.user.id, { profile_photo_url: url });
    res.json({ id: user.id, email: user.email, risk_appetite: user.risk_appetite, role: user.role, full_name: user.full_name, first_name: user.first_name, last_name: user.last_name, phone: user.phone, profile_photo_url: user.profile_photo_url });
  }),
};
