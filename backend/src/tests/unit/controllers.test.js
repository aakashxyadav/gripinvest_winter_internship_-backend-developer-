import { jest } from '@jest/globals';

// Mock wrapRoute to bypass DB logging
jest.unstable_mockModule('../../utils/txLogger.js', () => ({
  wrapRoute: (handler) => handler,
}));

jest.unstable_mockModule('../../services/authService.js', () => ({
  authService: {
    signup: jest.fn(() => Promise.resolve({ ok: true })),
    login: jest.fn(() => Promise.resolve({ ok: true })),
    requestReset: jest.fn(() => Promise.resolve({ ok: true })),
    resetPassword: jest.fn(() => Promise.resolve({ ok: true })),
  },
}));

jest.unstable_mockModule('../../services/investmentService.js', () => ({
  investmentService: {
    invest: jest.fn(() => Promise.resolve({ id: 'i1' })),
    myInvestments: jest.fn(() => Promise.resolve({ list: [] })),
  },
}));

jest.unstable_mockModule('../../services/productService.js', () => ({
  productService: {
    list: jest.fn(() => Promise.resolve([])),
    get: jest.fn(() => Promise.resolve({ id: 'p1' })),
    create: jest.fn(() => Promise.resolve({ id: 'p1' })),
    update: jest.fn(() => Promise.resolve({ id: 'p1' })),
    remove: jest.fn(() => Promise.resolve()),
    recommendations: jest.fn(() => Promise.resolve([])),
    explainer: jest.fn(() => Promise.resolve({ product_id: 'p1', summary: 's', reasons: [] })),
  },
}));

jest.unstable_mockModule('../../services/logService.js', () => ({
  logService: {
    me: jest.fn(() => Promise.resolve({ logs: [], ai: 'ok' })),
    byUser: jest.fn(() => Promise.resolve({ logs: [], ai: 'ok' })),
    all: jest.fn(() => Promise.resolve([])),
  },
}));

jest.unstable_mockModule('../../services/userService.js', () => ({
  userService: {
    me: jest.fn(() => Promise.resolve({ id: 'u1', email: 'a@b.com', risk_appetite: 'moderate', role: 'user', full_name: 'A', first_name: 'A', last_name: 'B', phone: '1', profile_photo_url: '/x.jpg' })),
    updateRisk: jest.fn(() => Promise.resolve({ id: 'u1', email: 'a@b.com', risk_appetite: 'high', role: 'user', full_name: 'A', first_name: 'A', last_name: 'B', phone: '1', profile_photo_url: '/x.jpg' })),
    updateProfile: jest.fn((_db, _id, data) => Promise.resolve({ id: 'u1', email: 'a@b.com', risk_appetite: data.risk_appetite || 'moderate', role: 'user', full_name: data.full_name || 'A', first_name: data.first_name || 'A', last_name: data.last_name || 'B', phone: data.phone || '1', profile_photo_url: data.profile_photo_url || '/x.jpg' })),
  },
}));

const { default: authController } = await import('../../controllers/authController.js');
const { default: investmentController } = await import('../../controllers/investmentController.js');
const { default: productController } = await import('../../controllers/productController.js');
const { default: logController } = await import('../../controllers/logController.js');
const { default: userController } = await import('../../controllers/userController.js');

function makeReqRes(body = {}, params = {}, user = { id: 'u1' }) {
  const req = { body, params, user, query: body.query || {} };
  const res = { statusCode: 200, status(c){ this.statusCode=c; return this; }, json: jest.fn() };
  return { req, res };
}

