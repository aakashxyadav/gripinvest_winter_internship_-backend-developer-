import { jest } from '@jest/globals';

jest.unstable_mockModule('../../config/logger.js', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

jest.unstable_mockModule('../../models/logModel.js', () => ({
  logModel: { log: jest.fn(() => Promise.resolve()) },
}));

const { errorHandler } = await import('../../middleware/errorHandler.js');

function makeReqRes() {
  const req = { originalUrl: '/x', method: 'GET', body: {}, headers: {} };
  const res = { statusCode: 200, status(c){ this.statusCode=c; return this; }, json: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

describe('errorHandler middleware', () => {
  it('logs error and responds with status', async () => {
    const { req, res, next } = makeReqRes();
    const err = new Error('boom');
    err.status = 418;
    await errorHandler(err, req, res, next);
    expect(res.statusCode).toBe(418);
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  });
});
