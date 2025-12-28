import express from 'express';
import { 
    createOrder, 
    getOrders, 
    updateOrderStatus,
    getOrderById,  
    getStats
} from '../controllers/orderController.js';

const router = express.Router();

// --- CÁC ROUTE CỤ THỂ PHẢI ĐẶT TRƯỚC ---
router.get('/stats', getStats);          // 👈 ĐƯA CÁI NÀY LÊN ĐẦU TIÊN (Trước /:id)

// --- CÁC ROUTE CHUNG CHUNG ĐẶT SAU ---
router.post('/', createOrder);           // Tạo đơn
router.get('/', getOrders);              // Lấy danh sách
router.get('/:id', getOrderById);        // Lấy chi tiết (Dòng này "ăn tạp", nên phải để dưới cùng)
router.put('/:id', updateOrderStatus);   // Cập nhật

export default router;