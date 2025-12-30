import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // Thêm useLocation
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

function App() {
const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // 1. Nếu là trang Login: Hiển thị full màn hình, không có Sidebar


  return (
    
   <>
      {/* 👇 2. Đặt ToastContainer ở đây để nó hiện đè lên mọi thứ */}
      <ToastContainer position="top-right" autoClose={3000} />

      {isLoginPage ? (
        <Routes>
           <Route path="/login" element={<LoginPage />} />
        </Routes>
      ) : (
        <Sidebar>
          <div className="p-4">
            <Routes>
              {/* Ai cũng vào được (Staff, Admin, Kitchen) */}
              <Route path="/" element={<OrderPage />} />

              {/* Chỉ Bếp hoặc Admin */}
              <Route element={<PrivateRoute allowedRoles={['kitchen', 'admin']} />}>
                <Route path="/kitchen" element={<KitchenPage />} />
              </Route>

              {/* Chỉ Admin */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<MenuPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/bill" element={<BillPage />} />
                <Route path="/employees" element={<EmployeePage />} />
              </Route>
              
              <Route path="*" element={<OrderPage />} />
            </Routes>
          </div>
        </Sidebar>
      )}
    </>
  );
};

export default App;