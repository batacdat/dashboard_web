import React, { useState } from 'react';
import authApi from '../api/authApi';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    
    // State quản lý chế độ: true = Đăng nhập, false = Đăng ký
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State dữ liệu form (Thêm trường role mặc định là 'staff')
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        confirmPassword: '', 
        role: 'staff' // Mặc định là nhân viên
    });

    // Xử lý khi nhập liệu
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    // Xử lý Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLoginMode) {
                // --- LOGIC ĐĂNG NHẬP ---
                // Khi đăng nhập thì không quan tâm role, server tự trả về
                const res = await authApi.login({
                    username: formData.username,
                    password: formData.password
                });
                handleAuthSuccess(res);
            } else {
                // --- LOGIC ĐĂNG KÝ ---
                if (formData.password !== formData.confirmPassword) {
                    setError("Mật khẩu xác nhận không khớp!");
                    setIsLoading(false);
                    return;
                }
                
                // Gửi kèm role lên server
                const res = await authApi.register({
                    username: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    role: formData.role // <--- Gửi role người dùng chọn
                });
                
                if(res.data.token) {
                    handleAuthSuccess(res);
                } else {
                    alert("Đăng ký thành công! Vui lòng đăng nhập.");
                    setIsLoginMode(true);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthSuccess = (res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        const role = res.data.user.role;

        if (role === 'admin') {
            navigate('/dashboard'); // Admin thì vào xem Thống kê
        } else if (role === 'kitchen') {
            navigate('/kitchen');   // Bếp thì vào trang Bếp
        } else {
            navigate('/');          // Nhân viên (staff) thì vào trang Gọi món
        }
        window.location.reload(); 
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
            <div className="card w-full max-w-md bg-white shadow-2xl ">
                <div className="card-body p-8">
                    
                    {/* LOGO */}
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-2 animate-bounce">🍜</div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            {isLoginMode ? "Đăng Nhập" : "Đăng Ký"}
                        </h2>
                        <p className="text-gray-500 mt-1">Hệ thống POS Nhà hàng</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="alert alert-error text-sm py-2 shadow-md">
                                <span>{error}</span>
                            </div>
                        )}
                        {!isLoginMode && (
                            <>
                                                                {/* Input Full Name */}
                                <div className="form-control animate-fade-in-down">
                                    <label className="label py-1"><span className="label-text font-bold">Họ và tên</span></label>
                                    <input 
                                        type="text" name="fullName" placeholder="Ví dụ: Nguyễn Văn A" 
                                        className="input input-bordered w-full bg-gray-50 focus:input-primary" 
                                        value={formData.fullName} onChange={handleChange} required
                                    />
                                </div>
                            </>
                        )}
                   

                        {/* Input Username */}
                        <div className="form-control">
                            <label className="label py-1"><span className="label-text font-bold">Tên đăng nhập</span></label>
                            <input 
                                type="text" name="username" placeholder="Ví dụ: admin" 
                                className="input input-bordered w-full bg-gray-50 focus:input-primary" 
                                value={formData.username} onChange={handleChange} required
                            />
                        </div>

                        {/* Input Password */}
                        <div className="form-control">
                            <label className="label py-1"><span className="label-text font-bold">Mật khẩu</span></label>
                            <input 
                                type="password" name="password" placeholder="••••••••" 
                                className="input input-bordered w-full bg-gray-50 focus:input-primary" 
                                value={formData.password} onChange={handleChange} required
                            />
                        </div>

                        {/* --- PHẦN RIÊNG CỦA ĐĂNG KÝ --- */}
                        {!isLoginMode && (
                            <>
                                {/* Xác nhận mật khẩu */}
                                <div className="form-control animate-fade-in-down">
                                    <label className="label py-1"><span className="label-text font-bold">Nhập lại mật khẩu</span></label>
                                    <input 
                                        type="password" name="confirmPassword" placeholder="••••••••" 
                                        className="input input-bordered w-full bg-gray-50 focus:input-primary" 
                                        value={formData.confirmPassword} onChange={handleChange} required
                                    />
                                </div>
                               
                                {/* 👇 CHỌN QUYỀN (ROLE) - QUAN TRỌNG */}
                                <div className="form-control animate-fade-in-down">
                                    <label className="label py-1"><span className="label-text font-bold">Vai trò</span></label>
                                    <select 
                                        name="role" 
                                        className="select select-bordered w-full bg-gray-50 focus:select-primary font-medium"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="staff">👤 Nhân viên (Staff)</option>
                                        <option value="kitchen">👨‍🍳 Bếp (Kitchen)</option>
                                        {/* <option value="admin">🛠 Quản lý (Admin)</option> */}
                                    </select>
                                    <label className="label">
                                        <span className="label-text-alt text-gray-400">Chọn vai trò phù hợp với công việc</span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Button Submit */}
                        <button 
                            className={`btn btn-primary w-full text-lg mt-4 shadow-lg ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : (isLoginMode ? "Đăng Nhập Ngay" : "Tạo Tài Khoản")}
                        </button>
                    </form>

                    {/* Footer Toggle */}
                    <div className="divider text-gray-300 text-sm">Hoặc</div>
                    <div className="text-center">
                        <button 
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setError('');
                                setFormData({ username: '', password: '', confirmPassword: '', role: 'staff' });
                            }}
                            className="btn btn-link no-underline hover:no-underline text-primary font-bold"
                        >
                            {isLoginMode ? "👉 Tạo tài khoản mới" : "👈 Quay lại đăng nhập"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;