import React, { useEffect, useState } from 'react';
import orderApi from '../api/orderApi';
import { 
    AreaChart, Area, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardPage = () => {
  // 👉 MẶC ĐỊNH LÀ 'month' ĐỂ XEM DOANH THU TỪNG NGÀY
  const [filterType, setFilterType] = useState('month'); 
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    chartData: [],
    pieData: [] 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await orderApi.getStats(filterType);
        console.log("data thống kê:", res);
        setStats(res.data || res); 
      } catch (error) {
        console.error("Lỗi thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filterType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

  // Custom Tooltip cho biểu đồ nhìn Pro hơn
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Tổng quan doanh thu</h1>
            <p className="text-slate-500 mt-1">
                {filterType === 'day' && 'Thống kê theo giờ trong ngày'}
                {filterType === 'month' && 'Thống kê từng ngày trong tháng'}
                {filterType === 'year' && 'Thống kê từng tháng trong năm'}
            </p>
        </div>
        
        <div className="join bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button 
                className={`join-item btn btn-sm border-none px-6 ${filterType === 'day' ? 'btn-primary text-white shadow-md' : 'btn-ghost text-gray-500'}`} 
                onClick={() => setFilterType('day')}
            >Ngày</button>
            <button 
                className={`join-item btn btn-sm border-none px-6 ${filterType === 'month' ? 'btn-primary text-white shadow-md' : 'btn-ghost text-gray-500'}`} 
                onClick={() => setFilterType('month')}
            >Tháng</button>
            <button 
                className={`join-item btn btn-sm border-none px-6 ${filterType === 'year' ? 'btn-primary text-white shadow-md' : 'btn-ghost text-gray-500'}`} 
                onClick={() => setFilterType('year')}
            >Năm</button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Doanh thu */}
          <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10">
                  <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Doanh thu tổng</div>
                  <div className="text-3xl font-bold text-slate-800 mt-2">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="mt-2 text-sm text-green-600 bg-green-50 inline-block px-2 py-1 rounded-lg font-semibold">
                    💰 Tiền thực nhận
                  </div>
              </div>
          </div>

          {/* Đơn hàng */}
          <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
               <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10">
                  <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Tổng đơn hàng</div>
                  <div className="text-3xl font-bold text-slate-800 mt-2">{stats.totalOrders}</div>
                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-lg font-semibold">
                    🧾 Đơn đã tạo
                  </div>
              </div>
          </div>

          {/* Giá trị TB */}
          <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
               <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10">
                  <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Trung bình / Đơn</div>
                  <div className="text-3xl font-bold text-slate-800 mt-2">{formatCurrency(avgOrderValue)}</div>
                  <div className="mt-2 text-sm text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded-lg font-semibold">
                    📈 Hiệu quả
                  </div>
              </div>
          </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* AREA CHART - DOANH THU */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-slate-700">Biểu đồ tăng trưởng</h3>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                    {filterType === 'month' ? 'Theo ngày' : 'Theo thời gian'}
                  </span>
              </div>
              
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}}
                            tickFormatter={(value) => `${value/1000}k`} 
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* PIE CHART - TOP ITEMS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-xl text-slate-700 mb-6">Món bán chạy</h3>

              <div className="h-56 w-full mb-4 relative">
                 {stats.pieData && stats.pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60} 
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value + ' phần', '']} contentStyle={{borderRadius: '12px'}} />
                        </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        Chưa có dữ liệu
                    </div>
                 )}
                 {/* Số tổng ở giữa biểu đồ tròn */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-bold text-slate-700">{stats.totalOrders}</span>
                     <span className="text-xs text-gray-400 font-medium">Đơn hàng</span>
                 </div>
              </div>

              {/* Danh sách chi tiết */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-40">
                  {stats.pieData && stats.pieData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between mb-3 last:mb-0">
                          <div className="flex items-center gap-3">
                              <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{backgroundColor: COLORS[index % COLORS.length]}}
                              ></div>
                              <span className="text-sm font-medium text-slate-600 truncate w-32" title={item.name}>
                                  {item.name}
                              </span>
                          </div>
                          <span className="text-sm font-bold text-slate-700">{item.value}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;