import express from 'express';
import { register, login, logout,profile,password } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.put('/profile', profile);
router.put('/password', password);

export default router;