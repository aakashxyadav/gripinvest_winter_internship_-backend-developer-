export const userModel = {
  findByEmail: async (db, email) => {
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  findById: async (db, id) => {
    const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (db, user) => {
    const { id, email, password_hash, risk_appetite, role, full_name, first_name, last_name, phone, profile_photo_url } = user;
    const fn = first_name || (full_name ? full_name.split(' ')[0] : null);
    const ln = last_name || (full_name ? full_name.split(' ').slice(1).join(' ') || null : null);
    const full = full_name || [fn, ln].filter(Boolean).join(' ') || null;
    await db.query(
      'INSERT INTO users (id, email, password_hash, risk_appetite, role, first_name, last_name, full_name, phone, profile_photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, email, password_hash, risk_appetite, role || 'user', fn, ln, full, phone || null, profile_photo_url || null]
    );
    await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [id, 100000.00]);
    return { ...user, first_name: fn, last_name: ln, full_name: full };
  },
  updateRisk: (db, id, risk) => db.query('UPDATE users SET risk_appetite = ? WHERE id = ?', [risk, id]),
  updateProfile: (db, id, data) => {
    const { full_name, first_name, last_name, phone, profile_photo_url, risk_appetite } = data;
    const fn = first_name || (full_name ? full_name.split(' ')[0] : null);
    const ln = last_name || (full_name ? full_name.split(' ').slice(1).join(' ') || null : null);
    const full = full_name || (fn || ln ? `${fn||''}${fn&&ln?' ':''}${ln||''}` : null);
    return db.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), profile_photo_url = COALESCE(?, profile_photo_url), risk_appetite = COALESCE(?, risk_appetite) WHERE id = ?',
      [full, fn, ln, phone || null, profile_photo_url || null, risk_appetite || null, id]
    );
  },
  setOTP: (db, id, code, expiresAt) => db.query('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [code, expiresAt, id]),
  updatePassword: (db, id, password_hash) => db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]),
};
