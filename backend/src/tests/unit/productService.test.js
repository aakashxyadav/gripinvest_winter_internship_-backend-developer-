import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/productModel.js', () => ({
  productModel: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.unstable_mockModule('../../models/userModel.js', () => ({
  userModel: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule('../../utils/ai.js', () => ({
  generateProductDescription: jest.fn(() => 'desc'),
  generateProductDescriptionSmart: jest.fn(() => Promise.resolve('desc smart')),
  recommendProducts: jest.fn((products) => products.slice(0,2)),
  recommendProductsSmart: jest.fn(() => Promise.resolve(null)),
  productExplainerSmart: jest.fn(() => Promise.resolve({ summary: 's', reasons: ['r1','r2'] })),
}));

const { productModel } = await import('../../models/productModel.js');
const { userModel } = await import('../../models/userModel.js');
const ai = await import('../../utils/ai.js');
const { productService } = await import('../../services/productService.js');

const db = {};

describe('productService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('create generates description and persists', async () => {
    const user = { id: 'u1' };
    const data = { name: 'P', type: 'bond', risk: 'low', tenure_months: 12, expected_annual_yield: 10 };
    await productService.create(db, user, data);
    expect(ai.generateProductDescriptionSmart).toHaveBeenCalled();
    expect(productModel.create).toHaveBeenCalled();
  });

  it('recommendations prefer smart then fallback', async () => {
    const products = [{ id: '1', risk: 'low' }, { id: '2', risk: 'moderate' }];
    productModel.list.mockResolvedValue(products);
    userModel.findById.mockResolvedValue({ id: 'u1', risk_appetite: 'low' });
    const res = await productService.recommendations(db, { id: 'u1' });
    expect(res.length).toBeGreaterThan(0);
  });

  it('explainer returns AI summary and reasons', async () => {
    productModel.get.mockResolvedValue({ id: 'p1', name: 'Bond', risk: 'low' });
    userModel.findById.mockResolvedValue({ id: 'u1', risk_appetite: 'moderate' });
    const out = await productService.explainer(db, 'p1', { id: 'u1' });
    expect(out.product_id).toBe('p1');
    expect(out.summary).toBe('s');
    expect(out.reasons.length).toBe(2);
  });
});
