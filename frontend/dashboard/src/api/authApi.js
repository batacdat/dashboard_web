import axiosClient from "./axiosClient";


const authApi = {
    login: (data) => {
        return axiosClient.post('/auth/login', data);
    },
    register: (data) => {
        return axiosClient.post('/auth/register', data);
    },
    changePassword: (data) => {
        return axiosClient.put('/auth/change-password', data);
    }
};
export default authApi;





