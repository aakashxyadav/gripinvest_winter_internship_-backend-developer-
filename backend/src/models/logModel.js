export const logModel = {
  log: (db, log) => db.query(
    'INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, method, status, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [log.user_id || null, log.email || null, log.endpoint, log.method, log.status, log.error || null, log.method, log.status, log.error || null]
  ),
  byUser: (db, userIdOrEmail) => db.query(
    `SELECT id, user_id, email, endpoint,
            COALESCE(http_method, method) AS method,
            COALESCE(status_code, status) AS status,
            COALESCE(error_message, error) AS error,
            created_at
     FROM transaction_logs WHERE user_id = ? OR email = ? ORDER BY created_at DESC LIMIT 500`,
    [userIdOrEmail, userIdOrEmail]
  ),
  all: (db, limit = 500) => db.query('SELECT id, user_id, email, endpoint, COALESCE(http_method, method) AS method, COALESCE(status_code, status) AS status, COALESCE(error_message, error) AS error, created_at FROM transaction_logs ORDER BY created_at DESC LIMIT ?', [limit])
};
