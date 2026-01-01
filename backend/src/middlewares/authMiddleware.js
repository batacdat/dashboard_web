// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const verifyToken = (req, res, next) => {
    // Lấy token từ header: "Authorization: Bearer <token>"
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập!' });
    }

    const token = tokenHeader.split(" ")[1]; // Lấy phần token sau chữ Bearer

    if (!token) {
        return res.status(401).json({ message: 'Token không hợp lệ!' });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Lưu thông tin user vào request để dùng ở controller
        next(); // Cho phép đi tiếp
    } catch (error) {
        return res.status(403).json({ message: 'Token hết hạn hoặc không đúng!' });
    }
};