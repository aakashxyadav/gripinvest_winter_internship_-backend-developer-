import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { auth } from '../../middleware/auth.js';

describe('auth middleware', () => {
  it('rejects missing token', () => {
    const req = { headers: {} };
    const res = { statusCode: 0, status(c){ this.statusCode=c; return this; }, json: jest.fn() };
    const next = jest.fn();
    auth(true)(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('accepts valid token', () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com', role: 'user' }, 'secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    process.env.JWT_SECRET = 'secret';
    auth(true)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.email).toBe('a@b.com');
  });
});
