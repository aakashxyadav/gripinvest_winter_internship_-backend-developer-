import { Router } from 'express';
import ctrl from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profile-photos';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg');
    cb(null, `${req.user.id}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/me', auth(true), ctrl.me);
router.put('/me/risk', auth(true), ctrl.updateRisk);
router.put('/me', auth(true), ctrl.updateProfile);
router.post('/me/photo', auth(true), upload.single('photo'), ctrl.uploadPhoto);
export default router;
