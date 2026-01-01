import axiosClient from './axiosClient';

const menuApi = {
    getAll: () => {
        return axiosClient.get('/menu');
    },
    create: (data) => {
        return axiosClient.post('/menu', data);
    },
    update: (id, data) => {
        return axiosClient.put(`/menu/${id}`, data);
    },
    delete: (id) => {
        return axiosClient.delete(`/menu/${id}`);
    },
    toggleStatus: (id) => {
        return axiosClient.patch(`/menu/${id}/toggle`);
    }
};
export default menuApi;