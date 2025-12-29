import express from 'express';
import { 
    createOrder, 
    getOrders, 
    // updateOrderStatus,  <-- 1. Bỏ import thừa này đi
    getOrderById,  
    getStats,
    updateOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/stats', getStats);          

router.post('/', createOrder);           
router.get('/', getOrders);              
router.get('/:id', getOrderById);        

// router.put('/:id', updateOrderStatus);   <-- 2. XÓA HOẶC COMMENT DÒNG NÀY (Đây là nguyên nhân chính gây lỗi)

router.put('/:id', updateOrder);  // <-- 3. Giữ lại dòng này (Hàm mới của chúng ta)

export default router;