describe('controllers', () => {
  it('authController.signup responds 201', async () => {
    const { req, res } = makeReqRes({ email: 'a', password: 'b' });
    await authController.signup(req, res);
    expect(res.statusCode).toBe(201);
  });
  it('authController.login responds 200', async () => {
    const { req, res } = makeReqRes({ email: 'a', password: 'b' });
    await authController.login(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('authController.requestReset responds 200', async () => {
    const { req, res } = makeReqRes({ email: 'a' });
    await authController.requestReset(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('authController.reset responds 200', async () => {
    const { req, res } = makeReqRes({ email: 'a', code: '123456', newPassword: 'x' });
    await authController.reset(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('investmentController.invest responds 201', async () => {
    const { req, res } = makeReqRes({ product_id: 'p1', amount: 100 });
    await investmentController.invest(req, res);
    expect(res.statusCode).toBe(201);
  });

  it('productController.recommend returns 200', async () => {
    const { req, res } = makeReqRes();
    await productController.recommend(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('productController.list returns 200', async () => {
    const { req, res } = makeReqRes({ query: { type: 'bond', risk: 'low', yield: '8', yield_min: '5', yield_max: '10' } });
    await productController.list(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('productController.get returns 200 when found', async () => {
    const { req, res } = makeReqRes({}, { id: 'p1' });
    await productController.get(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('productController.get returns 404 when not found', async () => {
    const { default: productController2 } = await import('../../controllers/productController.js');
    const mod = await import('../../services/productService.js');
    mod.productService.get = jest.fn(() => Promise.resolve(null));
    const { req, res } = makeReqRes({}, { id: 'px' });
    await productController2.get(req, res);
    expect(res.statusCode).toBe(404);
  });
  it('productController.create responds 201', async () => {
    const { req, res } = makeReqRes({ name: 'N' });
    await productController.create(req, res);
    expect(res.statusCode).toBe(201);
  });
  it('productController.update responds 200', async () => {
    const { req, res } = makeReqRes({ name: 'N2' }, { id: 'p1' });
    await productController.update(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('productController.remove responds 200', async () => {
    const { req, res } = makeReqRes({}, { id: 'p1' });
    await productController.remove(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('productController.explainer returns 404 when null', async () => {
    const { default: productController2 } = await import('../../controllers/productController.js');
    const mod = await import('../../services/productService.js');
    mod.productService.explainer = jest.fn(() => Promise.resolve(null));
    const { req, res } = makeReqRes({}, { id: 'p1' });
    await productController2.explainer(req, res);
    expect(res.statusCode).toBe(404);
  });
  it('productController.explainer returns 200 when found', async () => {
    const mod = await import('../../services/productService.js');
    mod.productService.explainer = jest.fn(() => Promise.resolve({ product_id: 'p1' }));
    const { default: productController2 } = await import('../../controllers/productController.js');
    const { req, res } = makeReqRes({}, { id: 'p1' });
    await productController2.explainer(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('logController.me returns logs', async () => {
    const { req, res } = makeReqRes();
    await logController.me(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('logController.byUser returns logs', async () => {
    const { req, res } = makeReqRes({}, { id: 'u1' });
    await logController.byUser(req, res);
    expect(res.statusCode).toBe(200);
  });
  it('logController.all returns logs', async () => {
    const { req, res } = makeReqRes();
    await logController.all(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('userController.me returns user', async () => {
    const { req, res } = makeReqRes();
    await userController.me(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.json).toHaveBeenCalled();
  });
  it('userController.updateRisk returns updated user', async () => {
    const { req, res } = makeReqRes({ risk_appetite: 'high' });
    await userController.updateRisk(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.json).toHaveBeenCalled();
  });
  it('userController.updateProfile returns updated user', async () => {
    const { req, res } = makeReqRes({ full_name: 'Z', first_name: 'Z', last_name: 'Y', phone: '9', profile_photo_url: '/z.jpg', risk_appetite: 'low' });
    await userController.updateProfile(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.json).toHaveBeenCalled();
  });
  it('userController.uploadPhoto stores url and returns user', async () => {
    const mod = await import('../../services/userService.js');
    const { req, res } = makeReqRes();
    req.file = { path: 'uploads/a.jpg' };
    await userController.uploadPhoto(req, res);
    expect(res.statusCode).toBe(200);
    expect(mod.userService.updateProfile).toHaveBeenCalled();
    const lastCall = mod.userService.updateProfile.mock.calls[mod.userService.updateProfile.mock.calls.length - 1];
    const args = lastCall[2];
    // Controller prefixes with '/', so expect normalized value
    expect(args.profile_photo_url).toBe('/uploads/a.jpg');
  });
});
