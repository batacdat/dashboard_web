import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// 1. Lấy danh sách nhân viên (Bỏ qua password)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Không trả về password
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Tạo nhân viên mới
export const createUser = async (req, res) => {
    try {
        const { username, password, fullName, role } = req.body;
        
        // Check trùng username
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            fullName, 
            role 
        });
        
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Cập nhật nhân viên
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, role, password } = req.body;
        
        let updateData = { fullName, role };

        // Nếu có nhập password mới thì mới mã hóa và update
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Xóa nhân viên
export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};