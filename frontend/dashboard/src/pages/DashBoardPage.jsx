import React, { useEffect, useState } from 'react';
import orderApi from '../api/orderApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await orderApi.getStats();
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">📊 Thống kê doanh thu</h2>

      {/* CÁC THẺ SỐ LIỆU TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Thẻ 1: Tổng doanh thu */}
        <div className="stats shadow bg-white text-primary-content overflow-x-hidden ">
          <div className="stat">
            <div className="stat-title text-gray-500 font-bold">Tổng doanh thu</div>
            <div className="stat-value text-primary text-2xl">
              {stats.totalRevenue.toLocaleString()} đ
            </div>
            <div className="stat-desc text-gray-400">Tất cả các đơn đã thanh toán</div>
          </div>
        </div>

        {/* Thẻ 2: Tổng đơn hàng */}
        <div className="stats shadow bg-white ">
          <div className="stat">
            <div className="stat-title text-gray-500 font-bold">Số đơn đã bán</div>
            <div className="stat-value text-secondary text-2xl">{stats.totalOrders}</div>
            <div className="stat-desc">Đơn hàng thành công</div>
          </div>
        </div>

        {/* Thẻ 3: Món bán chạy (Ví dụ giả lập) */}
        <div className="stats shadow bg-white overflow-x-hidden">
          <div className="stat">
            <div className="stat-title text-gray-500 font-bold">Trạng thái hệ thống</div>
            <div className="stat-value text-success text-2xl">Ổn định</div>
            <div className="stat-desc">Server đang chạy tốt</div>
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ CỘT */}
      <div className="bg-white p-6 rounded-xl shadow-xl h-[400px]">
        <h3 className="text-xl font-bold mb-4">📈 Biểu đồ doanh thu theo ngày</h3>
        
        {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={stats.chartData}
                    // 👇 1. Tăng bottom lên 20 để có chỗ thở cho trục X
                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                    
                    {/* 👇 2. Thêm wrapperStyle để đẩy chữ "Doanh thu" xuống dưới */}
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    
                    <Bar dataKey="revenue" name="Doanh thu" fill="#8884d8" barSize={50} />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
                Chưa có dữ liệu để vẽ biểu đồ
            </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;