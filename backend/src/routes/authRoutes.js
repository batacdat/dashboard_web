import express from 'express';
import { register, login, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';


const router = express.Router();
//dang ky tai khoan
router.post('/register', register);
//dang nhap tai khoan
router.post('/login', login);
router.put('/change-password',verifyToken, changePassword);
export default router;