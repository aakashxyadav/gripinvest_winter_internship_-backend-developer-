import { Router } from 'express';
import ctrl from '../controllers/productController.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/ai/recommendations/me', auth(true), ctrl.recommend);
router.get('/:id/ai/explainer', auth(false), ctrl.explainer);
router.get('/:id', ctrl.get);

router.post('/', auth(true), requireAdmin, ctrl.create);
router.put('/:id', auth(true), requireAdmin, ctrl.update);
router.delete('/:id', auth(true), requireAdmin, ctrl.remove);

export default router;
