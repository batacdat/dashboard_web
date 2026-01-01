import Order from '../models/Order.js';

// 1. TẠO ĐƠN HÀNG
export const createOrder = async (req, res) => {
    try {
        const { table_name, items, total_amount } = req.body;
        
        if (!table_name || !items || !total_amount) {
            return res.status(400).json({ message: 'Thiếu thông tin bàn, món hoặc tiền.' });
        }

        // Ép kiểu tiền sang số (đề phòng gửi dạng string "35.000")
        const cleanAmount = Number(String(total_amount).replace(/[^0-9]/g, ''));

        const newOrder = new Order({
            table_name,
            items,
            total_amount: cleanAmount, 
            status: 'pending'
        });

        // Nhờ timestamps: true, dòng này sẽ tự sinh createdAt
        const savedOrder = await newOrder.save();
        
        if (req.io) {
            req.io.emit('newOrder', savedOrder);
        }
        
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('❌ Lỗi tạo đơn:', error);
        res.status(500).json({ message: error.message });
    }
};

// 2. CẬP NHẬT TRẠNG THÁI
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status }, 
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        if (req.io) {
             req.io.emit('update_status', updatedOrder);
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 2. Lấy danh sách đơn hàng
export const getOrders = async (req, res) => {
    try {
        // SỬA: Sắp xếp theo thời gian tạo giảm dần
        const orders = await Order.find().sort({ createdAt: -1 });
        
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

// 3. THỐNG KÊ DOANH THU (Đã tối ưu cho việc xem lịch sử)
export const getStats = async (req, res) => {
    try {
        const { type = 'month' } = req.query; // Mặc định là xem theo Tháng

        // 1. Xác định mốc thời gian bắt đầu (Start Date)
        const now = new Date();
        const vnTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
        const vnDate = new Date(vnTimeStr); 

        let startDate = new Date(vnDate);
        let mongoFormat = ""; 

        if (type === 'day') {
            // Nếu xem ngày: Lấy từ 00:00 hôm nay -> Gom nhóm theo Giờ
            startDate.setHours(0, 0, 0, 0); 
            mongoFormat = "%H:00"; 

        } else if (type === 'month') {
            // Nếu xem tháng: Lấy từ ngày mùng 1 đầu tháng -> Gom nhóm theo Ngày
            startDate.setDate(1); 
            startDate.setHours(0, 0, 0, 0);
            mongoFormat = "Ngày %d"; // Kết quả sẽ là "Ngày 01", "Ngày 02"...

        } else if (type === 'year') {
            // Nếu xem năm: Lấy từ tháng 1 đầu năm -> Gom nhóm theo Tháng
            startDate.setMonth(0, 1); 
            startDate.setHours(0, 0, 0, 0);
            mongoFormat = "Tháng %m";
        }

        // Chuyển mốc thời gian về UTC để so sánh với Database
        // (Ví dụ: Muốn lấy từ 0h sáng VN thì phải tìm từ 17h chiều hôm trước của UTC)
        const queryDate = new Date(startDate.getTime() - (7 * 60 * 60 * 1000));

        console.log(`🔍 Lọc dữ liệu từ: ${queryDate.toISOString()} (UTC)`);

        // --- QUERY 1: BIỂU ĐỒ DOANH THU ---
        const chartDataRaw = await Order.aggregate([
            { 
                // Lọc lấy các đơn hàng từ ngày bắt đầu đến nay
                 $match: { $or: [ { createdAt: { $gte: queryDate } }, { created_at: { $gte: queryDate } } ] }
            },
            {
                $group: {
                    _id: {
                        // QUAN TRỌNG: Cộng 7 tiếng vào giờ gốc trước khi format ra ngày/tháng
                        $dateToString: { 
                            format: mongoFormat, 
                            date: { $add: ["$createdAt", 7 * 60 * 60 * 1000] } 
                        }
                    },
                    // Tính tổng tiền của nhóm đó
                    revenue: { $sum: "$total_amount" } 
                }
            },
            { $sort: { _id: 1 } } // Sắp xếp từ ngày cũ đến mới (Ngày 1 -> Ngày 30)
        ]);

        // --- QUERY 2: TỔNG QUAN (Tổng đơn, Tổng tiền toàn thời gian lọc) ---
        const totalStats = await Order.aggregate([
            { $match: { $or: [ { createdAt: { $gte: queryDate } }, { created_at: { $gte: queryDate } } ] }},
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total_amount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // --- QUERY 3: TOP MÓN BÁN CHẠY ---
        const pieDataRaw = await Order.aggregate([
            {  $match: { $or: [ { createdAt: { $gte: queryDate } }, { created_at: { $gte: queryDate } } ] } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    value: { $sum: "$items.quantity" }
                }
            },
            { $sort: { value: -1 } },
            { $limit: 5 }
        ]);

        // Format dữ liệu trả về cho Frontend đẹp
        const totalRevenue = totalStats.length > 0 ? totalStats[0].totalRevenue : 0;
        const totalOrders = totalStats.length > 0 ? totalStats[0].totalOrders : 0;

        const chartData = chartDataRaw.map(item => ({ 
            name: item._id,     // Ví dụ: "Ngày 05"
            revenue: item.revenue // Ví dụ: 5000000
        }));

        const pieData = pieDataRaw.map(item => ({ 
            name: item._id, 
            value: item.value 
        }));

        res.json({ totalOrders, totalRevenue, chartData, pieData });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};
// 👇 HÀM KHÔI PHỤC DỮ LIỆU CŨ (Chạy 1 lần rồi xóa)
export const fixOldData = async (req, res) => {
    try {
        // 1. Tìm tất cả đơn hàng CHƯA có trường createdAt chuẩn
        const orders = await Order.find({ createdAt: { $exists: false } });

        let count = 0;
        for (const order of orders) {
            // Logic lấy ngày: 
            // - Nếu có trường cũ 'created_at' thì lấy dùng.
            // - Nếu không có gì hết, lấy ngày từ chính cái ID (MongoDB ID có chứa ngày tạo).
            const realDate = order.created_at || order._id.getTimestamp();

            // Cập nhật lại theo chuẩn mới
            await Order.updateOne(
                { _id: order._id },
                { 
                    $set: { 
                        createdAt: realDate, 
                        updatedAt: realDate 
                    } 
                }
            );
            count++;
        }

        res.json({ 
            message: '✅ Khôi phục thành công!', 
            restored: count, 
            total_orders: orders.length 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



