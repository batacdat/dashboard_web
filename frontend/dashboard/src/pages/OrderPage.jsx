import React, { useState, useEffect } from 'react';
import menuApi from '../api/menuApi.js';
import orderApi from '../api/orderApi.js';
import { toast } from 'react-toastify'; // Nhớ import toast nếu chưa có
import socket from '../api/socket.js';

const OrderPage = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    // 👇 1. State Tab cho OrderPage
    const [activeTab, setActiveTab] = useState('Đồ ăn');
    const categories = ['Đồ ăn', 'Đồ uống', 'Khác'];

    // Hardcode bàn 1 (Sau này làm chọn bàn sau)
    const [tableName, setTableName] = useState('1');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await menuApi.getAll();
                setMenu(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMenu();

        // Lắng nghe cập nhật menu từ server qua socket
        const handleMenuUpdate = (data) => {
            console.log("🔄 Cập nhật menu từ server:", data);

            setMenu((prevMenu) => {
                switch(data.type) {
                    case 'CREATE':
                        return [...prevMenu, data.item];
                    case 'UPDATE':
                        return prevMenu.map(item => 
                            item._id === data.item._id ? data.item : item
                        );
                    case 'DELETE':
                        return prevMenu.filter(item => item._id !== data.id);
                    default:
                        return prevMenu;
                }
            });
            toast.info("Menu đã được cập nhật! 🍽️");
        };
        //bat
        socket.on('MENU_UPDATE', handleMenuUpdate);

        // Cleanup khi component unmount
        return () => {
            socket.off('MENU_UPDATE', handleMenuUpdate);
        };





        
    }, []);

    // 👇 Lọc menu theo Tab
    const filteredMenu = menu.filter(item => item.category === activeTab);

    const addToCart = (food) => {
        const existingItem = cart.find(item => item._id === food._id);
        if (existingItem) {
            setCart(cart.map(item => 
                item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...food, quantity: 1 }]);
        }
        // Hiệu ứng rung nhẹ hoặc toast nhỏ để biết đã thêm (Tùy chọn)
    };

    const removeFromCart = (foodId) => {
        setCart(cart.filter(item => item._id !== foodId));
    };

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return toast.warning("Giỏ hàng đang trống! 🛒");
        
        try {
            const orderData = {
                table_name: tableName,
                items: cart.map(item => ({
                    menu_item_id: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total_amount: totalAmount,
            };
            // 👇 THÊM ĐOẠN NÀY: Gửi tín hiệu Socket
           await orderApi.create(orderData);
           socket.emit('newOrder', orderData); // Gửi sự kiện socket
            toast.success("Đã gửi đơn xuống bếp! 👨‍🍳");
            setCart([]); 
        } catch (error) {
            toast.error("Lỗi gửi đơn: " + error.message);
        }
    };

    // Tính tổng tiền
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
    <div className="flex flex-col lg:flex-row h-screen bg-base-200 dark:bg-gray-900 p-4 gap-4">
      
      {/* CỘT TRÁI: DANH SÁCH MÓN ĂN (65%) */}
      <div className="lg:w-[65%] flex flex-col gap-4">
        
        {/* 👇 2. THANH TABS CATEGORY */}
        <div className="tabs tabs-boxed bg-white dark:bg-gray-500 shadow-sm p-2 ">
            {categories.map((cat) => (
                <a 
                    key={cat}
                    className={`tab tab-lg flex-1 dark:hover:bg-gray-400 dark:text-gray-200  ${activeTab === cat ? 'tab-active bg-primary  text-white font-bold' : ''}`}
                    onClick={() => setActiveTab(cat)}
                >
                    {cat}
                </a>
            ))}
        </div>

        {/* GRID MÓN ĂN */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-20 custom-scrollbar">
            {filteredMenu.map((food) => (
                <div 
                    key={food._id} 
                    className="card bg-base-100 dark:bg-gray-500 shadow hover:shadow-lg  "
                    // onClick={() => addToCart(food)}
                >
                    {!food.is_available && (
                        <div className="absolute inset-0 bg-black/10 dark:bg-white/50 z-10 flex items-center justify-center">
                            <span className="bg-red-600 text-white  px-4 py-1 font-bold rounded rotate-[-15deg] shadow-lg border-2 border-white" disabled>
                                HẾT MÓN
                            </span>
                        </div>
                    )}
                    <figure className="h-32">
                        <img 
                            src={food.image || "https://cdn-icons-png.flaticon.com/512/1377/1377194.png"} 
                            alt={food.name} 
                            className="w-full h-full object-cover "
                        />
                    </figure>
                    <div className="card-body p-3">
                        <h2 className="card-title text-sm dark:text-gray-200">{food.name}</h2>
                        <p className="text-primary font-bold dark:text-gray-200">{food.price.toLocaleString()} đ</p>
                        <div className='card-action justify-end'>
                            <button className="btn btn-sm btn-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                            disabled={!food.is_available}
                            onClick={() => addToCart(food)}
                            >
                            {food.is_available ? "+" : "Hết"}

                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG (30%) */}
      <div className="w-full md:w-1/3 bg-base-100 dark:bg-gray-500 rounded-xl shadow-xl flex flex-col h-full">
        <div className="p-4 border-b">
            <h2 className="text-sm lg:text-xl font-bold dark:text-purple-100 ">🧾 Đơn gọi món</h2>
            <div className="mt-2">
                <label className="label-text font-bold dark:text-purple-100 ">Chọn bàn:</label>
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
                <div className="text-center text-gray-400 mt-10 dark:text-purple-100 ">Chưa có món nào</div>
            ) : (
                cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center mb-4 border-b pb-2">
                        <div>
                            <div className="font-bold dark:text-purple-100 ">{item.name}</div>
                            <div className="text-sm text-gray-500 dark:text-purple-100 ">
                                {item.price.toLocaleString()} x {item.quantity}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="font-bold text-primary md:text-[12px] dark:text-purple-100 ">
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
                <span className='text-sm lg:text-lg'>Tổng cộng:</span>
                <span className="text-primary text-sm lg:text-lg">{totalAmount.toLocaleString()} đ</span>
            </div>
            <button 
                className=" text-sm btn btn-primary w-full btn-lg lg:text-lg "
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