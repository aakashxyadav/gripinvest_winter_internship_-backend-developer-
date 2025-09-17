import { Router } from 'express';
import ctrl from '../controllers/authController.js';

const router = Router();
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/request-reset', ctrl.requestReset);
router.post('/reset', ctrl.reset);

export default router;
