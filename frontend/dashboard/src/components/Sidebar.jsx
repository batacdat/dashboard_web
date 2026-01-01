import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import authApi from "../api/authApi";

const Sidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'staff' };

  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(false); // Modal đổi pass
  
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // 1. THÊM STATE QUẢN LÝ ẨN/HIỆN CHO 3 Ô INPUT
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
  // Menu items... (Giữ nguyên code cũ của bạn)
  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Thống kê", roles: ['admin'] },
    { path: "/", icon: "🧾", label: "Gọi món", roles: ['admin', 'staff', 'kitchen'] },
    { path: "/kitchen", icon: "👨‍🍳", label: "Bếp", roles: ['admin', 'kitchen'] },
    { path: "/bill", icon: "💰", label: "Thu ngân", roles: ['admin','cashier'] },
    { path: "/admin", icon: "🍔", label: "Menu", roles: ['admin'] },
    { path: "/employees", icon: "👥", label: "Nhân viên", roles: ['admin'] }
  ];

  // Helper check active... (Giữ nguyên)
  const isActive = (path) => location.pathname === path ? "bg-primary text-white shadow-md" : "text-gray-600 hover:bg-base-200";

  // Logic đổi pass... (Giữ nguyên)
  const handleChangePass = async () => {
    if (passForm.newPassword !== passForm.confirmPassword) {
        return toast.error("Mật khẩu mới không khớp!");
    }
    try {
        await authApi.changePassword({
            oldPassword: passForm.oldPassword,
            newPassword: passForm.newPassword
        });
        toast.success("Đổi mật khẩu thành công!");
        setSettingModalOpen(false);
        setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi đổi mật khẩu");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      {/* NỘI DUNG CHÍNH (Giữ nguyên) */}
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen transition-all duration-300">
        <div className="w-full navbar bg-base-100 lg:hidden shadow-sm">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
            <div className="flex-1 px-2 mx-2 font-bold text-lg">Restaurant App</div>
        </div>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div> 

      {/* SIDEBAR */}
      <div className="drawer-side z-20">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        
        <aside className={`bg-base-100 text-base-content min-h-full flex flex-col shadow-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            
            {/* HEADER (Giữ nguyên) */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-base-200">
                {!isCollapsed && 
                    <div className="text-2xl font-bold text-primary flex flex-col items-center gap-2">Food Admin
                        <div className="text-xs text-gray-500 mt-1">Xin chào, {user.username}</div>
                    
                    </div>}
                 

                <button onClick={() => setIsCollapsed(!isCollapsed)} className="btn btn-sm btn-ghost hidden lg:flex">
                    {isCollapsed ? ">>" : "<<"}
                </button>
            </div>

            {/* LIST MENU (Giữ nguyên) */}
            <ul className="menu p-2 flex-1 gap-1">
               
                {menuItems.map((item, index) => {
                    if (!item.roles.includes(user.role)) return null;
                    return (
                        <li key={index}>
                            <Link to={item.path} className={`flex items-center gap-3 px-3 py-3 ${isActive(item.path)} justify-start `}>
                                <span className="text-xl">{item.icon}</span>
                                <span className={`font-medium transition-all duration-200 ${isCollapsed ? 'hidden lg:hidden' : 'block'}`}>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* 👇👇👇 PHẦN FOOTER ĐÃ SỬA LẠI Ở ĐÂY 👇👇👇 */}
            {/* FOOTER: CÀI ĐẶT & LOGOUT (Đã làm đẹp) */}
            <div className="p-2 border-t border-base-200 bg-base-50">
                
                {/* 1. CÀI ĐẶT (Dropdown) */}
                <div className={`dropdown dropdown-top ${isCollapsed ? 'dropdown-end' : 'w-full'}`}>
                    <div 
                        tabIndex={0} 
                        role="button" 
                        className="flex items-center gap-3 w-full p-3 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg mb-1 justify-start cursor-pointer transition-all"
                    >
                        {/* Icon Bánh răng (Settings) */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">Cài đặt</span>}
                    </div>
                    
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-56 mb-2 border border-base-200">
                        <li className="menu-title px-4 py-2 text-xs text-gray-400 uppercase font-bold tracking-wider">Tài khoản</li>
                        <li>
                            <button onClick={() => setSettingModalOpen(true)} className="flex gap-3 py-3 active:bg-primary active:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                Đổi mật khẩu
                            </button>
                        </li>
                    </ul>
                </div>

                {/* 2. ĐĂNG XUẤT (Icon Exit) */}
                <button 
                    onClick={() => setLogoutModalOpen(true)}
                    className="group flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-lg justify-start transition-all"
                    title="Đăng xuất"
                >
                    {/* Icon Thoát (Logout) - Hiệu ứng group-hover làm icon dịch chuyển nhẹ */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>

                    {!isCollapsed && <span className="font-bold whitespace-nowrap">Đăng xuất</span>}
                </button>
            </div>
        </aside>
      </div>


      {/* --- MODAL ĐỔI MẬT KHẨU (GIỮ NGUYÊN CODE CŨ) --- */}
 {settingModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">🔐 Đổi mật khẩu</h3>
                        <div className="flex flex-col gap-3">
                            
                            {/* --- Ô MẬT KHẨU CŨ --- */}
                            <div>
                                <label className="label-text">Mật khẩu cũ</label>
                                <div className="relative">
                                    <input 
                                        type={showOldPass ? "text" : "password"} // Đổi type dựa theo state
                                        className="input input-bordered w-full pr-10" // pr-10 để chữ không đè lên icon
                                        value={passForm.oldPassword} 
                                        onChange={(e) => setPassForm({...passForm, oldPassword: e.target.value})} 
                                    />
                                    <button 
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowOldPass(!showOldPass)}
                                    >
                                        {/* Icon Mắt */}
                                        {showOldPass ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* --- Ô MẬT KHẨU MỚI --- */}
                            <div>
                                <label className="label-text">Mật khẩu mới</label>
                                <div className="relative">
                                    <input 
                                        type={showNewPass ? "text" : "password"} 
                                        className="input input-bordered w-full pr-10" 
                                        value={passForm.newPassword} 
                                        onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})} 
                                    />
                                    <button 
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                    >
                                        {showNewPass ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* --- Ô NHẬP LẠI MẬT KHẨU --- */}
                            <div>
                                <label className="label-text">Nhập lại mật khẩu mới</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPass ? "text" : "password"} 
                                        className="input input-bordered w-full pr-10" 
                                        value={passForm.confirmPassword} 
                                        onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})} 
                                    />
                                    <button 
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    >
                                        {showConfirmPass ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setSettingModalOpen(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleChangePass}>Lưu thay đổi</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setSettingModalOpen(false)}></div>
                </dialog>
            )}

      {/* --- MODAL XÁC NHẬN ĐĂNG XUẤT (GIỮ NGUYÊN CODE CŨ) --- */}
      {logoutModalOpen && (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg text-error">⚠️ Đăng xuất?</h3>
                <p className="py-4">Bạn có chắc chắn muốn thoát phiên làm việc không?</p>
                <div className="modal-action">
                    <button className="btn" onClick={() => setLogoutModalOpen(false)}>Hủy</button>
                    <button className="btn btn-error text-white" onClick={handleLogout}>Đăng xuất ngay</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setLogoutModalOpen(false)}></div>
        </dialog>
      )}
    </div>
  );
};

export default Sidebar;