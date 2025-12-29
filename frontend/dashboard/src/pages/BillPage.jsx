import React, { useEffect, useRef, useState } from 'react';
import orderApi from '../api/orderApi';
import { toast } from 'react-toastify';
// 👇 1. Import socket client
import socket from '../api/socket'; 
import { useReactToPrint } from 'react-to-print'; // 👈 Import thư viện in
import { Invoice } from '../components/Invoice';   // 👈 Import mẫu hóa đơn

const BillPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activeTab, setActiveTab] = useState('active'); 

    // 👇 1. Tạo Ref để tham chiếu đến tờ hóa đơn
  const componentRef = useRef();
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
      setOrders(processData(rawData));
    } catch (error) {
      console.error("Lỗi:", error);
      // toast.error("Lỗi tải dữ liệu"); // Có thể ẩn để đỡ spam nếu mạng lag
    }
  };

  // 👇 2. Sửa lại useEffect để lắng nghe Socket
  useEffect(() => {
    // Gọi lần đầu khi vào trang
    fetchOrders();

    // --- LẮNG NGHE SỰ KIỆN REAL-TIME ---

    // A. Khi có đơn mới từ nhân viên Order
    socket.on('newOrder', (data) => {
        // Hiện thông báo nhỏ
        toast.info(`🔔 Đơn mới: Bàn ${data.table_name} - Vừa gọi món!`);

        // Phát âm thanh "Ting" (Tùy chọn)
        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
        audio.play().catch(() => console.log("Chặn autoplay"));
        // Tải lại danh sách ngay lập tức
        fetchOrders();
    });

    // B. Khi có cập nhật trạng thái (Ví dụ: Bếp nấu xong, hoặc bàn khác thanh toán)
    socket.on('update_status', () => {
        fetchOrders();
    });

    // C. Dọn dẹp khi thoát trang (Tránh nghe nhiều lần gây lỗi)
    return () => {
        socket.off('newOrder');
        socket.off('update_status');
    };
  }, []);

  // --- (CÁC PHẦN DƯỚI GIỮ NGUYÊN KHÔNG ĐỔI) ---
  
  const activeOrders = orders.filter(o => o.displayStatus !== 'paid');
  
  const historyOrders = orders
        .filter(o => o.displayStatus === 'paid')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const tables = activeOrders.reduce((acc, order) => {
    const tableName = order.displayTable;
    if (!acc[tableName]) acc[tableName] = [];
    acc[tableName].push(order);
    return acc;
  }, {});

  const calculateTotal = (tableOrders) => {
    if (!tableOrders) return 0;
    return tableOrders.reduce((total, order) => {
        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return total + orderTotal;
    }, 0);
  };

// 👇 3. Thiết lập hàm in hóa đơn

const getInvoiceData = () => {
  if(!selectedTable || !tables[selectedTable]) return null;
  //gop tất cả đơn của bàn đã chọn thành một mảng món ăn
  const allItems = tables[selectedTable].flatMap(order => order.items);
  //cong gop cac món giống nhau
  return {
    table: selectedTable,
    items:allItems,
    total: calculateTotal(tables[selectedTable]),
    date: new Date().toLocaleString('vi-VN'),
  };
};

