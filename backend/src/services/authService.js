import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { userModel } from '../models/userModel.js';
import { passwordStrengthHints, passwordStrengthHintsSmart } from '../utils/ai.js';

export const authService = {
  signup: async (db, { email, password, risk_appetite, full_name, first_name, last_name, phone, profile_photo_url }) => {
    const existing = await userModel.findByEmail(db, email);
    if (existing) {
      const err = new Error('Email already registered'); err.status = 400; throw err;
    }
    let hints;
    try {
      const res = await passwordStrengthHintsSmart(password);
      hints = res.hints;
    } catch (_) {
      hints = passwordStrengthHints(password).hints;
    }
    const id = uuidv4();
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 10);
    const hash = await bcrypt.hash(password, salt);
    const user = { id, email, password_hash: hash, risk_appetite: risk_appetite || 'moderate', role: 'user', full_name, first_name, last_name, phone, profile_photo_url };
    await userModel.create(db, user);
    const token = jwt.sign({ id, email, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return { token, user: { id, email, risk_appetite: user.risk_appetite, role: 'user', full_name: user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || null, phone: phone || null, profile_photo_url: profile_photo_url || null, first_name: user.first_name || null, last_name: user.last_name || null }, ai: { passwordHints: hints } };
  },
  login: async (db, { email, password }) => {
    const user = await userModel.findByEmail(db, email);
    if (!user) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email, risk_appetite: user.risk_appetite, role: user.role, full_name: user.full_name, phone: user.phone, profile_photo_url: user.profile_photo_url, first_name: user.first_name, last_name: user.last_name } };
  },
  requestReset: async (db, { email }) => {
    const user = await userModel.findByEmail(db, email);
    if (!user) return { ok: true }; // do not leak
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await userModel.setOTP(db, user.id, code, expiresAt);
    // In a real app, send email. Here we return for demo.
    return { ok: true, otpPreview: code };
  },
  resetPassword: async (db, { email, code, newPassword }) => {
    const user = await userModel.findByEmail(db, email);
    if (!user || !user.otp_code) { const e = new Error('Invalid request'); e.status=400; throw e; }
    if (user.otp_code !== code || new Date(user.otp_expires_at) < new Date()) { const e=new Error('Invalid or expired OTP'); e.status=400; throw e; }
    let hints;
    try {
      const res = await passwordStrengthHintsSmart(newPassword);
      hints = res.hints;
    } catch (_) {
      hints = passwordStrengthHints(newPassword).hints;
    }
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 10);
    const hash = await bcrypt.hash(newPassword, salt);
    await userModel.updatePassword(db, user.id, hash);
    await userModel.setOTP(db, user.id, null, null);
    return { ok: true, ai: { passwordHints: hints } };
  },
};
