import { jest } from '@jest/globals';

jest.unstable_mockModule('../../utils/txLogger.js', () => ({
  logTransaction: jest.fn().mockResolvedValue(undefined),
}));

const { logTransaction } = await import('../../utils/txLogger.js');
const { txMiddleware } = await import('../../middleware/txMiddleware.js');

function makeReqRes() {
  const req = { originalUrl: '/x', method: 'GET', body: {}, headers: {} };
  const res = {
    statusCode: 200,
    end: function () {},
  };
  const next = jest.fn();
  return { req, res, next };
}

async function flush() {
  await new Promise((r) => setImmediate(r));
}

describe('txMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wraps res.end and logs when response ends', async () => {
    const { req, res, next } = makeReqRes();
    txMiddleware(req, res, next);
    expect(typeof res.end).toBe('function');
    expect(next).toHaveBeenCalled();

    res.statusCode = 201;
    res.end();
    await flush();

    expect(logTransaction).toHaveBeenCalledTimes(1);
    const arg = logTransaction.mock.calls[0][0];
    expect(arg.req).toBe(req);
    expect(arg.status).toBe(201);
  });

  it('does not log if route already logged', async () => {
    const { req, res, next } = makeReqRes();
    req._txLogged = true;
    txMiddleware(req, res, next);
    res.end();
    await flush();
    expect(logTransaction).not.toHaveBeenCalled();
  });
});
