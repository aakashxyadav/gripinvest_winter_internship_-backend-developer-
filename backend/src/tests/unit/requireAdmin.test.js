import { jest } from '@jest/globals';
import { requireAdmin } from '../../middleware/auth.js';

describe('requireAdmin middleware', () => {
  it('rejects when not admin', () => {
    const req = { user: { role: 'user' } };
    const res = { statusCode: 0, status(c){ this.statusCode=c; return this; }, json: jest.fn() };
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
  it('passes when admin', () => {
    const req = { user: { role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
