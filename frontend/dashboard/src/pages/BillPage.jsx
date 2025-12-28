import React, { useEffect, useState } from 'react';
import orderApi from '../api/orderApi';

const BillPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null); // Bàn đang chọn để xem bill

  // Hàm chuẩn hóa dữ liệu (giống bên Kitchen để tránh lỗi tên bàn)
  const processData = (data) => {
    return data.map(item => ({
      ...item,
      displayTable: item.table_name || item.tableName || "Bàn ?",
      displayStatus: (item.status || 'pending').toLowerCase()
    }));
  };

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll();
      const rawData = Array.isArray(res.data) ? res.data : [];
      
      // Chỉ lấy các đơn CHƯA thanh toán (loại bỏ 'paid')
      // Bao gồm cả pending, cooking, completed đều phải trả tiền
      const activeOrders = processData(rawData).filter(o => o.displayStatus !== 'paid');
      setOrders(activeOrders);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- LOGIC GỘP ĐƠN THEO BÀN ---
  // Kết quả: { "Bàn 1": [Order1, Order2], "Bàn 2": [Order3] }
  const tables = orders.reduce((acc, order) => {
    const tableName = order.displayTable;
    if (!acc[tableName]) {
      acc[tableName] = [];
    }
    acc[tableName].push(order);
    return acc;
  }, {});

  const tableNames = Object.keys(tables).sort(); // Danh sách tên bàn

  // --- TÍNH TỔNG TIỀN CHO BÀN ĐANG CHỌN ---
  const calculateTotal = (tableOrders) => {
    return tableOrders.reduce((sum, order) => {
        // Cộng tổng tiền của từng order con (nếu order chưa có total_amount thì tính tổng item)
        const orderTotal = order.total_amount || order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
        return sum + orderTotal;
    }, 0);
  };

  // --- XỬ LÝ THANH TOÁN ---
  const handleCheckout = async () => {
    if (!selectedTable) return;
    
    if (window.confirm(`Xác nhận thanh toán cho ${selectedTable}? Tiền sẽ về két! 💰`)) {
        try {
            // Lấy tất cả ID đơn hàng của bàn này
            const ordersToPay = tables[selectedTable];
            
            // Duyệt qua từng đơn và update status thành 'paid'
            // (Thực tế nên có API gộp, nhưng ta dùng vòng lặp cho đơn giản lúc này)
            for (const order of ordersToPay) {
                await orderApi.updateStatus(order._id, 'paid');
            }

            alert("Thanh toán thành công!");
            setSelectedTable(null); // Bỏ chọn
            fetchOrders(); // Load lại dữ liệu
        } catch (error) {
            alert("Lỗi thanh toán: " + error.message);
        }
    }
  };

  return (
    <div className="flex h-screen bg-base-200 p-4 gap-4">
      
      {/* CỘT TRÁI: DANH SÁCH BÀN */}
      <div className="w-1/3 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-primary text-white font-bold text-lg">
            🏢 Các bàn đang phục vụ
        </div>
        <div className="overflow-y-auto flex-1 p-2">
            {tableNames.length === 0 && <div className="text-center p-10 text-gray-400">Quán đang vắng khách</div>}
            
            {tableNames.map(name => (
                <div 
                    key={name}
                    onClick={() => setSelectedTable(name)}
                    className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center ${selectedTable === name ? 'bg-blue-100 border-l-4 border-blue-600' : ''}`}
                >
                    <div className="font-bold text-lg">{name}</div>
                    <div className="badge badge-ghost">{tables[name].length} đơn</div>
                </div>
            ))}
        </div>
      </div>

      {/* CỘT PHẢI: CHI TIẾT HÓA ĐƠN */}
      <div className="w-2/3 bg-white rounded-xl shadow-xl flex flex-col relative">
        {!selectedTable ? (
            <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                <span className="text-6xl mb-4">🧾</span>
                <p>Chọn một bàn để xem hóa đơn</p>
            </div>
        ) : (
            <>
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Hóa đơn: {selectedTable}</h2>
                        <p className="text-sm text-gray-500">Ngày: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="badge badge-success text-white p-3">Đang phục vụ</div>
                </div>

                {/* LIST CÁC MÓN ĂN */}
                <div className="flex-1 overflow-y-auto p-6">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th>Món ăn</th>
                                <th className="text-center">SL</th>
                                <th className="text-right">Đơn giá</th>
                                <th className="text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables[selectedTable].map(order => (
                                order.items.map((item, idx) => (
                                    <tr key={order._id + idx} className="border-b">
                                        <td>
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-xs text-gray-400 opacity-70">Đơn lúc: {new Date(order.created_at || order.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="text-center font-bold">{item.quantity}</td>
                                        <td className="text-right">{item.price?.toLocaleString()}</td>
                                        <td className="text-right font-bold">{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER THANH TOÁN */}
                <div className="p-6 bg-gray-900 text-white rounded-b-xl">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xl">Tổng cộng phải thu:</span>
                        <span className="text-3xl font-bold text-yellow-400">
                            {calculateTotal(tables[selectedTable]).toLocaleString()} VNĐ
                        </span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        className="btn btn-warning w-full btn-lg text-lg hover:scale-[1.02] transition-transform"
                    >
                        💰 THANH TOÁN & IN HÓA ĐƠN
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default BillPage;