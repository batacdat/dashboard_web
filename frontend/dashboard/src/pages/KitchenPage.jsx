import React, { useEffect, useState } from 'react';
import orderApi from '../api/orderApi';

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);

  // --- HÀM XỬ LÝ DỮ LIỆU ---
  // Hàm này giúp đồng bộ tên bàn dù dữ liệu cũ hay mới
  const processOrderData = (order) => {
    return {
      ...order,
      // 1. ĐỒNG BỘ TÊN BÀN:
      // Code sẽ ưu tiên tìm 'table_name' (theo file Order.js của bạn).
      // Nếu không thấy, nó tìm 'tableName' (dữ liệu cũ).
      // Nếu không có cả hai, nó hiện "Bàn ?"
      displayTableName: order.table_name || order.tableName || "Bàn ?",

      // 2. Xử lý trạng thái (tránh lỗi viết hoa/thường)
      displayStatus: (order.status || 'pending').toLowerCase(),

      // 3. Xử lý thời gian
      displayTime: new Date(order.created_at || order.createdAt || Date.now()).toLocaleTimeString()
    };
  };

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll();
      
      // Kiểm tra an toàn: Nếu API lỗi không trả về mảng, dùng mảng rỗng
      const rawData = Array.isArray(res.data) ? res.data : [];

      // Lọc và Xử lý dữ liệu
      const activeOrders = rawData
        .map(processOrderData) // Chạy qua hàm xử lý ở trên
        .filter(order => 
          order.displayStatus === 'pending' || order.displayStatus === 'cooking'
        );

      setOrders(activeOrders);
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Tự động cập nhật mỗi 5 giây
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      fetchOrders(); // Cập nhật lại ngay lập tức
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">
        👨‍🍳 Bếp - Đang chờ xử lý ({orders.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <div key={order._id} className={`card shadow-xl border-2 ${order.displayStatus === 'pending' ? 'border-warning bg-yellow-50' : 'border-success bg-green-50'}`}>
            <div className="card-body p-4">
              
              {/* --- HEADER HIỂN THỊ TÊN BÀN --- */}
              <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-300">
                <h3 className="card-title text-xl text-blue-800 font-extrabold">
                  {/* Đây là chỗ hiển thị tên bàn đã được xử lý */}
                  {order.displayTableName} 
                </h3>
                <span className={`badge ${order.displayStatus === 'pending' ? 'badge-warning' : 'badge-success text-white'} font-bold`}>
                  {order.displayStatus === 'pending' ? 'Chờ làm' : 'Đang nấu'}
                </span>
              </div>

              {/* Danh sách món ăn */}
              <ul className="space-y-2 mb-4 min-h-[100px]">
                {order.items?.map((item, index) => (
                  <li key={index} className="flex justify-between text-lg border-b border-dashed border-gray-200 py-1">
                    <span className="font-bold text-gray-700">{item.name}</span>
                    <span className="font-bold text-red-600">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              
              <div className="text-xs text-gray-500 mb-4 italic">
                🕒 Giờ gọi: {order.displayTime}
              </div>

              {/* Nút bấm */}
              <div className="card-actions justify-end">
                {order.displayStatus === 'pending' && (
                  <button 
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => handleStatusChange(order._id, 'cooking')}
                  >
                    🔥 Bắt đầu nấu
                  </button>
                )}
                
                {order.displayStatus === 'cooking' && (
                  <button 
                    className="btn btn-success btn-sm w-full text-white"
                    onClick={() => handleStatusChange(order._id, 'completed')}
                  >
                    ✅ Đã xong món
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenPage;