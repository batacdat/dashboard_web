import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 1. Đăng ký tài khoản
export const register = async (req, res) => {
    try {
        // Lấy dữ liệu từ frontend
        // Nếu không có role thì mặc định gán là 'user'
        const { username, password,fullName , role } = req.body;
        
        // Kiểm tra xem user đã tồn tại chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        // Lưu ý logic: Nếu role được gửi lên (ví dụ từ Postman) thì dùng, không thì mặc định là 'kitchen' hoặc 'admin' để bạn test cho dễ
        // Trong thực tế production, mặc định nên là 'user'
        const userRole = role || 'staff'; 

        const newUser = new User({
            username,
            password: hashedPassword,
            fullName: fullName || '',
            role: userRole
        });

        // Lưu vào DB
        await newUser.save();

        // sử dụng socket realtime
// 👇 SỬA LẠI ĐOẠN SOCKET CHO CHUẨN:
        try {
            // Lấy io thông qua app.get (do đã set bên server.js)
            const io = req.app.get('io');
            if (io) {
                io.emit('USER_UPDATE', { 
                    type: 'CREATE', // Nên viết hoa cho thống nhất
                    user: {
                        _id: newUser._id,
                        username: newUser.username,
                        fullName: newUser.fullName,
                        role: newUser.role,
                        createdAt: newUser.createdAt
                    }
                });
            }
        } catch (socketError) {
            console.error("Lỗi socket:", socketError);
            // Không return lỗi ở đây để tránh việc User tạo được rồi nhưng lại báo lỗi ra frontend
        }



        // --- NÂNG CẤP: Tạo Token luôn để user không phải đăng nhập lại ---
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role }, 
            JWT_SECRET, 
            { expiresIn: '12h' }
        );

        res.status(201).json({ 
            message: 'Tạo tài khoản thành công!',
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi máy chủ: ' + error.message });
    }
};

// 2. Đăng nhập tài khoản
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập không tồn tại!' });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Sai mật khẩu!' });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '12h' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi đăng nhập: ' + error.message });
    }
};
// APi   đổi mật khẩu

export const changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;
        const userId = req.user.id;

        //1.Kiem tra user tồn tại
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'Người dùng không tồn tại'});
        }
        //2.Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare (oldPassword, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Mật khẩu cũ không đúng'});
        }
        //3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash (newPassword, salt);
        //4. Lưu mật khẩu mới vào DB
        await user.save();

        res.status(200).json({message: 'Đổi mật khẩu thành công'});
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ: ' + error.message });
    }






};



