import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/api', //duong dan den server backend
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosClient;