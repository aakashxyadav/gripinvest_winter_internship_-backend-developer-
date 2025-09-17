import { Router } from 'express';
import ctrl from '../controllers/investmentController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.post('/', auth(true), ctrl.invest);
router.get('/me', auth(true), ctrl.my);

export default router;
