import Order from '../models/Order.js';

//1. tao don hang moi khi khach dat hang
export const createOrder = async (req, res) => {
    try {
        const {table_name, items, total_amount} = req.body;
        const newOrder = new Order({
            table_name,
            items,
            total_amount
        });
        const savedOrder = await newOrder.save();
        // phan realtime voi socket.io
        req.io.emit('newOrder', savedOrder);
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

//2. lay danh sach don hang
export const getOrders = async (req, res) => {
    try {
        const orders = (await Order.find()).sort(createdAt -1);
        res.json(orders);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// 3. Cập nhật trạng thái đơn (VD: Pending -> Cooking -> Completed)
export const updateOrderStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const {id} = req.params;
        const updateOrder = await Order.findByIdAndUpdate(
            id,
            {status},
            {new: true}  // tra ve data moi sau khi cap nhat
        );
        if(!updateOrder) {
            return res.status(404).json({message: 'Order not found'});
        }
        // bao cho client biet don hang da dc cap nhat
        req.io.emit('update_status', updateOrder);
        res.json(updateOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }

};
















