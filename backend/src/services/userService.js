import { userModel } from '../models/userModel.js';

export const userService = {
  updateRisk: async (db, userId, risk) => {
    await userModel.updateRisk(db, userId, risk);
    return await userModel.findById(db, userId);
  },
  updateProfile: async (db, userId, data) => {
    await userModel.updateProfile(db, userId, data);
    return await userModel.findById(db, userId);
  },
  me: async (db, userId) => userModel.findById(db, userId),
};
