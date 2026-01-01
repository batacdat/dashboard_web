import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom'; // 👈 Thêm Outlet
import Sidebar from './components/Sidebar';

import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import OrderPage from './pages/OrderPage';
import BillPage from './pages/BillPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';

import DashboardPage from './pages/DashBoardPage'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmployeePage from './pages/EmployeePage';

// Component Layout để bọc Sidebar (Giúp code gọn hơn)
const MainLayout = () => {
  return (
    <Sidebar>
      <div className="p-4">
        <Outlet /> {/* Đây là nơi các trang con (Order, Bill...) sẽ hiển thị */}
      </div>
    </Sidebar>
  );
};

function App() {
  return (
   <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* 1. Trang Login (Công khai) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. CÁC TRANG CẦN BẢO VỆ (Phải đăng nhập mới vào được) */}
        {/* PrivateRoute bao trùm tất cả, nếu chưa login sẽ bị đá về /login ngay */}
        <Route element={<PrivateRoute />}>
            
            {/* Nếu đã login -> Hiển thị Layout (Sidebar) -> Hiển thị trang con */}
            <Route element={<MainLayout />}>
              
              {/* Ai cũng vào được (Staff, Admin, Kitchen) */}
              <Route path="/" element={<OrderPage />} />

              {/* Chỉ Bếp hoặc Admin */}
              <Route element={<PrivateRoute allowedRoles={['kitchen', 'admin']} />}>
                <Route path="/kitchen" element={<KitchenPage />} />
              </Route>

            {/* 3. KHU VỰC THU NGÂN (Cashier + Admin) 
                 👉 Đây là phần bạn cần thêm mới để Cashier vào được BillPage
              */}
              <Route element={<PrivateRoute allowedRoles={['cashier', 'admin']} />}>
                <Route path="/bill" element={<BillPage />} />
              </Route>

              {/* Chỉ Admin */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<MenuPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
               
                <Route path="/employees" element={<EmployeePage />} />
              </Route>

            </Route>
        </Route>

        {/* Trang 404 */}
        <Route path="*" element={<div className="text-center mt-10">404 - Trang không tồn tại</div>} />
      </Routes>
    </>
  );
};

export default App;