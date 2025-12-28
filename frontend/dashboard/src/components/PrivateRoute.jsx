import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({allowedRoles}) => {

    // Lấy token và user từ localStorage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // 1.Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    // 2. Nếu có quy định role mà user không đủ quyền -> Đẩy về trang chủ
    if(allowedRoles && !allowedRoles.includes(user.role)) {
        alert("Bạn không có quyền vào trang này! ⛔️");
        return <Navigate to="/" />;
    }

    //3. Nếu đã đăng nhập và có quyền, cho phép truy cập
    
    return <Outlet />;
};

export default PrivateRoute;