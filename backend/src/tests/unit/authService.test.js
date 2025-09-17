import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock userModel before importing the module under test
jest.unstable_mockModule('../../models/userModel.js', () => ({
  userModel: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    setOTP: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

// Now import mocked module and the SUT
const { userModel } = await import('../../models/userModel.js');
const { authService } = await import('../../services/authService.js');

// Create a fake db
const db = {};

jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash');
jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
jest.spyOn(jwt, 'sign').mockReturnValue('token');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signup creates user and returns token + hints', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    userModel.create.mockResolvedValue({});
    const out = await authService.signup(db, { email: 'a@b.com', password: 'StrongP@ssw0rd!' });
    expect(userModel.create).toHaveBeenCalled();
    expect(out.token).toBe('token');
    expect(out.user.email).toBe('a@b.com');
    expect(Array.isArray(out.ai.passwordHints)).toBe(true);
  });

  it('login validates credentials and returns token', async () => {
    userModel.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', password_hash: 'hash', risk_appetite: 'moderate', role: 'user' });
    const out = await authService.login(db, { email: 'a@b.com', password: 'x' });
    expect(out.token).toBe('token');
    expect(out.user.id).toBe('u1');
  });

  it('requestReset sets OTP and returns ok', async () => {
    userModel.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    userModel.setOTP.mockResolvedValue({});
    const out = await authService.requestReset(db, { email: 'a@b.com' });
    expect(out.ok).toBe(true);
    expect(userModel.setOTP).toHaveBeenCalled();
  });

  it('resetPassword updates hash and clears otp', async () => {
    const now = new Date(Date.now() + 60_000).toISOString();
    userModel.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', otp_code: '123456', otp_expires_at: now });
    userModel.updatePassword.mockResolvedValue({});
    userModel.setOTP.mockResolvedValue({});
    const out = await authService.resetPassword(db, { email: 'a@b.com', code: '123456', newPassword: 'NewStrongP@ss1' });
    expect(out.ok).toBe(true);
    expect(userModel.updatePassword).toHaveBeenCalled();
    expect(userModel.setOTP).toHaveBeenCalledWith(db, 'u1', null, null);
  });
});
