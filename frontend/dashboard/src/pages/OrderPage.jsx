import React, { useState, useEffect } from 'react';
import menuApi from '../api/menuApi.js';
import orderApi from '../api/orderApi.js';



const OrderPage = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [tableName, setTableName] = useState('Bàn 1');


// 1. Lấy thực đơn từ API
useEffect(() => {
    const fetchMenu = async () => {
        const res = await menuApi.getAll();
       setMenu(res.data);
    };
    fetchMenu();
}, []);
    //2. Thêm món vào giỏ hàng
    const addToCart = (food) => {
        const existingItem = cart.find(item => item._id === food._id);
        if (existingItem) {
            // Nếu món đã có trong giỏ, tăng số lượng
            setCart(cart.map(item => 
                item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            // Nếu món chưa có trong giỏ, thêm mới với số lượng 1
            setCart([...cart, { ...food, quantity: 1 }]);
        }
    };
//3.Xoa món khỏi giỏ hàng
const removeFromCart = (foodId) => {
    setCart(cart.filter(item => item._id !== foodId));
};
// 4. tinh tổng tiền
const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
// 5. Gửi đơn hàng (Submit)
const handleSubmitOrder = async () => {
    if (cart.length === 0) {
        return alert("Giỏ hàng trống!");
    }
    const orderData = {
        table_name:tableName,
        items: cart.map(item => ({
            menu_item_id: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total_amount: totalAmount
    };
    try {
        await orderApi.create(orderData);
        alert("✅ Đã gửi đơn xuống bếp thành công!");
        setCart([]); // Xóa giỏ hàng sau khi đặt hàng
    } catch (error) {
        alert("Lỗi khi gửi đơn: " + error.message);
    }
};
    return (
    <div className="flex h-screen bg-base-200 gap-4 p-4 overflow-hidden">
      
      {/* CỘT TRÁI: DANH SÁCH MÓN (70%) */}
      <div className="w-2/3 flex flex-col overflow-y-auto pr-2">
        <h2 className="text-2xl font-bold mb-4">🍔 Chọn món ăn</h2>
        <div className="grid grid-cols-3 gap-4 pb-20">
          {menu.map((food) => (
            <div 
              key={food._id} 
              className="card bg-base-100 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              onClick={() => addToCart(food)}
            >
              <figure className="h-32">
                <img src={food.image} alt={food.name} className="w-full h-full object-cover"/>
              </figure>
              <div className="card-body p-3 text-center">
                <h3 className="font-bold">{food.name}</h3>
                <p className="text-primary font-bold">{food.price.toLocaleString()}đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG (30%) */}
      <div className="w-1/3 bg-base-100 rounded-xl shadow-xl flex flex-col h-full">
        <div className="p-4 border-b">
            <h2 className="text-xl font-bold">🧾 Đơn gọi món</h2>
            <div className="mt-2">
                <label className="label-text font-bold">Chọn bàn:</label>
                <select 
                    className="select select-bordered select-sm w-full mt-1"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>Bàn số {num}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* LIST CÁC MÓN ĐÃ CHỌN */}
        <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">Chưa có món nào</div>
            ) : (
                cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center mb-4 border-b pb-2">
                        <div>
                            <div className="font-bold">{item.name}</div>
                            <div className="text-sm text-gray-500">
                                {item.price.toLocaleString()} x {item.quantity}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="font-bold text-primary">
                                {(item.price * item.quantity).toLocaleString()}
                             </div>
                             <button onClick={() => removeFromCart(item._id)} className="btn btn-xs btn-circle btn-error">x</button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* FOOTER: TỔNG TIỀN & NÚT GỬI */}
        <div className="p-4 bg-base-200 rounded-b-xl">
            <div className="flex justify-between text-xl font-bold mb-4">
                <span>Tổng cộng:</span>
                <span className="text-primary">{totalAmount.toLocaleString()} đ</span>
            </div>
            <button 
                className="btn btn-primary w-full btn-lg"
                onClick={handleSubmitOrder}
            >
                👨‍🍳 Gửi xuống bếp
            </button>
        </div>
      </div>

    </div>
    );
};

export default OrderPage;