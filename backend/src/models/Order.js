// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  table_name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'cooking', 'completed', 'cancelled', 'paid'], // THÊM 'paid' vào đây
    default: 'pending'
  },
  items: [
    {
      menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      note: { type: String }
    }
  ],
  total_amount: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;