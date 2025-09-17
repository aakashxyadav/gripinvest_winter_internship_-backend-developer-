import { Router } from 'express';
import ctrl from '../controllers/logController.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.get('/me', auth(true), ctrl.me);
router.get('/', auth(true), requireAdmin, ctrl.all);
router.get('/search', auth(true), requireAdmin, ctrl.byUser);

export default router;
