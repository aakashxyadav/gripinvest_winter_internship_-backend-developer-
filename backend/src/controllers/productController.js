import { db } from '../config/db.js';
import { productService } from '../services/productService.js';
import { wrapRoute } from '../utils/txLogger.js';

export default {
  list: wrapRoute(async (req, res) => {
    const { type, risk, yield: y, yield_min, yield_max } = req.query;
    const rows = await productService.list(db, { type, risk, yield: y, yield_min, yield_max });
    res.json(rows);
  }),
  get: wrapRoute(async (req, res) => {
    const row = await productService.get(db, req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  }),
  create: wrapRoute(async (req, res) => {
    const p = await productService.create(db, req.user, req.body);
    res.status(201).json(p);
  }),
  update: wrapRoute(async (req, res) => {
    const p = await productService.update(db, req.params.id, req.body);
    res.json(p);
  }),
  remove: wrapRoute(async (req, res) => {
    await productService.remove(db, req.params.id);
    res.json({ ok: true });
  }),
  recommend: wrapRoute(async (req, res) => {
    const rows = await productService.recommendations(db, req.user);
    res.json(rows);
  }),
  explainer: wrapRoute(async (req, res) => {
    const data = await productService.explainer(db, req.params.id, req.user);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  }),
};
