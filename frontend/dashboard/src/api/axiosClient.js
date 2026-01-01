import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/api', //duong dan den server backend
    headers: {
        'Content-Type': 'application/json',
    },
});



axiosClient.interceptors.request.use( async (config) => {

    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;

});

// xu ly khi token het han hoac khong hop le
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response &&(  error.response.status === 401 || error.response.status === 403)) {
            // Xoa token va user khoi localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Chuyen huong ve trang login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);




















export default axiosClient;