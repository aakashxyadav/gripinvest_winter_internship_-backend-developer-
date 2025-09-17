import { v4 as uuidv4 } from 'uuid';
import { investmentModel } from '../models/investmentModel.js';
import { productModel } from '../models/productModel.js';
import { portfolioInsights, portfolioInsightsSmart } from '../utils/ai.js';

export const investmentService = {
  invest: async (db, user, { product_id, amount }) => {
    const product = await productModel.get(db, product_id);
    if (!product) { const e = new Error('Product not found'); e.status = 404; throw e; }
    amount = Number(amount);
    const min = Number(product.min_investment);
    const max = Number(product.max_investment ?? Number.MAX_SAFE_INTEGER);
    if (Number.isNaN(amount)) { const e = new Error('Invalid amount'); e.status = 400; throw e; }
    if (amount < min || amount > max) {
      const e = new Error(`Amount must be between ${min.toFixed(2)} and ${isFinite(max) ? max.toFixed(2) : '∞'}`); e.status = 400; throw e;
    }
    const wallet = await investmentModel.getWallet(db, user.id);
    if (!wallet || Number(wallet.balance) < amount) { const e = new Error('Insufficient balance'); e.status = 400; throw e; }
    const yieldPct = Number(product.annual_yield ?? product.expected_annual_yield);
    const tenureMonths = Number(product.tenure_months);
    const expected_return = amount * (yieldPct / 100) * (tenureMonths / 12);
    const id = uuidv4();
    // Set maturity date if tenure present
    let maturity_date = null;
    if (!Number.isNaN(tenureMonths) && tenureMonths > 0) {
      const d = new Date();
      d.setMonth(d.getMonth() + tenureMonths);
      maturity_date = d.toISOString().slice(0,10);
    }
    await investmentModel.create(db, { id, user_id: user.id, product_id, amount, expected_return, status: 'active', invested_at: new Date(), maturity_date });
    await investmentModel.updateWallet(db, user.id, Number(wallet.balance) - amount);
    return { id, product_id, amount, expected_return, maturity_date };
  },
  myInvestments: async (db, user) => {
    const list = await investmentModel.listByUser(db, user.id);
    try {
      const insights = await portfolioInsightsSmart(list);
      return { list, insights };
    } catch (_) {
      const insights = portfolioInsights(list);
      return { list, insights };
    }
  }
};
