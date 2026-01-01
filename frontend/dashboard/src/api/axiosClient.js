import axios from 'axios';

// 👇 1. Cấu hình đường dẫn động (Quan trọng khi deploy)
// Nếu có biến môi trường (trên Vercel) thì dùng nó, không thì dùng localhost
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:3000/api';

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(async (config) => {
    // 👇 2. Sửa lại tên key cho khớp với LoginPage (accessToken)
    // Nếu bạn chắc chắn trong LoginPage lưu là 'token' thì đổi lại nhé
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý khi token hết hạn hoặc không hợp lệ
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Xóa token và user khỏi localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Chuyển hướng về trang login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;