//4. ham goi lenh in
const handlePrint = useReactToPrint({
  contentRef:componentRef,
  documentTitle:`Hoa_don_Ban_${selectedTable}_${new Date().toLocaleDateString()}`,
  onAfterPrint: () => toast.success('🖨️ In hóa đơn thành công!'),
  onPrintError: (error) => toast.error('Lỗi in hóa đơn: ' + error.message),
});


  const handleOpenCheckoutModal = () => {
    if (!selectedTable) return;
    setShowModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);

    try {
        const tableOrders = tables[selectedTable];
        await Promise.all(tableOrders.map(order => 
            orderApi.updateStatus(order._id, 'paid')
        ));

        toast.success(`💸 Đã thanh toán xong cho ${selectedTable}!`);
        setShowModal(false);
        setSelectedTable(null);
        // fetchOrders(); // Không cần gọi ở đây nữa vì socket 'update_status' sẽ tự gọi lại
    } catch (error) {
        console.error(error);
        toast.error("Lỗi thanh toán: " + error.message);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-200 p-4 gap-4">
      {/* Tab Switcher */}
      <div className="flex justify-center bg-white p-2 rounded-xl shadow-sm">
        <div className="tabs tabs-boxed bg-transparent">
            <a 
                className={`tab tab-lg ${activeTab === 'active' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('active')}
            >
                ⏳ Đang phục vụ ({Object.keys(tables).length})
            </a>
            <a 
                className={`tab tab-lg ${activeTab === 'history' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('history')}
            >
                📜 Lịch sử giao dịch
            </a>
        </div>
      </div>

      {/* Nội dung chính */}
      {activeTab === 'active' && (
        <div className="flex flex-1 gap-4 overflow-hidden">
            {/* Cột trái: Danh sách bàn */}
            <div className="w-1/3 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
                <div className="p-4 bg-primary text-white font-bold text-lg text-center uppercase">
                    Bàn chưa thanh toán
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {Object.keys(tables).length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">Tất cả đã thanh toán xong!</div>
                    ) : (
                        Object.keys(tables).map(tableName => (
                            <div 
                                key={tableName}
                                onClick={() => setSelectedTable(tableName)}
                                className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 flex justify-between items-center
                                    ${selectedTable === tableName 
                                        ? 'bg-primary text-white shadow-lg' 
                                        : 'bg-base-100 hover:bg-gray-100'}`}
                            >
                                <div className="font-bold text-lg">🍽️ Bàn {tableName}</div>
                                <div className={`badge ${selectedTable === tableName ? 'badge-warning' : 'badge-ghost'}`}>
                                    {tables[tableName].length} đơn
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Cột phải: Chi tiết hóa đơn */}
            <div className="w-2/3 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden relative">
                {!selectedTable ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                        <span className="text-6xl mb-4">🧾</span>
                        <span className="text-xl">Chọn bàn để tính tiền</span>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-bold text-gray-800">Hóa Đơn: Bàn {selectedTable}</h2>
                            <div className="badge badge-lg badge-error">Chưa thanh toán</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-base-200">
                                        <th>Món ăn</th>
                                        <th className="text-center">SL</th>
                                        <th className="text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables[selectedTable].map((order) => (
                                        order.items.map((item, itemIdx) => (
                                            <tr key={`${order._id}-${itemIdx}`} className="hover">
                                                <td>
                                                    <div className="font-bold">{item.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(order.created_at).toLocaleTimeString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td className="text-center font-bold">{item.quantity}</td>
                                                <td className="text-right font-bold">{(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-gray-900 text-white rounded-b-xl">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl">Tổng cộng:</span>
                                <span className="text-3xl font-bold text-yellow-400">
                                    {calculateTotal(tables[selectedTable]).toLocaleString()} VNĐ
                                </span>
                            </div>

                            <div className='flex gap-4'>
                            {/* 👇 4. Nút in hóa đơn */}
                            <button onClick={handlePrint}
                                  className="btn btn-info flex-1 text-white">
                                  🖨️ IN HÓA ĐƠN
                            </button>
                              <button 
                                  onClick={handleOpenCheckoutModal} 
                                  className="btn btn-warning flex-1"
                              >
                                  💰 THANH TOÁN
                              </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* Tab Lịch sử */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-xl flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-700">📜 Các đơn đã thanh toán</h2>
                <div className="badge badge-primary badge-lg">Tổng: {historyOrders.length} đơn</div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
                <table className="table w-full table-zebra">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th>Mã đơn / Thời gian</th>
                            <th>Bàn</th>
                            <th>Chi tiết món</th>
                            <th className="text-right">Tổng tiền</th>
                            <th className="text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyOrders.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-10 text-gray-400">Chưa có giao dịch nào</td></tr>
                        ) : (
                            historyOrders.map(order => (
                                <tr key={order._id} className="hover">
                                    <td>
                                        <div className="font-bold text-xs text-gray-400">#{order._id.slice(-6)}</div>
                                        <div className="text-sm">
                                            {new Date(order.created_at).toLocaleString('vi-VN')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold text-lg text-primary">{order.displayTable}</div>
                                    </td>
                                    <td>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="text-sm">
                                                - {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="text-right font-bold text-lg">
                                        {order.total_amount?.toLocaleString()} đ
                                    </td>
                                    <td className="text-center">
                                        <div className="badge badge-success gap-2">
                                            ✅ Đã TT
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Modal xác nhận */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-2xl text-warning">⚠️ Xác nhận thanh toán</h3>
            <p className="py-4 text-lg">Bạn chắc chắn muốn kết thúc đơn của <span className="font-bold">Bàn {selectedTable}</span>?</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>Quay lại</button>
              <button className={`btn btn-primary ${isProcessing ? 'loading' : ''}`} onClick={handleConfirmPayment} disabled={isProcessing}>
                ✅ Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👇 5. Mẫu hóa đơn ẩn để in */}
      <div style={{ display: 'none' }}>
        {selectedTable && tables[selectedTable] && (
          <Invoice 
            ref={componentRef} 
            {...(selectedTable && tables[selectedTable] ? getInvoiceData() : {
              table: 'Chưa chọn bàn',
              items: [],
              total: 0,
              date: '',
            })} 
          />
        )}
      </div>
    </div>
  );
};

export default BillPage;