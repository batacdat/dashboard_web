import React, { useEffect, useRef, useState } from 'react';
import orderApi from '../api/orderApi';
import { toast } from 'react-toastify';
import socket from '../api/socket'; 
import { useReactToPrint } from 'react-to-print'; 
import { Invoice } from '../components/Invoice';   
import PaymentQRModal from '../components/PaymentQRModal'; 
import * as XLSX from 'xlsx'; // 👈 1. Import thư viện Excel

const BillPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null); 
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrOrderData, setQrOrderData] = useState(null); 
  
  // State quản lý Tab
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  const componentRef = useRef();

  // --- 1. CẤU HÌNH IN ẤN ---
  const handlePrint = useReactToPrint({
  contentRef:componentRef,
  documentTitle:`Hoa_don_Ban_${selectedTable}_${new Date().toLocaleDateString()}`,
  onAfterPrint: () => toast.success('🖨️ In hóa đơn thành công!'),
  onPrintError: (error) => toast.error('Lỗi in hóa đơn: ' + error.message),
  });

  useEffect(() => {
    if (isPrinting && selectedTable) {
        const timer = setTimeout(() => {
            handlePrint();
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [selectedTable, isPrinting, handlePrint]);

  // --- 2. XỬ LÝ DỮ LIỆU ---
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
      console.error("Lỗi tải đơn:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    socket.on('newOrder', (newOrder) => {
        setOrders(prev => processData([...prev, newOrder]));
        if(activeTab === 'active') toast.info(`🔔 Bàn ${newOrder.table_name} vừa gọi món!`);
    });
    socket.on('update_status', (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o));
    });
    return () => {
        socket.off('newOrder');
        socket.off('update_status');
    };
  }, [activeTab]);

  // --- 3. LOGIC LỌC DỮ LIỆU ---
  
  // A. Tab HOẠT ĐỘNG (Gom nhóm theo bàn)
  const activeTables = orders.reduce((acc, order) => {
    if (order.displayStatus === 'paid' || order.displayStatus === 'cancelled') return acc;
    
    const tableName = order.displayTable;
    if (!acc[tableName]) {
        acc[tableName] = {
            name: tableName,
            orders: [],
            totalAmount: 0,
            items: []
        };
    }
    acc[tableName].orders.push(order);
    acc[tableName].totalAmount += order.total_amount;
    acc[tableName].items.push(...order.items);
    return acc;
  }, {});
  
  const activeTableNames = Object.keys(activeTables).sort();

  // B. Tab LỊCH SỬ (Đã thanh toán)
  const historyOrders = orders
    .filter(o => o.displayStatus === 'paid')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Mới nhất lên đầu

  const totalRevenueHistory = historyOrders.reduce((sum, order) => sum + order.total_amount, 0);

  // --- 4. CÁC HÀM XỬ LÝ SỰ KIỆN ---

  // 👇 HÀM XUẤT EXCEL (MỚI THÊM)
  const handleExportExcel = () => {
    if (historyOrders.length === 0) {
        toast.warning("Chưa có dữ liệu để xuất!");
        return;
    }

    // 1. Map dữ liệu sang format tiếng Việt
    const dataToExport = historyOrders.map((order, index) => ({
        "STT": index + 1,
        "Mã đơn hàng": order._id.slice(-6).toUpperCase(),
        "Ngày giờ": new Date(order.updatedAt).toLocaleString('vi-VN'),
        "Bàn": order.displayTable,
        "Danh sách món": order.items.map(item => `${item.quantity}x ${item.name}`).join(', '),
        "Tổng tiền": order.total_amount,
        "Trạng thái": "Đã thanh toán"
    }));

    // 2. Tạo Sheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Chỉnh độ rộng cột
    worksheet['!cols'] = [
        { wch: 5 },  // STT
        { wch: 10 }, // Mã đơn
        { wch: 22 }, // Ngày giờ
        { wch: 10 }, // Bàn
        { wch: 50 }, // Món ăn
        { wch: 15 }, // Tổng tiền
        { wch: 15 }  // Trạng thái
    ];

    // 3. Tạo Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lịch sử Giao dịch");

    // 4. Xuất file
    const fileName = `Doanh_thu_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success("✅ Đã xuất file Excel thành công!");
  };

  // Hàm in hóa đơn
  const handlePrintBill = (tableName) => {
    setSelectedTable(tableName);
    setIsPrinting(true);
  };

    // --- 5. DATA CHO HÓA ĐƠN ---
  const getInvoiceData = () => {
    if (selectedTable && activeTables[selectedTable]) {
        const data = activeTables[selectedTable];
        return {
            table: data.name,
            items: data.items,
            total: data.totalAmount,
            date: new Date().toLocaleString('vi-VN')
        };
    }
    return { table: '', items: [], total: 0, date: '' };
  };
  // Hàm mở QR
  const handleOpenQR = (tableName) => {
    const tableData = activeTables[tableName];
    if (!tableData) return;
    const mockOrderForQR = {
        _id: 'temp_group_' + tableName, 
        table_name: tableName,
        total_amount: tableData.totalAmount,
        items: tableData.items,
        realOrderIds: tableData.orders.map(o => o._id) 
    };
    setQrOrderData(mockOrderForQR);
  };

  // Hàm xác nhận QR Paid
  const handleConfirmQRPaid = async () => {
    if (!qrOrderData) return;
    try {
        await Promise.all(
            qrOrderData.realOrderIds.map(id => orderApi.updateStatus(id, 'paid'))
        );
        toast.success(`✅ Bàn ${qrOrderData.table_name} đã thanh toán xong!`);
        setQrOrderData(null); 
        fetchOrders(); 
    } catch (error) {
        toast.error("Lỗi cập nhật trạng thái!"+ error.message);
    }
  };



  return (
    <div className="p-6 bg-base-200 min-h-screen font-sans">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">🧾</span> 
            {activeTab === 'active' ? 'Quản lý Thu Ngân' : 'Lịch sử Giao dịch'}
        </h1>

        {/* BUTTONS CHUYỂN TAB */}
        <div className="join shadow-sm border border-gray-200 bg-white rounded-lg p-1">
            <button 
                className={`join-item btn btn-sm px-6 border-none ${activeTab === 'active' ? 'btn-primary text-white' : 'btn-ghost'}`}
                onClick={() => setActiveTab('active')}
            >
                Hoạt động ({activeTableNames.length})
            </button>
            <button 
                className={`join-item btn btn-sm px-6 border-none ${activeTab === 'history' ? 'btn-primary text-white' : 'btn-ghost'}`}
                onClick={() => setActiveTab('history')}
            >
                Lịch sử ({historyOrders.length})
            </button>
        </div>
      </div>

      {/* --- TAB 1: BÀN ĐANG HOẠT ĐỘNG --- */}
      {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {activeTableNames.length > 0 ? (
                activeTableNames.map(tableName => {
                    const table = activeTables[tableName];
                    return (
                        <div key={tableName} className="card bg-white shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                            <div className="card-body p-0">
                                <div className="p-4 bg-gray-50 rounded-t-2xl flex justify-between items-center border-b border-gray-100">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Bàn {tableName}</h2>
                                        <span className="text-xs text-gray-500">{table.orders.length} lượt gọi</span>
                                    </div>
                                    <button 
                                        className="btn btn-sm btn-ghost btn-circle text-gray-500 hover:text-primary tooltip tooltip-left"
                                        data-tip="In Hóa Đơn"
                                        onClick={() => handlePrintBill(tableName)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-4 max-h-48 overflow-y-auto custom-scrollbar">
                                    <ul className="space-y-3">
                                        {table.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-start text-sm">
                                                <span className="font-medium text-gray-700 w-2/3">
                                                    <span className="inline-block w-6 h-6 bg-gray-100 text-center rounded-full text-xs leading-6 mr-2 font-bold">{item.quantity}</span>
                                                    {item.name}
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 pt-0 mt-auto">
                                    <div className="border-t border-dashed border-gray-200 my-3"></div>
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-gray-500 text-sm font-medium">Tổng thanh toán</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {table.totalAmount.toLocaleString()} <span className="text-sm align-top">đ</span>
                                        </span>
                                    </div>
                                    <button 
                                        className="btn btn-primary w-full text-white shadow-lg hover:shadow-primary/50 flex items-center gap-2 text-lg"
                                        onClick={() => handleOpenQR(tableName)}
                                    >
                                        <span>💰</span> Thanh Toán / QR
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-96 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300">
                    <p className="text-xl font-medium text-gray-500">Tất cả bàn đều trống</p>
                </div>
            )}
          </div>
      )}

      {/* --- TAB 2: LỊCH SỬ GIAO DỊCH --- */}
      {activeTab === 'history' && (
          <div className="animate-fade-in">
              {/* Header Thống kê & Nút Excel */}
              <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                  
                  {/* Thống kê nhanh */}
                  <div className="flex gap-4 w-full md:w-auto">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[150px]">
                          <p className="text-sm text-gray-500">Tổng đơn đã thu</p>
                          <p className="text-2xl font-bold text-gray-800">{historyOrders.length} đơn</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[200px]">
                          <p className="text-sm text-gray-500">Doanh thu ghi nhận</p>
                          <p className="text-2xl font-bold text-green-600">{totalRevenueHistory.toLocaleString()} đ</p>
                      </div>
                  </div>

                  {/* 👇 NÚT XUẤT EXCEL */}
                  <button 
                    onClick={handleExportExcel}
                    className="btn btn-success text-white shadow-md gap-2"
                    disabled={historyOrders.length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-9-15v11.85m0 0 3.75-3.75m-3.75 3.75L6.375 12.375" />
                    </svg>
                    Xuất Báo Cáo (.xlsx)
                  </button>
              </div>

              {/* Bảng danh sách */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <table className="table w-full">
                      <thead className="bg-gray-50">
                          <tr>
                              <th>Thời gian</th>
                              <th>Bàn</th>
                              <th>Món ăn</th>
                              <th className="text-right">Tổng tiền</th>
                              <th className="text-center">Trạng thái</th>
                          </tr>
                      </thead>
                      <tbody>
                          {historyOrders.length > 0 ? (
                              historyOrders.map((order) => (
                                  <tr key={order._id} className="hover:bg-gray-50">
                                      <td className="text-gray-500 text-sm">
                                          {new Date(order.updatedAt).toLocaleString('vi-VN')}
                                      </td>
                                      <td className="font-bold text-primary">{order.displayTable}</td>
                                      <td>
                                          <div className="flex flex-col gap-1">
                                              {order.items.map((item, idx) => (
                                                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded w-fit">
                                                      {item.quantity}x {item.name}
                                                  </span>
                                              ))}
                                          </div>
                                      </td>
                                      <td className="text-right font-bold text-gray-800">
                                          {order.total_amount.toLocaleString()} đ
                                      </td>
                                      <td className="text-center">
                                          <div className="badge badge-success text-white badge-sm">Đã thanh toán</div>
                                      </td>
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                  <td colSpan="5" className="text-center py-10 text-gray-400">
                                      Chưa có giao dịch nào
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- MODAL & INVOICE --- */}
      {qrOrderData && (
        <PaymentQRModal 
            order={qrOrderData}
            onClose={() => setQrOrderData(null)}
            onConfirmPaid={handleConfirmQRPaid}
        />
      )}

      <div style={{ overflow: 'hidden', height: 0, width: 0 }}>
        <Invoice 
            ref={componentRef} 
            {...getInvoiceData()} 
        />
      </div>
    </div>
  );
};

export default BillPage;