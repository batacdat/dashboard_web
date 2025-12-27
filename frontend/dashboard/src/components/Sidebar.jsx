import React from "react";
import { Link, useLocation } from "react-router-dom"; // 1. Import cái này

const Sidebar = ({ children }) => {
  const location = useLocation(); // Lấy đường dẫn hiện tại để active menu

  // Hàm kiểm tra xem menu nào đang active
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-start bg-base-200 min-h-screen">
        {/* ... (Giữ nguyên phần header mobile) ... */}
        <div className='w-full navbar bg-base-100 lg:hidden shadow-sm'>
            <div className='flex-none'>
                <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </label>
            </div>
            <div className='flex-1 px-2 mx-2'>Admin Dashboard</div>
        </div>

        <div className="p-8 w-full max-w-7xl">
            {children}
        </div>
      </div> 
      
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content shadow-xl">
          <li className="mb-4">
            <div className="text-2xl font-bold text-primary px-4">🍜 Food Admin</div>
          </li>
          
          {/* 2. Sửa danh sách menu dùng Link và check Active */}
          <li>
            <Link to="/" className={isActive("/")}>📊 Tổng quan</Link>
          </li>
          <li>
            <Link to="/menu" className={isActive("/menu")}>🍔 Quản lý Món ăn</Link>
          </li>
          <li>
            <Link to="/order" className={isActive("/order")}>🧾 Gọi món</Link>
          </li>
          <li>
            <Link to="/kitchen" className={isActive("/kitchen")}>👨‍🍳 Bếp </Link>
          </li>
          
          <div className="divider"></div> 
          <li><a>⚙️ Cài đặt</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;