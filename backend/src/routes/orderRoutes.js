import express from 'express';
import { 
    createOrder, 
    fixOldData, 
    getOrders, 
    // updateOrderStatus,  <-- 1. Bỏ import thừa này đi

    getStats,
    updateOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/stats', getStats);          

router.post('/', createOrder);           
router.get('/', getOrders);              
     

// router.put('/:id', updateOrderStatus);   <-- 2. XÓA HOẶC COMMENT DÒNG NÀY (Đây là nguyên nhân chính gây lỗi)

router.put('/:id', updateOrder);  // <-- 3. Giữ lại dòng này (Hàm mới của chúng ta)

// 👇 Route tạm để fix data
router.get('/fix-data', fixOldData);


export default router;