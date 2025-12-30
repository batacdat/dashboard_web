
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";


const Sidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin user
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'staff' };
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);


  // DANH SÁCH MENU
  const menuItems = [
    { 
        path: "/dashboard", 
        label: "📊 Thống kê", 
        roles: ['admin'] 
    },
    { 
        path: "/", 
        label: "🧾 Gọi món", 
        roles: ['admin', 'staff', 'kitchen'] 
    },
    { 
        path: "/kitchen", 
        label: "👨‍🍳 Bếp", 
        roles: ['admin', 'kitchen'] 
    },
    { 
        path: "/bill", 
        label: "💰 Thu ngân", 
        roles: ['admin'] 
    },
    { 
        path: "/admin", 
        label: "🍔 Quản lý Menu", 
        roles: ['admin'] 
    },
    { 
        path: "/employees", 
        label: "👥 Nhân viên", 
        roles: ['admin'] 
    }
  ];

  const handleLogout = () => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

const handleConfirmLogout = () => {
  if(!userToDelete) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  // Hàm check active link
  const isActive = (path) => location.pathname === path ? "bg-primary text-white shadow-md" : "hover:bg-base-200";

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      {/* --- NỘI DUNG CHÍNH --- */}
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen">
        {/* Header Mobile */}
        <div className="w-full navbar bg-base-100 lg:hidden shadow-sm">
            <div className="flex-none">
                <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </label>
            </div>
            <div className="flex-1 px-2 mx-2 font-bold">POS System</div>
        </div>

        {children}
      </div> 
      
      {/* --- MENU BÊN TRÁI --- */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content shadow-xl flex flex-col gap-2">
          
          {/* USER INFO */}
          {/* Logo */}
          <li className="mb-6 text-center pointer-events-none">
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
                🍜 Food Admin
            </div>
            <div className="text-xs text-gray-500 mt-1">Xin chào, {user.username}</div>
          </li>
          
                  {/* DANH SÁCH MENU */}
          {menuItems.map((item, index) => {
              // Kiểm tra quyền truy cập
              const hasAccess = item.roles.includes(user.role);

              // 👇 KHẮC PHỤC: Nếu không có quyền thì KHÔNG RENDER gì cả (return null)
              if (!hasAccess) return null; 

              return (
                  <li key={index} className="mb-2">
                      <Link 
                          to={item.path} 
                          className={`rounded-lg font-bold px-4 py-3 transition-all duration-200 flex items-center gap-3 ${isActive(item.path)}`}
                      >
                          {item.label}
                      </Link>
                  </li>
              );
          })}

          {/* LOGOUT */}
          <div className="mt-auto pt-4 border-t border-base-200">
            <li>
                <button onClick={handleLogout} className="text-error font-bold hover:bg-red-50 rounded-lg">
                    🚪 Đăng xuất
                </button>
            </li>
          </div>

        </ul>
      </div>

      {/* Modal Xác nhận Đăng xuất */}
      {deleteModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-2xl text-red-500">⚠️ Xác nhận đăng xuất</h3>
                        <p className="py-4 text-lg">
                            Bạn có chắc chắn muốn đăng xuất <span className="font-bold">{userToDelete?.fullName}</span> ({userToDelete?.username}) không?
                            <br/>
                            <span className="text-sm text-gray-500 italic">Hành động này không thể hoàn tác.</span>
                        </p>
                        <div className="modal-action">
                            <button 
                                className="btn btn-ghost" 
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                className="btn btn-error text-white" 
                                onClick={handleConfirmLogout}
                            >
                                🗑️ Đăng xuất
                            </button>
                        </div>
                    </div>
                    {/* Click ra ngoài để đóng */}
                    <div className="modal-backdrop" onClick={() => setDeleteModalOpen(false)}></div>
                </div>
            )}
    </div>
  );
};

export default Sidebar;