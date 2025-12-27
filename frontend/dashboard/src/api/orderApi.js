import axiosClient from "./axiosClient";

const orderApi = {
 getAll: () => {
        return axiosClient.get('/orders');
    },
    create: (data) => {
        return axiosClient.post('/orders', data);
    },
    updateStatus: (id, status) => {
        return axiosClient.put(`/orders/${id}`, { status });
    },
    // delete: (id) => {
    //     return axiosClient.delete(`/orders/${id}`);
    // }
};

export default orderApi;