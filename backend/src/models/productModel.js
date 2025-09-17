export const productModel = {
  list: (db, filters = {}) => {
    const clauses = [];
    const params = [];
    const fType = filters.investment_type || filters.type;
    const fRisk = filters.risk_level || filters.risk;
    const fy = filters.yield;
    const fyMin = filters.yield_min;
    const fyMax = filters.yield_max;
    if (fType) { clauses.push('(investment_type = ? OR type = ?)'); params.push(fType, fType); }
    if (fRisk) { clauses.push('(risk_level = ? OR risk = ?)'); params.push(fRisk, fRisk); }
    if (fy) { clauses.push('(COALESCE(annual_yield, expected_annual_yield) = ?)'); params.push(fy); }
    if (fyMin) { clauses.push('(COALESCE(annual_yield, expected_annual_yield) >= ?)'); params.push(fyMin); }
    if (fyMax) { clauses.push('(COALESCE(annual_yield, expected_annual_yield) <= ?)'); params.push(fyMax); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    // Project canonical and legacy aliases so downstream code works during migration
    const select = `id, name,
      COALESCE(investment_type, type) AS investment_type,
      COALESCE(risk_level, risk) AS risk_level,
      COALESCE(annual_yield, expected_annual_yield) AS annual_yield,
      COALESCE(type, investment_type) AS type,
      COALESCE(risk, risk_level) AS risk,
      COALESCE(expected_annual_yield, annual_yield) AS expected_annual_yield,
      min_investment, max_investment, tenure_months, description, created_by, created_at, updated_at`;
    return db.query(`SELECT ${select} FROM investment_products ${where} ORDER BY created_at DESC`, params);
  },
  get: async (db, id) => {
    const rows = await db.query(
      `SELECT id, name,
        COALESCE(investment_type, type) AS investment_type,
        COALESCE(risk_level, risk) AS risk_level,
        COALESCE(annual_yield, expected_annual_yield) AS annual_yield,
        COALESCE(type, investment_type) AS type,
        COALESCE(risk, risk_level) AS risk,
        COALESCE(expected_annual_yield, annual_yield) AS expected_annual_yield,
        min_investment, max_investment, tenure_months, description, created_by, created_at, updated_at
       FROM investment_products WHERE id = ?`, [id]);
    return rows[0];
  },
  create: (db, p) => db.query(
    `INSERT INTO investment_products (id, name, investment_type, risk_level, annual_yield, type, risk, expected_annual_yield, min_investment, max_investment, tenure_months, description, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.id, p.name, p.investment_type || p.type, p.risk_level || p.risk, p.annual_yield ?? p.expected_annual_yield, p.type || p.investment_type, p.risk || p.risk_level, p.expected_annual_yield ?? p.annual_yield, p.min_investment, p.max_investment ?? null, p.tenure_months, p.description, p.created_by]
  ),
  update: (db, id, p) => db.query(
    `UPDATE investment_products SET
      name = COALESCE(?, name),
      investment_type = COALESCE(?, investment_type),
      risk_level = COALESCE(?, risk_level),
      annual_yield = COALESCE(?, annual_yield),
      -- keep legacy in sync
      type = COALESCE(?, type),
      risk = COALESCE(?, risk),
      expected_annual_yield = COALESCE(?, expected_annual_yield),
      min_investment = COALESCE(?, min_investment),
      max_investment = COALESCE(?, max_investment),
      tenure_months = COALESCE(?, tenure_months),
      description = COALESCE(?, description)
     WHERE id = ?`,
    [p.name, p.investment_type || p.type, p.risk_level || p.risk, p.annual_yield ?? p.expected_annual_yield, p.type || p.investment_type, p.risk || p.risk_level, p.expected_annual_yield ?? p.annual_yield, p.min_investment, p.max_investment ?? null, p.tenure_months, p.description, id]
  ),
  remove: (db, id) => db.query('DELETE FROM investment_products WHERE id = ?', [id]),
};
