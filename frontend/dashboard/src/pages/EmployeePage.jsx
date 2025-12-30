import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';
import { toast } from 'react-toastify';
import socket from '../api/socket';

const EmployeePage = () => {
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [searchTerm, setSearchTerm] = useState(""); // 1. State tìm kiếm
    //state quan ly modal xoa
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    // Form Data
    const [formData, setFormData] = useState({
        _id: null,
        username: '',
        password: '',
        fullName: '',
        role: 'staff' // staff | kitchen | admin
    });

    // Load danh sách user
    const fetchUsers = async () => {
        try {
            const res = await userApi.getAll();
            setUsers(res.data || res);
        } catch (error) {
            toast.error("Lỗi tải danh sách nhân viên: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => { 
        fetchUsers() ;

        //ham su ly khi co tin hieu thay doi User
        const handleUserUpdate = (data) => {
            if(data.type === 'CREATE') {
                // neu co nguoi moi thi them vao dau danh sach
                setUsers((prevUsers) => [data.user, ...prevUsers]);
                toast.info(`🎉 Có nhân viên mới: ${data.user.fullName}`);
            } else {
                fetchUsers(); // tai lai danh sach
            }
        };

        // lang nghe su kien tu server gui ve
       
        socket.on('USER_UPDATE', handleUserUpdate);
        return () => {
            socket.off('USER_UPDATE', handleUserUpdate);
        };

    }, []);

    // Xử lý mở modal thêm mới
    const handleAddNew = () => {
        setFormData({ _id: null, username: '', password: '', fullName: '', role: 'staff' });
        setIsEditing(false);
        setModalOpen(true);
    };

    // Xử lý mở modal sửa
    const handleEdit = (user) => {
        setFormData({ ...user, password: '' }); // Password để trống, nếu nhập thì mới đổi
        setIsEditing(true);
        setModalOpen(true);
    };

    // Xử lý Lưu (Thêm hoặc Sửa)
    const handleSave = async () => {
        try {
            if (isEditing) {
                await userApi.update(formData._id, formData);
                toast.success("Cập nhật thành công!");
            } else {
                if (!formData.username || !formData.password) return toast.warning("Vui lòng điền đủ thông tin");
                await userApi.create(formData);
                toast.success("Thêm nhân viên thành công!");
            }
            setModalOpen(false);
            fetchUsers(); // Tải lại danh sách
        } catch (error) {
            toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
        }
    };

// khi nhan nut xoa => hien modal 
const handleDeleteClick = (user) => {
    setUserToDelete(user);    // Lưu thông tin user cần xóa
    setDeleteModalOpen(true);  // Mở modal xác nhận
};

//khi nhan nut huy tren modal => goi API xoa
const handleConfirmDelete = async () => {
    if(!userToDelete) return;
    try {
        await userApi.delete(userToDelete._id);
        toast.success("Đã xóa nhân viên: " + userToDelete.fullName);
        fetchUsers(); // Tải lại danh sách
        //reset và đóng modal
        setDeleteModalOpen(false);
        setUserToDelete(null);
    } catch (error) {
        toast.error("Lỗi xóa nhân viên: " + (error.response?.data?.message || error.message));
    }
};

// logic lọc danh sách user dựa trên searchTerm
const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) 
);




    return (
        <div className="p-6 bg-base-200 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-800">👥 Quản Lý Nhân Viên</h2>
                <div className='flex gap-2 w-full md:w-auto'>
                    <input 
                        type="text" 
                        placeholder="🔍 Tìm theo tên..." 
                        className="input input-bordered mr-4 input-sm w-full md:w-64 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                <button onClick={handleAddNew} className="btn btn-primary">
                    + Thêm Nhân Viên
                </button>
                </div>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
                <table className="table table-sm w-full">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th>Họ và Tên</th>
                            <th>Username</th>
                            <th>Vai trò</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* render danh sach da loc */}
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover transition-colors">
                                <td>
                                    <div className="flex items-center space-x-3">
                                        {/* 5. AVATAR TỰ ĐỘNG */}
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-10 h-10">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random&color=fff`} 
                                                    alt="Avatar" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.fullName}</div>
                                            <div className="text-xs opacity-50">NV chính thức</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="font-medium text-gray-500">{user.username}</td>
                                <td>
                                    {/* Badge giữ nguyên */}
                                    <span className={`badge badge-sm border-0 py-3 px-3 ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                        user.role === 'kitchen' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role === 'admin' ? '👑 Quản lý' : 
                                         user.role === 'kitchen' ? '👨‍🍳 Bếp' : '📝 Order'}
                                    </span>
                                </td>
                                <td className="flex justify-center gap-2 pt-3">
                                    <button onClick={() => handleEdit(user)} className="btn btn-square btn-xs btn-ghost text-blue-500">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDeleteClick(user)} className="btn btn-square btn-xs btn-ghost text-red-500">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-400">
                                    Không tìm thấy nhân viên nào 🤔
                                </td>
                            </tr>
                        )}



                        
                    </tbody>
                </table>
            </div>

            {/* MODAL (FORM THÊM/SỬA) */}
            {modalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            {isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
                        </h3>
                        
                        <div className="form-control gap-3">

                            <div>
                                <label className="label-text">Họ và Tên</label>
                                <input 
                                    type="text" 
                                    className="input input-bordered w-full" 
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="label-text">Tên đăng nhập</label>
                                <input 
                                    type="text" 
                                    className="input input-bordered w-full" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    disabled={isEditing} // Không cho sửa username
                                />
                            </div>
                            


                            <div>
                                <label className="label-text">
                                    {isEditing ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                                </label>
                                <input 
                                    type="password" 
                                    className="input input-bordered w-full" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="label-text">Vai trò</label>
                                <select 
                                    className="select select-bordered w-full"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="staff">Nhân viên Order</option>
                                    <option value="kitchen">Bếp</option>
                                    <option value="admin">Quản lý (Admin)</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>Lưu lại</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN XÓA */}
            {deleteModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-2xl text-red-500">⚠️ Xác nhận xóa</h3>
                        <p className="py-4 text-lg">
                            Bạn có chắc chắn muốn xóa nhân viên <span className="font-bold">{userToDelete?.fullName}</span> ({userToDelete?.username}) không?
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
                                onClick={handleConfirmDelete}
                            >
                                🗑️ Xóa ngay
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

export default EmployeePage;