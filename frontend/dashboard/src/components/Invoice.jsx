import React from 'react';

// Dùng forwardRef để component cha (BillPage) có thể điều khiển việc in
export const Invoice = React.forwardRef((props, ref) => {
    const { table, items, total, date } = props;

    return (
        // Wrapper này dùng để định dạng khổ giấy in (thường là 80mm)
        <div ref={ref} className="p-4 bg-white text-black font-mono text-sm leading-6" style={{ width: '80mm', minHeight: '100mm' }}>
            
            {/* Header: Thông tin quán */}
            <div className="text-center border-b-2 border-dashed border-black pb-2 mb-2">
                <h1 className="text-xl font-bold uppercase">Nhà Hàng Của Bạn</h1>
                <p>📍 123 Đường ABC, Hà Nội</p>
                <p>📞 0987.654.321</p>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="mb-2 text-xs">
                <p>📅 Ngày: {date}</p>
                <p>🍽️ Bàn: <span className="font-bold text-lg">{table}</span></p>
                <p>🧾 Mã đơn: #{Math.floor(Math.random() * 100000)}</p>
            </div>

            {/* Bảng chi tiết món ăn */}
            <table className="w-full border-b-2 border-dashed border-black mb-2">
                <thead>
                    <tr className="text-left font-bold text-xs">
                        <th className="w-1/2">Món</th>
                        <th className="w-1/4 text-center">SL</th>
                        <th className="w-1/4 text-right">TT</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="py-1">
                                <div>{item.name}</div>
                                <div className="text-[10px] italic text-gray-500">
                                    {item.price.toLocaleString()}
                                </div>
                            </td>
                            <td className="text-center align-top">{item.quantity}</td>
                            <td className="text-right align-top font-bold">
                                {(item.price * item.quantity).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Tổng tiền */}
            <div className="flex justify-between items-center text-lg font-bold mt-2">
                <span>TỔNG CỘNG:</span>
                <span>{total.toLocaleString()} đ</span>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-xs italic">
                <p>Cảm ơn quý khách & Hẹn gặp lại!</p>
                <p>Pass Wifi: 12345678</p>
            </div>
        </div>
    );
});