import { db } from '../config/db.js';
import { investmentService } from '../services/investmentService.js';
import { wrapRoute } from '../utils/txLogger.js';

export default {
  invest: wrapRoute(async (req, res) => {
    const { product_id, amount } = req.body;
    const result = await investmentService.invest(db, req.user, { product_id, amount });
    res.status(201).json(result);
  }),
  my: wrapRoute(async (req, res) => {
    const result = await investmentService.myInvestments(db, req.user);
    res.json(result);
  }),
};
