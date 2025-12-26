import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder); // tao don hang moi
router.get('/', getOrders);    // lay danh sach don hang
router.put('/:id', updateOrderStatus); // cap nhat trang thai don hang

export default router;











