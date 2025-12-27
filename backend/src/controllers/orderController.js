import Order from '../models/Order.js';

// 1. Tạo đơn hàng mới khi khách đặt hàng
export const createOrder = async (req, res) => {
    try {
        const { table_name, items, total_amount } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!table_name || !items || !total_amount) {
            return res.status(400).json({ 
                message: 'Missing required fields: table_name, items, total_amount' 
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                message: 'Items must be a non-empty array' 
            });
        }

        const newOrder = new Order({
            table_name,
            items,
            total_amount,
            status: 'pending' // Thêm status mặc định
        });

        const savedOrder = await newOrder.save();
        
        // Phần realtime với socket.io
        if (req.io) {
            req.io.emit('newOrder', savedOrder);
            console.log('📢 Socket: Emitted newOrder event');
        }
        
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({ 
            message: 'Error creating order', 
            error: error.message 
        });
    }
};

// 2. Lấy danh sách đơn hàng
export const getOrders = async (req, res) => {
    try {
        // SỬA: Sắp xếp theo thời gian tạo giảm dần
        const orders = await Order.find().sort({ created_at: -1 });
        
        console.log(`📋 Total orders found: ${orders.length}`);
        
        res.status(200).json(orders);
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({ 
            message: 'Error fetching orders', 
            error: error.message 
        });
    }
};

// 3. Cập nhật trạng thái đơn (Pending -> Cooking -> Completed)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        console.log(`🔄 Updating order ${id} to status: ${status}`);

        // Kiểm tra status hợp lệ
        const validStatuses = ['pending', 'cooking', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status',
                validStatuses 
            });
        }

        // Kiểm tra orderId hợp lệ
        if (!id || id.length !== 24) {
            return res.status(400).json({ 
                message: 'Invalid order ID format' 
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true } // Thêm runValidators để validate data
        );

        if (!updatedOrder) {
            console.log(`❌ Order not found: ${id}`);
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }

        console.log(`✅ Order updated: ${id} -> ${status}`);
        
        // Báo cho client biết đơn hàng đã được cập nhật
        if (req.io) {
            req.io.emit('orderUpdated', updatedOrder);
            req.io.emit('update_status', updatedOrder); // Giữ lại cho tương thích
            console.log('📢 Socket: Emitted orderUpdated event');
        }
        
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({ 
            message: 'Error updating order status', 
            error: error.message 
        });
    }
};

// 4. Lấy đơn hàng theo ID (optional - thêm nếu cần)
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }
        
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ Error getting order:', error);
        res.status(500).json({ 
            message: 'Error getting order', 
            error: error.message 
        });
    }
};