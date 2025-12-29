

import axiosClient from "./axiosClient";

const orderApi = {
 getAll: () => {
        return axiosClient.get('/orders');
    },
    create: (data) => {
        return axiosClient.post('/orders', data);
    },
    updateStatus: (id, status) => {
        // Nó tự động tạo object { status: ... } ở đây rồi
        return axiosClient.put(`/orders/${id}`, { status }); 
    },
    updateOrder: (id, updateData) => {
        return axiosClient.put(`/orders/${id}`, updateData);
    },
    getStats: () => {
        return axiosClient.get('/orders/stats');
    }
};

export default orderApi;