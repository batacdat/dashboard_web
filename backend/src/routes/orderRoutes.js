// routes/orderRoutes.js
import express from 'express';
import { 
    createOrder, 
    getOrders, 
    updateOrderStatus,
    getOrderById  // Thêm nếu cần
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);          // Tạo đơn hàng mới
router.get('/', getOrders);             // Lấy danh sách đơn hàng
router.get('/:id', getOrderById);       // Lấy đơn hàng theo ID (optional)
router.put('/:id', updateOrderStatus);  // Cập nhật trạng thái đơn hàng

export default router;