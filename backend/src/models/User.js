// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['staff', 'admin', 'kitchen', 'user'], // Thêm 'user' cho đầy đủ
        default: 'staff',
    },
    is_active: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

// --- ĐÃ XÓA ĐOẠN pre('save') và methods.matchPassword ---
// Lý do: Việc mã hóa và kiểm tra mật khẩu đã được xử lý 
// hoàn toàn bên trong file authController.js rồi.

const User = mongoose.model('User', userSchema);
export default User;