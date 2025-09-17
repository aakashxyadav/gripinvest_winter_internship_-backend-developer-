import { jest } from '@jest/globals';

const query = jest.fn().mockResolvedValue(undefined);
const end = jest.fn().mockResolvedValue(undefined);

const createConnection = jest.fn(async () => ({ query, end }));

jest.unstable_mockModule('mysql2/promise', () => ({
  // Provide both named and default exports to satisfy both seed.js default import
  // and this test's named usage.
  createConnection,
  default: { createConnection },
}));

jest.unstable_mockModule('fs', () => ({
  readFileSync: jest.fn((p) => (p.includes('schema.sql') ? 'CREATE TABLE x();' : 'INSERT INTO x VALUES ();')),
}));

jest.unstable_mockModule('path', () => ({
  resolve: (...args) => args.join('/'),
}));

const mysql = await import('mysql2/promise');
await import('fs');

const { main } = await import('../../utils/seed.js');

describe('seed.main', () => {
  const origArgv = process.argv;
  beforeEach(() => {
    jest.clearAllMocks();
    process.argv = ['node', 'seed'];
  });
  afterAll(() => { process.argv = origArgv; });

  it('runs schema and seed without reset', async () => {
    await main();
    expect(mysql.createConnection).toHaveBeenCalled();
    // Should run schema then seed
    expect(query).toHaveBeenNthCalledWith(1, 'CREATE TABLE x();');
    expect(query).toHaveBeenNthCalledWith(2, 'INSERT INTO x VALUES ();');
    expect(end).toHaveBeenCalled();
  });

  it('drops tables when --reset passed', async () => {
    process.argv = ['node', 'seed', '--reset'];
    await main();
    // First call should be DROP TABLES
    expect(query.mock.calls[0][0]).toMatch(/DROP TABLE IF EXISTS/);
  });
});
