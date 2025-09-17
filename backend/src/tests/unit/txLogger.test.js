import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/logModel.js', () => ({
  logModel: {
    log: jest.fn().mockResolvedValue({}),
  },
}));

const { logModel } = await import('../../models/logModel.js');
const { wrapRoute } = await import('../../utils/txLogger.js');

function makeReqRes() {
  const req = { originalUrl: '/x', method: 'GET', body: {}, headers: {} };
  const res = { statusCode: 200, status(c){ this.statusCode=c; return this; }, json: jest.fn(), end: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

describe('txLogger.wrapRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logs success', async () => {
    const { req, res, next } = makeReqRes();
    const handler = jest.fn(async (req, res) => { res.status(201).json({ ok: true }); });
    const wrapped = wrapRoute(handler);
    await wrapped(req, res, next);
    expect(logModel.log).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('logs error and calls next', async () => {
    const { req, res, next } = makeReqRes();
    const handler = jest.fn(async () => { const e = new Error('boom'); e.status = 400; throw e; });
    const wrapped = wrapRoute(handler);
    await wrapped(req, res, next);
    expect(logModel.log).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
