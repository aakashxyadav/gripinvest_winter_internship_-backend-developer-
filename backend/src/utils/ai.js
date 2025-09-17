// Local, deterministic "AI" helpers to avoid external dependencies. Replace with real LLMs later.

// Cohere toggle
let cohereClient = null;
const AI_MODE = process.env.AI_MODE || 'local';
const COHERE_KEY = process.env.COHERE_API_KEY;

function normalizeRisk(val) {
  if (!val) return null;
  const v = String(val).toLowerCase();
  if (v === 'medium') return 'moderate';
  return v;
}

async function getCohere() {
  if (AI_MODE !== 'cohere' || !COHERE_KEY) return null;
  if (cohereClient) return cohereClient;
  try {
    const { CohereClient } = await import('cohere-ai');
    cohereClient = new CohereClient({ token: COHERE_KEY });
    return cohereClient;
  } catch (e) {
    // Fallback silently
    return null;
  }
}

async function cohereChat(prompt) {
  try {
    const client = await getCohere();
    if (!client) return null;
    // Try chat endpoint; fall back to null on any error
    const resp = await client.chat({
      model: process.env.COHERE_MODEL || 'command',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    // Cohere SDK formats may vary; try to extract text
    const text = resp?.text || resp?.message?.content?.[0]?.text || resp?.output_text || '';
    return (text || '').trim() || null;
  } catch (e) {
    return null;
  }
}

// Try to obtain JSON from Cohere output robustly
async function cohereJSON(prompt) {
  const out = await cohereChat(prompt);
  if (!out) return null;
  // Extract first JSON object/array
  const start = out.indexOf('{') >= 0 ? out.indexOf('{') : out.indexOf('[');
  const endObj = out.lastIndexOf('}');
  const endArr = out.lastIndexOf(']');
  const end = Math.max(endObj, endArr);
  let txt = out;
  if (start >= 0 && end > start) txt = out.slice(start, end + 1);
  try {
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

export function passwordStrengthHints(password) {
  const hints = [];
  if (password.length < 12) hints.push('Use 12+ characters.');
  if (!/[A-Z]/.test(password)) hints.push('Add an uppercase letter.');
  if (!/[a-z]/.test(password)) hints.push('Add a lowercase letter.');
  if (!/\d/.test(password)) hints.push('Add a number.');
  if (!/[\W_]/.test(password)) hints.push('Add a special character.');
  return { score: Math.min(100, password.length * 6 + (/[A-Z]/.test(password) ? 10 : 0) + (/[\W_]/.test(password) ? 10 : 0)), hints };
}

// Cohere-first password hinting without sending the raw password (privacy-safe)
export async function passwordStrengthHintsSmart(password) {
  const base = passwordStrengthHints(password);
  const features = {
    length: password.length,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[\W_]/.test(password),
  };
  const prompt = `Given this password feature summary, return a JSON object with an array field \"hints\" of 2-4 short, actionable tips to improve strength. Do not include the actual password.\nFeatures: ${JSON.stringify(features)}\nReturn JSON like {\"hints\":["..."]}`;
  const json = await cohereJSON(prompt);
  const hints = Array.isArray(json?.hints) && json.hints.length ? json.hints.slice(0,4) : base.hints;
  return { score: base.score, hints };
}

function coalesceFields(fields) {
  return {
    name: fields.name,
    type: fields.type || fields.investment_type,
    risk: fields.risk || fields.risk_level,
    expected_annual_yield: fields.expected_annual_yield ?? fields.annual_yield,
    tenure_months: fields.tenure_months,
  };
}

export function generateProductDescription(fieldsIn) {
  const f = coalesceFields(fieldsIn);
  const risk = normalizeRisk(f.risk) || 'moderate';
  return `${f.name} is a ${risk}-risk ${f.type} opportunity targeting ~${f.expected_annual_yield}% annual yield over ${f.tenure_months} months. Diversify your portfolio with disciplined risk controls.`;
}

export async function generateProductDescriptionSmart(fieldsIn) {
  // Try Cohere; fallback to local deterministic
  const f = coalesceFields(fieldsIn);
  const prompt = `Write a concise, professional product description (2-3 sentences) for an alternative investment product.
Name: ${f.name}
Type: ${f.type}
Risk: ${normalizeRisk(f.risk) || 'moderate'}
Expected annual yield: ${f.expected_annual_yield}%
Tenure: ${f.tenure_months} months
Tone: Clear, compliant, non-promissory. Avoid guarantees.`;
  const co = await cohereChat(prompt);
  if (co) return co;
  return generateProductDescription(f);
}

// Cohere-first recommendation with deterministic fallback
export async function recommendProductsSmart(products, userRisk) {
  const userR = normalizeRisk(userRisk) || 'moderate';
  const compact = products.map(p => ({ id: p.id, name: p.name, risk: normalizeRisk(p.risk) || normalizeRisk(p.risk_level) || 'moderate', yield: Number((p.annual_yield ?? p.expected_annual_yield) || 0), tenure: Number(p.tenure_months || 0) }));
  const prompt = `You are a conservative financial assistant. Select up to 5 products suitable for a user with risk appetite = ${userR}. Prefer products at or below the user's risk appetite. If none are available, choose the closest higher risk. Rank by suitability and higher yield as a tiebreaker. Return JSON: {"ids":["product-id-1", ...]}. Input products: ${JSON.stringify(compact)}`;
  const json = await cohereJSON(prompt);
  const ids = Array.isArray(json?.ids) ? json.ids : null;
  if (!ids) return null;
  // Map ids back to product objects, preserving requested order
  const byId = new Map(products.map(p => [p.id, p]));
  const selected = ids.map(id => byId.get(id)).filter(Boolean);
  // If fewer than 5 returned, top up with any remaining using heuristic
  if (selected.length < 5) {
    const remaining = products.filter(p => !ids.includes(p.id));
    const topped = recommendProducts(remaining, userR);
    for (const p of topped) {
      if (selected.length >= 5) break;
      selected.push(p);
    }
  }
  return selected.slice(0,5);
}

export function recommendProducts(products, userRisk) {
  const riskOrder = { low: 1, medium: 2, moderate: 2, high: 3 };
  const target = riskOrder[normalizeRisk(userRisk)] || 2;
  // Strictly prefer products at or below the user's risk appetite.
  const within = products.filter(p => (riskOrder[normalizeRisk(p.risk)] || riskOrder[normalizeRisk(p.risk_level)] || 2) <= target);
  const scoreWithin = (p) => {
    const pr = (riskOrder[normalizeRisk(p.risk)] || riskOrder[normalizeRisk(p.risk_level)] || 2);
    // closer to target (but not above) gets higher base; then higher yield
    return (10 - (target - pr)) * 10 + Number((p.annual_yield ?? p.expected_annual_yield) || 0);
  };
  if (within.length) {
    return within
      .map(p => ({ p, score: scoreWithin(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(x => x.p);
  }
  // Fallback if nothing within risk appetite: closest above
  const scoreAny = (p) => {
    const pr = (riskOrder[normalizeRisk(p.risk)] || riskOrder[normalizeRisk(p.risk_level)] || 2);
    return (3 - Math.abs(pr - target)) * 10 + Number((p.annual_yield ?? p.expected_annual_yield) || 0);
  };
  return products
    .map(p => ({ p, score: scoreAny(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(x => x.p);
}

export function portfolioInsights(investments) {
  const total = investments.reduce((s, i) => s + Number(i.amount), 0);
  const byRisk = investments.reduce((acc, i) => {
    const r = normalizeRisk(i.risk) || 'moderate';
    acc[r] = (acc[r] || 0) + Number(i.amount);
    return acc;
  }, {});
  const expected = investments.reduce((s, i) => s + Number(i.expected_return), 0);
  const riskDist = Object.entries(byRisk).map(([risk, amt]) => ({ risk, pct: total ? (amt / total) * 100 : 0 }));
  const summary = `Total invested: ₹${total.toFixed(2)}. Expected returns: ₹${expected.toFixed(2)}. Risk mix: ` +
    riskDist.map(r => `${r.risk} ${(r.pct).toFixed(1)}%`).join(', ') + '.';
  return { total, expected, riskDist, summary };
}

export async function portfolioInsightsSmart(investments) {
  const base = portfolioInsights(investments);
  const contextLines = investments.slice(0, 20).map(i => `- ${i.name} | risk=${normalizeRisk(i.risk) || 'moderate'} | amount=₹${Number(i.amount).toFixed(2)} | yield=${(i.annual_yield ?? i.expected_annual_yield)}%`).join('\n');
  const prompt = `Summarize a user portfolio in 2-3 sentences. Note total invested, expected returns, and risk distribution. Keep it factual and non-promissory.\n${contextLines}\nBase summary: ${base.summary}`;
  const co = await cohereChat(prompt);
  return { ...base, summary: (co || base.summary) };
}

export function summarizeErrors(logs) {
  const byCode = logs.reduce((acc, l) => { const k = l.status; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const total = logs.length;
  const top = Object.entries(byCode).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([code, cnt])=>`${code}(${cnt})`).join(', ');
  return `Errors: ${total}. Top statuses: ${top}`;
}

export async function summarizeErrorsSmart(logs) {
  const base = summarizeErrors(logs);
  const sample = logs.slice(0, 20).map(l => `- ${l.method} ${l.endpoint} -> ${l.status}${l.error ? `: ${l.error}` : ''}`).join('\n');
  const prompt = `Summarize API errors briefly (1-2 sentences) and list top issues.\nLogs:\n${sample}\nBase: ${base}`;
  const co = await cohereChat(prompt);
  return co || base;
}

// --- Product explainer (LLM with heuristic fallback) ---
export function productReasonsHeuristic(product, userRisk = 'moderate') {
  const pRisk = normalizeRisk(product.risk) || normalizeRisk(product.risk_level) || 'moderate';
  const uRisk = normalizeRisk(userRisk) || 'moderate';
  const reasons = [];
  if (pRisk === uRisk) reasons.push('Risk level aligns with your profile.');
  if (Number((product.annual_yield ?? product.expected_annual_yield)) >= 10) reasons.push('Competitive target yield.');
  if (Number(product.tenure_months) <= 12) reasons.push('Short-to-mid term tenure.');
  if (reasons.length === 0) reasons.push('Complements portfolio diversification.');
  return reasons.slice(0,3);
}

export async function productExplainerSmart(product, user) {
  const f = coalesceFields(product);
  const base = generateProductDescription(f);
  const reasons = productReasonsHeuristic(product, user?.risk_appetite || 'moderate');
  const prompt = `Write a concise AI summary (2-3 sentences) for this investment product followed by 3 short bullet reasons why it may suit a ${normalizeRisk(user?.risk_appetite) || 'moderate'} risk profile. Keep tone factual, non-promissory.\nName: ${f.name}\nType: ${f.type}\nRisk: ${normalizeRisk(f.risk) || 'moderate'}\nYield: ${f.expected_annual_yield}%\nTenure: ${f.tenure_months} months`;
  const co = await cohereChat(prompt);
  if (!co) return { summary: base, reasons };
  // Split bullets if present
  const lines = co.split('\n').map(s => s.trim()).filter(Boolean);
  const bull = lines.filter(l => l.startsWith('-') || l.startsWith('•')).map(l => l.replace(/^[-•]\s*/, '')).slice(0,3);
  const text = lines.filter(l => !(l.startsWith('-') || l.startsWith('•'))).join(' ');
  return { summary: text || base, reasons: bull.length ? bull : reasons };
}
