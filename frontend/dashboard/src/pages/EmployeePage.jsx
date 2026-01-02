import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';
import { toast } from 'react-toastify';
import socket from '../api/socket';
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const EmployeePage = () => {
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 👇 1. CẬP NHẬT STATE CHO TÌM KIẾM VÀ LỌC
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedRole, setSelectedRole] = useState("all"); // Thêm state lọc theo vai trò

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Danh sách vai trò để lọc
    const filterRoles = [
        { value: 'all', label: 'Tất cả vai trò' },
        { value: 'admin', label: 'Quản lý (Admin)' },
        { value: 'kitchen', label: 'Bếp' },
        { value: 'cashier', label: 'Thu ngân' },
        { value: 'staff', label: 'Nhân viên Order' }
    ];

    const [formData, setFormData] = useState({
        _id: null,
        username: '',
        password: '',
        fullName: '',
        role: 'staff' 
    });

    const fetchUsers = async () => {
        try {
            const res = await userApi.getAll();
            setUsers(res.data || res);
        } catch (error) {
            toast.error("Lỗi tải danh sách nhân viên: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => { 
        fetchUsers();
        const handleUserUpdate = (data) => {
            if(data.type === 'CREATE') {
                setUsers((prevUsers) => [data.user, ...prevUsers]);
                toast.info(`🎉 Có nhân viên mới: ${data.user.fullName}`);
            } else {
                fetchUsers();
            }
        };
        socket.on('USER_UPDATE', handleUserUpdate);
        return () => {
            socket.off('USER_UPDATE', handleUserUpdate);
        };
    }, []);

    const handleAddNew = () => {
        setFormData({ _id: null, username: '', password: '', fullName: '', role: 'staff' });
        setIsEditing(false);
        setModalOpen(true);
    };

    const handleEdit = (user) => {
        setFormData({ ...user, password: '' });
        setIsEditing(true);
        setModalOpen(true);
    };

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
            fetchUsers();
        } catch (error) {
            toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);   
        setDeleteModalOpen(true); 
    };

    const handleConfirmDelete = async () => {
        if(!userToDelete) return;
        try {
            await userApi.delete(userToDelete._id);
            toast.success("Đã xóa nhân viên: " + userToDelete.fullName);
            fetchUsers(); 
            setDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            toast.error("Lỗi xóa nhân viên: " + (error.response?.data?.message || error.message));
        }
    };

    // 👇 2. LOGIC LỌC MỚI (Kết hợp Tên + Vai trò)
    const filteredUsers = users.filter(user => {
        // Điều kiện 1: Khớp vai trò
        const matchRole = selectedRole === 'all' || user.role === selectedRole;
        // Điều kiện 2: Khớp tên hoặc username
        const matchSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchRole && matchSearch;
    });

    return (
        <div className="p-4 bg-base-200 min-h-screen dark:bg-gray-900">
            {/* TIÊU ĐỀ */}
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-purple-100">👥 Quản Lý Nhân Viên</h2>

            {/* 👇 3. GIAO DIỆN TÌM KIẾM & LỌC (Đồng bộ với MenuPage) */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white dark:bg-gray-700 dark:border-gray-400 p-4 rounded-xl shadow-sm items-center">
                
                {/* Ô TÌM KIẾM */}
                <div className="form-control w-full md:w-1/3 0 ">
                    <input 
                        type="text" 
                        placeholder="🔍 Tìm theo tên hoặc username..." 
                        className="input input-bordered w-full dark:bg-gray-600 dark:text-purple-100 dark:border-purple-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* DROPDOWN CHỌN VAI TRÒ (Mới thêm) */}
                <select 
                    className="select select-bordered w-full md:w-1/4 dark:bg-gray-600 dark:text-purple-100 dark:border-purple-100"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    {filterRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                </select>

                {/* NÚT THÊM MỚI (Đẩy sang phải) */}
                <div className="md:ml-auto w-full md:w-auto">
                    <button className="btn btn-primary w-full md:w-auto" onClick={handleAddNew}>
                        + Thêm Nhân Viên
                    </button>
                </div>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-xl dark:bg-gray-700 dark:text-purple-100">
                <table className="table w-full">
                    <thead className="bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-purple-100">
                        <tr>
                            <th>Họ và Tên</th>
                            <th>Username</th>
                            <th>Vai trò</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user._id} className="hover transition-colors dark:hover:!bg-black/20">
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="avatar hidden md:block">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random&color=fff`} 
                                                        alt="Avatar" 
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{user.fullName}</div>
                                                <div className="hidden md:block text-xs opacity-50">NV chính thức</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-medium text-gray-500 dark:text-purple-100">{user.username}</td>
                                    <td>
                                        <span className={`badge border-0 py-3 px-3 ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                            user.role === 'kitchen' ? 'bg-orange-100 text-orange-800' : 
                                            user.role === 'cashier' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role === 'admin' ? 'Admin' : 
                                             user.role === 'kitchen' ? 'Kitchen' : 
                                             user.role === 'cashier' ? 'Cashier' : 'Order'}
                                        </span>
                                    </td>
                                    <td className="flex justify-center gap-2 pt-4">
                                        {/* Nút Sửa */}
                                        <button 
                                            onClick={() => handleEdit(user)} 
                                            className="btn btn-sm btn-ghost text-blue-500 hover:bg-blue-100 tooltip" 
                                            data-tip="Sửa"
                                        >
                                            <FaEdit size={18} />
                                        </button>

                                        {/* Nút Xóa */}
                                        <button 
                                            onClick={() => handleDeleteClick(user)} 
                                            className="btn btn-sm btn-ghost text-error hover:bg-red-100 tooltip" 
                                            data-tip="Xóa"
                                        >
                                            <FaTrashAlt size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-400 dark:text-purple-100">
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
                                <label className="label-text mb-1">Họ và Tên</label>
                                <input 
                                    type="text" 
                                    className="input input-bordered w-full" 
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="label-text mb-1">Tên đăng nhập</label>
                                <input 
                                    type="text" 
                                    className="input input-bordered w-full" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    disabled={isEditing} 
                                />
                            </div>

                            <div>
                                <label className="label-text mb-1">
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
                                <label className="label-text mb-1">Vai trò</label>
                                <select 
                                    className="select select-bordered w-full"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="staff">Nhân viên Order</option>
                                    <option value="kitchen">Bếp</option>
                                    <option value="cashier">Thu ngân</option>
                                    <option value="admin">Quản lý (Admin)</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn" onClick={() => setModalOpen(false)}>Hủy</button>
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
                            Bạn có chắc chắn muốn xóa nhân viên <span className="font-bold">{userToDelete?.fullName}</span> không?
                        </p>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Hủy bỏ</button>
                            <button className="btn btn-error text-white" onClick={handleConfirmDelete}>🗑️ Xóa ngay</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setDeleteModalOpen(false)}></div>
                </div>
            )}
        </div>
    );
};

export default EmployeePage;