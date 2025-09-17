import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/userModel.js', () => ({
  userModel: {
    updateRisk: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(async (_db, id) => ({ id, email: 'u@e.com', risk_appetite: 'moderate', role: 'user', full_name: 'U', first_name: 'U', last_name: 'E', phone: '0', profile_photo_url: '/p.jpg' })),
  },
}));

const { userModel } = await import('../../models/userModel.js');
const { userService } = await import('../../services/userService.js');

describe('userService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('me returns user by id', async () => {
    const out = await userService.me({}, 'u1');
    expect(out.id).toBe('u1');
    expect(userModel.findById).toHaveBeenCalledWith({}, 'u1');
  });

  it('updateRisk updates and returns latest user', async () => {
    const out = await userService.updateRisk({}, 'u2', 'high');
    expect(userModel.updateRisk).toHaveBeenCalledWith({}, 'u2', 'high');
    expect(userModel.findById).toHaveBeenCalledWith({}, 'u2');
    expect(out.risk_appetite).toBe('moderate');
  });

  it('updateProfile updates and returns latest user', async () => {
    const data = { full_name: 'Z', first_name: 'Z', last_name: 'Y', phone: '9', profile_photo_url: '/z.jpg', risk_appetite: 'low' };
    const out = await userService.updateProfile({}, 'u3', data);
    expect(userModel.updateProfile).toHaveBeenCalledWith({}, 'u3', data);
    expect(userModel.findById).toHaveBeenCalledWith({}, 'u3');
    expect(out.email).toBe('u@e.com');
  });
});
