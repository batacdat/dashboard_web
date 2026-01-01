import React from 'react';

const PaymentQRModal = ({ order, onClose, onConfirmPaid }) => {
    if (!order) return null;

    // --- CẤU HÌNH TÀI KHOẢN NGÂN HÀNG CỦA BẠN TẠI ĐÂY ---
    const BANK_ID = 'MB';       // Ví dụ: MB, VCB, ACB, TPB, VPB...
    const ACCOUNT_NO = '50570222'; // Số tài khoản của bạn
    const TEMPLATE = 'compact'; // Giao diện QR: 'compact', 'qr_only', 'print'
    const ACCOUNT_NAME = 'NGUYEN VAN MUI'; // Tên chủ tài khoản (để hiển thị cho đẹp)
    // -----------------------------------------------------

    // Tạo nội dung chuyển khoản: "BAN 1 THANH TOAN"
    // Lưu ý: Nội dung nên viết không dấu, ngắn gọn để tránh lỗi
    const addInfo = `BAN ${order.table_name} THANH TOAN`;
    
    // Tạo link VietQR
    // Cấu trúc: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${order.total_amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="bg-primary p-4 text-white text-center relative">
                    <h3 className="text-lg font-bold">Thanh toán QR</h3>
                    <p className="text-sm opacity-90">Bàn: {order.table_name}</p>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Body: Chứa ảnh QR */}
                <div className="p-6 flex flex-col items-center">
                    <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg mb-4">
                        {/* Ảnh QR được load trực tiếp từ VietQR */}
                        <img 
                            src={qrUrl} 
                            alt="Mã QR Thanh Toán" 
                            className="w-full h-auto object-contain"
                        />
                    </div>
                    
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-sm">Tổng tiền cần thanh toán</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(order.total_amount)}</p>
                    </div>

                    <div className="w-full space-y-3">
                        {/* Nút Xác nhận (Sau khi nhân viên thấy tiền về) */}
                        <button 
                            onClick={() => onConfirmPaid(order._id)}
                            className="btn btn-primary w-full shadow-lg hover:shadow-xl transition-all"
                        >
                            ✅ Khách đã chuyển tiền
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="btn btn-ghost w-full text-gray-500"
                        >
                            Đóng / Thanh toán tiền mặt
                        </button>
                    </div>
                </div>
                
                {/* Footer note */}
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-400">
                    Hệ thống tự động tạo mã QR theo đơn hàng
                </div>
            </div>
        </div>
    );
};

export default PaymentQRModal;