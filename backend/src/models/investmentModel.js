export const investmentModel = {
  create: (db, inv) => db.query(
    'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status, invested_at, maturity_date) VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?)',
    [inv.id, inv.user_id, inv.product_id, inv.amount, inv.expected_return ?? null, inv.status || 'active', inv.invested_at || null, inv.maturity_date || null]
  ),
  listByUser: (db, userId) => db.query(
    `SELECT i.*, p.name,
            COALESCE(p.type, p.investment_type) AS type,
            COALESCE(p.risk, p.risk_level) AS risk,
            COALESCE(p.expected_annual_yield, p.annual_yield) AS expected_annual_yield
     FROM investments i
     JOIN investment_products p ON p.id = i.product_id
     WHERE i.user_id = ? ORDER BY i.invested_at DESC, i.created_at DESC`, [userId]
  ),
  getWallet: async (db, userId) => {
    const rows = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
    return rows[0];
  },
  updateWallet: (db, userId, newBalance) => db.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [newBalance, userId]),
};
