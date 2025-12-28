import express from 'express';
import { register, login } from '../controllers/authController.js';


const router = express.Router();
//dang ky tai khoan
router.post('/register', register);
//dang nhap tai khoan
router.post('/login', login);

export default router;