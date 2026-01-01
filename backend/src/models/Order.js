import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  table_name: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'cooking', 'completed', 'cancelled', 'paid'], 
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
  
  // ❌ BỎ DÒNG NÀY: created_at: { type: Date, default: Date.now }
}, { 
  timestamps: true // ✅ THÊM DÒNG NÀY: Tự động tạo 'createdAt' và 'updatedAt'
});

const Order = mongoose.model('Order', orderSchema);
export default Order;