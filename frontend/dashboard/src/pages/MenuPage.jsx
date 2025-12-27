import React, { useEffect, useState } from 'react';
import menuApi from '../api/menuApi';

const MenuPage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Form
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Đồ ăn', image: '', description: ''
  });

  // State để biết đang ở chế độ "Thêm mới" hay "Sửa"
  // Nếu editingId = null -> Đang thêm mới
  // Nếu editingId = "123..." -> Đang sửa món có id là 123
  const [editingId, setEditingId] = useState(null);

  // 1. Load dữ liệu ban đầu
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

  // 2. Xử lý nhập liệu
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Mở Modal để THÊM MỚI (Reset form về rỗng)
  const openAddModal = () => {
    setEditingId(null); // Chế độ thêm
    setFormData({ name: '', price: '', category: 'Đồ ăn', image: '', description: '' });
    document.getElementById('modal_food').showModal();
  };

  // 4. Mở Modal để SỬA (Đổ dữ liệu món cũ vào form)
  const openEditModal = (food) => {
    setEditingId(food._id); // Chế độ sửa
    setFormData({
      name: food.name,
      price: food.price,
      category: food.category,
      image: food.image,
      description: food.description
    });
    document.getElementById('modal_food').showModal();
  };

  // 5. Xử lý LƯU (Tự động phân biệt Thêm hay Sửa)
  const handleSubmit = async () => {
    if(!formData.name || !formData.price) return alert("Thiếu tên hoặc giá!");

    try {
      setLoading(true);
      if (editingId) {
        // --- LOGIC SỬA ---
        await menuApi.update(editingId, formData);
        alert("Đã cập nhật món ăn!");
      } else {
        // --- LOGIC THÊM MỚI ---
        await menuApi.create(formData);
        alert("Đã thêm món mới!");
      }

      // Xong xuôi thì load lại danh sách và đóng modal
      await fetchMenu();
      document.getElementById('modal_food').close();
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Xử lý XÓA
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa món này không? 😱")) {
      try {
        await menuApi.delete(id);
        setFoods(foods.filter(item => item._id !== id)); // Xóa nóng trên giao diện cho nhanh
         alert("Đã xóa thành công!");
      } catch (error) {
        alert("Xóa thất bại!" + error.message) ;
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🍔 Quản lý Thực đơn ({foods.length})</h2>
        <button className="btn btn-primary" onClick={openAddModal}>+ Thêm món mới</button>
      </div>

      {/* MODAL DÙNG CHUNG CHO CẢ THÊM VÀ SỬA */}
      <dialog id="modal_food" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {editingId ? "✏️ Chỉnh sửa món ăn" : "✨ Thêm món mới"}
          </h3>
          
          <div className="flex flex-col gap-3">
            <input type="text" name="name" placeholder="Tên món" className="input input-bordered w-full" 
                value={formData.name} onChange={handleChange} />
            
            <input type="number" name="price" placeholder="Giá" className="input input-bordered w-full" 
                value={formData.price} onChange={handleChange} />

            <select name="category" className="select select-bordered w-full" 
                value={formData.category} onChange={handleChange}>
                <option value="Đồ ăn">Đồ ăn</option>
                <option value="Đồ uống">Đồ uống</option>
            </select>

            <input type="text" name="image" placeholder="Link ảnh URL" className="input input-bordered w-full" 
                value={formData.image} onChange={handleChange} />

            <textarea name="description" className="textarea textarea-bordered" placeholder="Mô tả"
                value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Hủy</button>
            </form>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingId ? "Lưu thay đổi" : "Tạo món mới"}
            </button>
          </div>
        </div>
      </dialog>

      {/* DANH SÁCH MÓN ĂN */}
      {loading && <div className="text-center mt-10"><span className="loading loading-spinner text-primary"></span></div>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {!loading && foods.map((food) => (
          <div key={food._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all group">
            <figure className="h-48 overflow-hidden relative">
              <img 
                src={food.image || "https://cdn-icons-png.flaticon.com/512/1377/1377194.png"} 
                alt={food.name} 
                className="w-full h-full object-cover"
                onError={(e) => {e.target.src = "https://cdn-icons-png.flaticon.com/512/1377/1377194.png"}}
              />
              
              {/* Nút Xóa hiện lên khi hover vào ảnh (UI nâng cao 1 chút) */}
              <button 
                onClick={() => handleDelete(food._id)}
                className="btn btn-error btn-sm btn-circle absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xóa món này"
              >
                🗑️
              </button>
            </figure>

            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-base">{food.name}</h2>
                <div className="badge badge-ghost text-xs">{food.category}</div>
              </div>
              
              <div className="card-actions justify-between items-center mt-4">
                <div className="font-bold text-primary">
                    {Number(food.price).toLocaleString()} đ
                </div>
                {/* Nút Sửa */}
                <button 
                    onClick={() => openEditModal(food)}
                    className="btn btn-sm btn-circle btn-ghost text-blue-500 bg-blue-50 hover:bg-blue-100"
                >
                    ✏️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;