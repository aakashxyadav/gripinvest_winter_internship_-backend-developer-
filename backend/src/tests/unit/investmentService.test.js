import { jest } from '@jest/globals';

// Mock models before importing SUT
jest.unstable_mockModule('../../models/productModel.js', () => ({
  productModel: {
    get: jest.fn(),
  },
}));

jest.unstable_mockModule('../../models/investmentModel.js', () => ({
  investmentModel: {
    getWallet: jest.fn(),
    create: jest.fn(),
    updateWallet: jest.fn(),
    listByUser: jest.fn(),
  },
}));

const { productModel } = await import('../../models/productModel.js');
const { investmentModel } = await import('../../models/investmentModel.js');
const { investmentService } = await import('../../services/investmentService.js');

const db = {};

describe('investmentService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects if product not found', async () => {
    productModel.get.mockResolvedValue(null);
    await expect(investmentService.invest(db, { id: 'u1' }, { product_id: 'p1', amount: 1000 }))
      .rejects.toThrow('Product not found');
  });

  it('validates min/max amounts', async () => {
    productModel.get.mockResolvedValue({ id: 'p1', min_investment: 1000, max_investment: 2000, annual_yield: 12, tenure_months: 12 });
    await expect(investmentService.invest(db, { id: 'u1' }, { product_id: 'p1', amount: 500 }))
      .rejects.toThrow('Amount must be between 1000.00 and 2000.00');
  });

  it('rejects when insufficient balance', async () => {
    productModel.get.mockResolvedValue({ id: 'p1', min_investment: 100, max_investment: 10000, annual_yield: 12, tenure_months: 12 });
    investmentModel.getWallet.mockResolvedValue({ user_id: 'u1', balance: 50 });
    await expect(investmentService.invest(db, { id: 'u1' }, { product_id: 'p1', amount: 100 }))
      .rejects.toThrow('Insufficient balance');
  });

  it('creates investment and updates wallet', async () => {
    productModel.get.mockResolvedValue({ id: 'p1', min_investment: 100, max_investment: 10000, annual_yield: 12, tenure_months: 12 });
    investmentModel.getWallet.mockResolvedValue({ user_id: 'u1', balance: 1000 });
    investmentModel.create.mockResolvedValue({});
    investmentModel.updateWallet.mockResolvedValue({});
    const out = await investmentService.invest(db, { id: 'u1' }, { product_id: 'p1', amount: 600 });
    expect(out.amount).toBe(600);
    expect(out.expected_return).toBeCloseTo(600 * 0.12);
    expect(investmentModel.updateWallet).toHaveBeenCalled();
  });

  it('myInvestments returns list and insights', async () => {
    const list = [
      { amount: 1000, risk: 'low', expected_return: 100, annual_yield: 10, name: 'A' },
      { amount: 2000, risk: 'high', expected_return: 300, annual_yield: 15, name: 'B' },
    ];
    investmentModel.listByUser.mockResolvedValue(list);
    const res = await investmentService.myInvestments(db, { id: 'u1' });
    expect(res.list.length).toBe(2);
    expect(res.insights.total).toBe(3000);
  });
});
