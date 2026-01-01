import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // 👈 Import thư viện giải mã

const PrivateRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // 1. Kiểm tra có token không
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Kiểm tra Token còn hạn không?
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Thời gian hiện tại (giây)

        if (decoded.exp < currentTime) {
            // Token đã hết hạn
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        // Token bị lỗi định dạng
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    // 3. Kiểm tra quyền (Role)
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />; // Hoặc trang "Không có quyền truy cập"
    }

    return <Outlet />;
};

export default PrivateRoute;