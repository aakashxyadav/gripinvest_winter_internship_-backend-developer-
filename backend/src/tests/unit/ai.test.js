import { passwordStrengthHints, generateProductDescription, recommendProducts, portfolioInsights, summarizeErrors, productReasonsHeuristic } from '../../utils/ai.js';

describe('utils/ai deterministic helpers', () => {
  it('passwordStrengthHints returns score and hints', () => {
    const res = passwordStrengthHints('weak');
    expect(res.score).toBeGreaterThan(0);
    expect(Array.isArray(res.hints)).toBe(true);
    expect(res.hints.length).toBeGreaterThan(0);
  });

  it('generateProductDescription composes description', () => {
    const txt = generateProductDescription({ name: 'Bond A', type: 'bond', risk: 'low', expected_annual_yield: 10, tenure_months: 12 });
    expect(txt).toMatch(/Bond A/);
    expect(txt).toMatch(/low-risk/);
    expect(txt).toMatch(/10%/);
  });

  it('recommendProducts respects risk appetite', () => {
    const products = [
      { id: '1', name: 'Low', risk: 'low', annual_yield: 8, tenure_months: 12 },
      { id: '2', name: 'High', risk: 'high', annual_yield: 15, tenure_months: 12 },
      { id: '3', name: 'Moderate', risk: 'moderate', annual_yield: 11, tenure_months: 12 },
    ];
    const recs = recommendProducts(products, 'low');
    expect(recs.every(p => ['low'].includes(String(p.risk).toLowerCase()))).toBe(true);
  });

  it('portfolioInsights calculates totals and summary', () => {
    const investments = [
      { amount: 1000, risk: 'low', expected_return: 100, annual_yield: 10, name: 'A' },
      { amount: 2000, risk: 'high', expected_return: 300, annual_yield: 15, name: 'B' },
    ];
    const out = portfolioInsights(investments);
    expect(out.total).toBe(3000);
    expect(out.expected).toBe(400);
    expect(out.summary).toMatch(/Total invested: ₹3000.00/);
  });

  it('summarizeErrors aggregates statuses', () => {
    const logs = [
      { status: 500 }, { status: 500 }, { status: 404 }, { status: 400 }, { status: 500 },
    ];
    const s = summarizeErrors(logs);
    expect(s).toMatch(/Errors: 5/);
    expect(s).toMatch(/500\(3\)/);
  });

  it('productReasonsHeuristic returns up to 3 reasons', () => {
    const reasons = productReasonsHeuristic({ risk: 'moderate', expected_annual_yield: 12, tenure_months: 10 }, 'moderate');
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.length).toBeLessThanOrEqual(3);
  });
});
