import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  table_name: { type: String, required: true }, // VD: Bàn 5
  status: { 
    type: String, 
    enum: ['pending', 'cooking',  'completed', 'cancelled'],
    default: 'pending'
  },
  items: [
    {
      menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // Lưu giá tại thời điểm bán
      note: { type: String }
    }
  ],
  total_amount: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;