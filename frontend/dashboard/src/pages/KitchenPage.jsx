import React, { useEffect, useState } from 'react';
import orderApi from '../api/orderApi';



  // Hàm load dữ liệu
  // Thay thế hàm fetchOrders cũ bằng đoạn này:
const KitchenPage = () => {
  const [orders, setOrders] = useState([]);

  // Đưa hàm fetchOrders ra ngoài useEffect
  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll();
      
      // 1. Kiểm tra xem res.data có phải là mảng không? 
      const orderList = Array.isArray(res.data) ? res.data : [];
  
      console.log("🔥 Danh sách đơn hàng:", orderList);
  
      // 2. Lọc đơn (Xử lý an toàn cả chữ hoa/thường)
      const activeOrders = orderList.filter(order => {
        const currentStatus = order.status ? order.status.toLowerCase() : '';
        
        return currentStatus === 'pending' || currentStatus === 'cooking';
      });
  
      setOrders(activeOrders);
    } catch (error) {
      console.error("Lỗi load đơn:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Tự động refresh mỗi 5 giây
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý chuyển trạng thái
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      await fetchOrders(); // Giờ có thể gọi được
    } catch (error) {
      alert("Lỗi cập nhật: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">👨‍🍳 Bếp - Danh sách món cần làm ({orders.length})</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <div key={order._id} className={`card shadow-xl border-2 ${order.status === 'pending' ? 'border-warning bg-yellow-50' : 'border-success bg-green-50'}`}>
            <div className="card-body p-4">
              
              {/* Header của Card */}
                <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-300">
                <h3 className="card-title text-xl">
                    {/* 👇 SỬA DÒNG NÀY: Ưu tiên lấy table_name */}
                    {order.table_name || order.tableName || "Bàn ?"} 
                </h3>
                
                <span className={`badge ${order.status === 'pending' ? 'badge-warning' : 'badge-success text-white'} font-bold`}>
                    {order.status === 'pending' ? 'Chờ làm' : 'Đang nấu'}
                </span>
                </div>

              {/* Danh sách món trong đơn */}
              <ul className="space-y-2 mb-4 min-h-[100px]">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between text-lg">
                    <span className="font-bold text-gray-700">{item.quantity}x {item.name}</span>
                  </li>
                ))}
              </ul>
              
              <div className="text-xs text-gray-500 mb-4">
                Giờ gọi: {new Date(order.created_at || order.createdAt).toLocaleTimeString()}
              </div>

              {/* Nút hành động */}
              <div className="card-actions justify-end">
                {order.status === 'pending' && (
                  <button 
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => handleStatusChange(order._id, 'cooking')}
                  >
                    🔥 Bắt đầu nấu
                  </button>
                )}
                
                {order.status === 'cooking' && (
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

        {orders.length === 0 && (
            <div className="col-span-full text-center py-20">
                <p className="text-2xl text-gray-400">Hiện tại không có đơn nào. Bếp nghỉ ngơi! 😴</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPage;