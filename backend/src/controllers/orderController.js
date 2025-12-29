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
        const validStatuses = ['pending', 'cooking', 'completed', 'cancelled', 'paid'];
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

// lấy thống kê doanh thu theo ngày (optional - thêm nếu cần)
export const getStats = async (req, res) => {
  try {
        // 1. Lấy tham số filter từ Client gửi lên (mặc định là 'day')
        const { type = 'day' } = req.query; 
        
        // Định dạng ngày tháng cho MongoDB nhóm lại
        let format = "%Y-%m-%d"; // Theo ngày: 2023-12-25
        if (type === 'month') format = "%Y-%m"; // Theo tháng: 2023-12
        if (type === 'year') format = "%Y";     // Theo năm: 2023

        // --- A. THỐNG KÊ DOANH THU THEO THỜI GIAN (Bar/Line Chart) ---
        const revenueStats = await Order.aggregate([
            { $match: { status: 'paid' } }, // Chỉ lấy đơn đã thanh toán
            {
                $group: {
                    _id: { $dateToString: { format: format, date: "$created_at" } },
                    revenue: { $sum: "$total_amount" }, // Tổng tiền
                    count: { $sum: 1 } // Số đơn
                }
            },
            { $sort: { _id: 1 } } // Sắp xếp theo ngày tăng dần
        ]);

        // Chuẩn hóa dữ liệu trả về cho Frontend
        const chartData = revenueStats.map(item => ({
            date: item._id,
            revenue: item.revenue,
            orders: item.count
        }));

        // --- B. THỐNG KÊ TOP 5 MÓN BÁN CHẠY (Pie Chart) ---
        const topItems = await Order.aggregate([
            { $match: { status: 'paid' } },
            { $unwind: "$items" }, // Tách mảng items ra từng dòng riêng lẻ
            {
                $group: {
                    _id: "$items.name", // Nhóm theo tên món
                    value: { $sum: "$items.quantity" } // Tổng số lượng bán
                }
            },
            { $sort: { value: -1 } }, // Sắp xếp giảm dần
            { $limit: 5 } // Chỉ lấy Top 5
        ]);
        
        // Đổi key _id thành name cho Recharts dễ đọc
        const pieData = topItems.map(item => ({ name: item._id, value: item.value }));

        // --- C. TỔNG QUAN ---
        const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
        const totalOrders = chartData.reduce((acc, curr) => acc + curr.orders, 0);

        res.json({
            type,
            totalRevenue,
            totalOrders,
            chartData, // Dữ liệu cho biểu đồ cột/đường
            pieData    // Dữ liệu cho biểu đồ tròn
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// 👇 THÊM HÀM NÀY ĐỂ CẬP NHẬT TRẠNG THÁI (THANH TOÁN)
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;      // Lấy ID đơn hàng từ URL
        const { status } = req.body;    // Lấy trạng thái từ Frontend gửi lên

        // Kiểm tra xem có gửi status lên không
        if (!status) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới (status)' });
        }

        // Tìm và cập nhật
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: status }, 
            { new: true } // Trả về dữ liệu mới sau khi sửa
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Real-time: Báo cho các bên biết đơn hàng đã đổi trạng thái
        if (req.io) {
            req.io.emit('update_status', updatedOrder);
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('❌ Lỗi cập nhật đơn:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
















