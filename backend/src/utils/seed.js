import 'dotenv/config';
import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

export async function main() {
  const reset = process.argv.includes('--reset');
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'grip_invest',
    multipleStatements: true,
  });
  const schema = fs.readFileSync(path.resolve(process.cwd(), '../db/schema.sql'), 'utf-8');
  const seed = fs.readFileSync(path.resolve(process.cwd(), '../db/seed.sql'), 'utf-8');
  if (reset) {
    await conn.query('DROP TABLE IF EXISTS investments, investment_products, transaction_logs, wallets, users');
  }
  await conn.query(schema);
  await conn.query(seed);
  await conn.end();
  console.log('Seed completed');
}

if (process.env.NODE_ENV !== 'test') {
  main().catch(err => { console.error(err); process.exit(1); });
}
