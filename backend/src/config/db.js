import mysql from 'mysql2/promise';
import { logger } from './logger.js';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'grip_invest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  getConnection: () => pool.getConnection(),
};

export async function pingDB() {
  try {
    await pool.query('SELECT 1');
    logger.info('MySQL connected');
  } catch (e) {
    logger.error('MySQL connection failed', e);
  }
}

if (process.env.NODE_ENV !== 'test') {
  pingDB();
}
