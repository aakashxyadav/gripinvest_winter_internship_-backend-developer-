import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/logModel.js', () => ({
  logModel: {
    byUser: jest.fn(),
    all: jest.fn(),
  },
}));

jest.unstable_mockModule('../../utils/ai.js', () => ({
  summarizeErrors: jest.fn((logs) => `Errors: ${logs.length}`),
  summarizeErrorsSmart: jest.fn(() => Promise.resolve(null)),
}));

const { logModel } = await import('../../models/logModel.js');
const ai = await import('../../utils/ai.js');
const { logService } = await import('../../services/logService.js');

const db = {};

describe('logService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('me returns logs and ai summary', async () => {
    const logs = [{ status: 500 }, { status: 200 }, { status: 404 }];
    logModel.byUser.mockResolvedValue(logs);
    const out = await logService.me(db, { id: 'u1' });
    expect(out.logs.length).toBe(3);
    // Since summarizeErrorsSmart returns null, service should fallback to summarizeErrors
    expect(out.ai).toBe(`Errors: 2`);
  });

  it('byUser returns logs and ai summary', async () => {
    const logs = [{ status: 400 }, { status: 401 }];
    logModel.byUser.mockResolvedValue(logs);
    const out = await logService.byUser(db, 'u1');
    expect(out.logs.length).toBe(2);
    expect(out.ai).toBe(`Errors: 2`);
  });
});
