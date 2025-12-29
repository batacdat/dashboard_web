import React, { useEffect, useState } from 'react';
import menuApi from '../api/menuApi';

const MenuPage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 1. State quản lý Tab đang chọn (Mặc định là Đồ ăn)
  const [activeTab, setActiveTab] = useState('Đồ ăn');
  const categories = ['Đồ ăn', 'Đồ uống', 'Khác'];

  // State Form
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Đồ ăn', image: '', description: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuApi.getAll();
      setFoods(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi load menu:", error);
    }
  };

  // 👇 Hàm lọc danh sách món theo Tab đang chọn
  const filteredFoods = foods.filter(food => food.category === activeTab);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openEditModal = (food) => {
    setEditingId(food._id);
    setFormData({
        name: food.name,
        price: food.price,
        category: food.category || 'Đồ ăn', // Fallback nếu chưa có category
        image: food.image,
        description: food.description
    });
    document.getElementById('my_modal_1').showModal();
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Đồ ăn', image: '', description: '' });
    document.getElementById('my_modal_1').showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (editingId) {
            await menuApi.update(editingId, formData);
        } else {
            await menuApi.create(formData);
        }
        document.getElementById('my_modal_1').close();
        fetchMenu();
    } catch (error) {
        alert("Lỗi lưu món ăn");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa món này?")) {
        await menuApi.delete(id);
        fetchMenu();
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* HEADER + BUTTON THÊM */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🍔 Quản lý Thực đơn</h1>
        <button className="btn btn-primary" onClick={openAddModal}>+ Thêm món mới</button>
      </div>

      {/* 👇 2. GIAO DIỆN TABS (Đồ ăn | Đồ uống | Khác) */}
      <div className="tabs tabs-boxed bg-white p-2 mb-6 shadow-sm">
        {categories.map((cat) => (
            <a 
                key={cat}
                className={`tab tab-lg flex-1 ${activeTab === cat ? 'tab-active bg-primary text-white' : ''}`}
                onClick={() => setActiveTab(cat)}
            >
                {cat === 'Đồ ăn' && '🍔 '}
                {cat === 'Đồ uống' && '🥤 '}
                {cat === 'Khác' && '🍟 '}
                {cat}
            </a>
        ))}
      </div>

      {/* GRID HIỂN THỊ MÓN ĂN (Đã lọc) */}
      {loading ? <div className="text-center">Đang tải...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFoods.length === 0 ? (
            <div className="col-span-4 text-center text-gray-400 py-10">
                Chưa có món nào trong mục này.
            </div>
          ) : (
             filteredFoods.map((food) => (
                <div key={food._id} className="card bg-base-100 shadow-xl group">
                    <figure className="relative h-48 overflow-hidden">
                        <img 
                            src={food.image || "https://via.placeholder.com/150"} 
                            alt={food.name} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {e.target.src = "https://cdn-icons-png.flaticon.com/512/1377/1377194.png"}}
                        />
                        <button 
                            onClick={() => handleDelete(food._id)}
                            className="btn btn-error btn-sm btn-circle absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >🗑️</button>
                    </figure>
                    <div className="card-body p-4">
                        <div className="flex justify-between items-start">
                            <h2 className="card-title text-base">{food.name}</h2>
                            <div className="badge badge-ghost text-xs">{food.category}</div>
                        </div>
                        <div className="card-actions justify-between items-center mt-4">
                            <div className="font-bold text-primary">{Number(food.price).toLocaleString()} đ</div>
                            <button onClick={() => openEditModal(food)} className="btn btn-sm btn-circle btn-ghost text-blue-500 bg-blue-50">✏️</button>
                        </div>
                    </div>
                </div>
             ))
          )}
        </div>
      )}

      {/* MODAL FORM */}
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">{editingId ? "Sửa món ăn" : "Thêm món mới"}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input name="name" placeholder="Tên món" className="input input-bordered" value={formData.name} onChange={handleChange} required />
            
            {/* 👇 3. SELECT BOX ĐỂ CHỌN DANH MỤC */}
            <select 
                name="category" 
                className="select select-bordered w-full" 
                value={formData.category} 
                onChange={handleChange}
            >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <input name="price" type="number" placeholder="Giá tiền" className="input input-bordered" value={formData.price} onChange={handleChange} required />
            <input name="image" placeholder="Link ảnh (URL)" className="input input-bordered" value={formData.image} onChange={handleChange} />
            <textarea name="description" placeholder="Mô tả (tùy chọn)" className="textarea textarea-bordered" value={formData.description} onChange={handleChange} />
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => document.getElementById('my_modal_1').close()}>Hủy</button>
              <button type="submit" className="btn btn-primary">Lưu lại</button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default MenuPage;