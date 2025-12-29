import React, { useEffect, useState } from 'react';
import orderApi from '../api/orderApi';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, // Thêm các components mới
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Màu sắc cho biểu đồ tròn (Top món ăn)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const DashboardPage = () => {
  // Thêm state filterType
  const [filterType, setFilterType] = useState('day'); // 'day', 'month', 'year'
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    chartData: [],
    pieData: [] // Dữ liệu món ăn
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Truyền filterType vào API
        const res = await orderApi.getStats(filterType);
        // API controller trả về data nằm trong res hoặc res.data tùy cấu hình axios
        setStats(res.data || res); 
      } catch (error) {
        console.error("Lỗi thống kê:", error);
      }
    };
    fetchStats();
  }, [filterType]); // Chạy lại khi filterType thay đổi

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">📊 Dashboard Quản Trị</h2>
          
          {/* 👇 NÚT BỘ LỌC THỜI GIAN */}
          <div className="join">
            <button 
                className={`join-item btn ${filterType === 'day' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterType('day')}
            >Ngày</button>
            <button 
                className={`join-item btn ${filterType === 'month' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterType('month')}
            >Tháng</button>
            <button 
                className={`join-item btn ${filterType === 'year' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterType('year')}
            >Năm</button>
          </div>
      </div>

      {/* THẺ TỔNG QUAN (Giữ nguyên) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="stat bg-white shadow-xl rounded-xl">
          <div className="stat-title text-gray-500 font-bold">Tổng Đơn Hàng ({filterType})</div>
          <div className="stat-value text-primary">{stats.totalOrders}</div>
        </div>
        <div className="stat bg-white shadow-xl rounded-xl">
          <div className="stat-title text-gray-500 font-bold">Doanh Thu ({filterType})</div>
          <div className="stat-value text-secondary">
             {stats.totalRevenue?.toLocaleString()} ₫
          </div>
        </div>
      </div>

      {/* 👇 GRID BIỂU ĐỒ MỚI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. BIỂU ĐỒ DOANH THU (Kết hợp Cột & Đường) */}
          <div className="bg-white p-6 rounded-xl shadow-xl h-[400px]">
            <h3 className="text-xl font-bold mb-4">📈 Xu hướng Doanh thu</h3>
            <ResponsiveContainer width="100%" height="100%">
                {/* Dùng ComposedChart hoặc chỉ cần đổi BarChart -> LineChart tùy ý */}
                {/* Ở đây tôi dùng LineChart cho 'month'/'year' nhìn chuyên nghiệp hơn */}
                {filterType === 'day' ? (
                     <BarChart data={stats.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                        <Legend />
                        <Bar dataKey="revenue" name="Doanh thu" fill="#8884d8" />
                    </BarChart>
                ) : (
                    <LineChart data={stats.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#82ca9d" strokeWidth={3} />
                    </LineChart>
                )}
            </ResponsiveContainer>
          </div>

          {/* 2. DANH SÁCH TOP MÓN ĂN (Thay thế PieChart) */}
          <div className="bg-white p-6 rounded-xl shadow-xl h-[400px] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">🍕 Top 5 Món Bán Chạy</h3>
              
              <div className="flex flex-col gap-4">
                  {stats.pieData && stats.pieData.length > 0 ? (
                      stats.pieData.map((item, index) => {
                          // Tính phần trăm để vẽ thanh bar (item.value / max)
                          const maxVal = Math.max(...stats.pieData.map(i => i.value));
                          const percent = (item.value / maxVal) * 100;
                          
                          return (
                              <div key={index} className="flex flex-col w-full">
                                  {/* Tên món và Số lượng */}
                                  <div className="flex justify-between mb-1">
                                      <span className="font-semibold text-gray-700 truncate w-3/4">
                                          #{index + 1}. {item.name}
                                      </span>
                                      <span className="font-bold text-primary">{item.value} phần</span>
                                  </div>
                                  
                                  {/* Thanh màu hiển thị độ dài */}
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                          className="h-2.5 rounded-full" 
                                          style={{ 
                                              width: `${percent}%`, 
                                              backgroundColor: COLORS[index % COLORS.length] 
                                          }}
                                      ></div>
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      <div className="text-center text-gray-400 mt-10">Chưa có dữ liệu</div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;