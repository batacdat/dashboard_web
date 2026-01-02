import React, { useEffect, useState } from 'react';
import menuApi from '../api/menuApi';
import { toast } from 'react-toastify'; // Nếu bạn có dùng toast báo lỗi
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const MenuPage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 1. THAY THẾ state activeTab BẰNG 2 state này:
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");


      //state quan ly modal xoa
      const [deleteModalOpen, setDeleteModalOpen] = useState(false);
      const [foodToDelete, setFoodToDelete] = useState(null);
  // Danh sách danh mục dùng cho Dropdown lọc
  const filterCategories = [
      { value: 'all', label: 'Tất cả' },
      { value: 'Đồ ăn', label: 'Đồ ăn' },
      { value: 'Đồ uống', label: 'Đồ uống' },
      { value: 'Khác', label: 'Khác' }
  ];

  // Danh sách danh mục dùng cho Form thêm/sửa (Không có 'all')
  const formCategories = ['Đồ ăn', 'Đồ uống', 'Khác'];

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

  // 👇 2. LOGIC LỌC MỚI (Kết hợp tìm kiếm + danh mục)
  const filteredFoods = foods.filter(food => {
      // Điều kiện 1: Khớp danh mục (nếu chọn 'all' thì luôn đúng)
      const matchCategory = selectedCategory === 'all' || food.category === selectedCategory;
      // Điều kiện 2: Khớp tên tìm kiếm
      const matchSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchCategory && matchSearch;
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openEditModal = (food) => {
    setEditingId(food._id);
    setFormData(food);
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
        toast.success("Cập nhật thành công!");
      } else {
        await menuApi.create(formData);
        toast.success("Thêm món thành công!");
      }
      document.getElementById('my_modal_1').close();
      fetchMenu();
    } catch (error) {
      console.error("Lỗi lưu:", error);
      toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteClick = async (food) => {
    setFoodToDelete(food);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!foodToDelete) return;
    try {
      await menuApi.delete(foodToDelete._id);
      toast.success("Xóa món thành công!");
      setDeleteModalOpen(false);
      setFoodToDelete(null);
      fetchMenu();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa: " + (error.response?.data?.message || error.message));
    }

  };

// Hàm chuyển đổi trạng thái món ăn
const handleToggleStatus = async (foodId) => {
    try {
      await menuApi.toggleStatus(foodId);
              // Cập nhật lại giao diện ngay lập tức mà không cần reload
              setFoods(foods.map(item => 
                  item._id === foodId ? { ...item, is_available: !item.is_available } : item
              ));
              toast.success("Đã cập nhật tình trạng món!");
    } catch (error) {
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <>
    <div className="p-4 bg-base-200 min-h-screen dark:bg-gray-900">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-purple-100 ">🍔 Quản lý Menu</h2>

      {/* 👇 3. GIAO DIỆN TÌM KIẾM & LỌC (Thay thế cho Tabs cũ) */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white dark:bg-gray-700 dark:border-gray-400  p-4 rounded-xl shadow-sm items-center">
        
        {/* Ô TÌM KIẾM */}
        <div className="form-control w-full md:w-1/3 ">
            <input 
                type="text" 
                placeholder="🔍 Tìm tên món ăn..." 
                className="input input-bordered w-full dark:bg-gray-600 dark:text-purple-100 dark:border-purple-100 "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* DROPDOWN CHỌN DANH MỤC */}
        <select 
            className="select select-bordered w-full md:w-1/4 dark:bg-gray-600 dark:text-purple-100 dark:border-purple-100 "
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
        >
            {filterCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
        </select>

        {/* NÚT THÊM MỚI (Đẩy sang phải) */}
        <div className="md:ml-auto w-full md:w-auto">
            <button className="btn btn-primary w-full md:w-auto " onClick={openAddModal}>
                + Thêm món mới
            </button>
        </div>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-xl dark:bg-gray-700 dark:text-purple-100 ">
        <table className="table w-full">
          {/* head */}
          <thead className="bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-purple-100 ">
            <tr>
              <th>Hình ảnh</th>
              <th>Tên món</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Tình trạng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                 <tr><td colSpan="5" className="text-center dark:text-purple-100 ">Đang tải...</td></tr>
            ) : filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                    <tr key={food._id} className="hover dark:hover:!bg-black/20">
                        <td>
                        <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                            <img src={food.image || "https://via.placeholder.com/50"} alt={food.name} />
                            </div>
                        </div>
                        </td>
                        <td className="font-bold text-xs md:text-sm dark:text-purple-100 ">{food.name}</td>
                        <td className="text-primary font-bold text-xs md:text-sm dark:text-purple-100 ">
                            {food.price?.toLocaleString()} đ
                        </td>
                        <td>
                            <span className={`text-xs md:text-sm badge   ${
                                food.category === 'Đồ ăn' ? 'badge-warning' : 
                                food.category === 'Đồ uống' ? 'badge-info' : 'badge-ghost'
                            }`}>
                                {food.category === 'Đồ ăn' ? 'Food' : 
                                 food.category === 'Đồ uống' ? 'Drink' : 'Other'}
                            </span>
                        </td>
                        {/* cột tình trạng */}
                        <td>
                            <label className="cursor-pointer label justify-start gap-2">
                                <span className="label-text text-xs md:text-sm dark:text-purple-100 ">{food.is_available ? "In stock" : "Out of stock"}</span> 
                                <input 
                                    type="checkbox" 
                                    className="toggle toggle-success toggle-sm" 
                                    checked={food.is_available} 
                                    onChange={() => handleToggleStatus(food._id)} // Hàm xử lý bên dưới
                                />
                            </label>
                        </td>


                        <td className="flex justify-center gap-2 pt-4">
                            {/* Nút Sửa */}
                            <button 
                                onClick={() => openEditModal(food)} 
                                className="btn btn-sm btn-ghost text-blue-500 hover:bg-blue-100 tooltip" 
                                data-tip="Sửa"
                            >
                                <FaEdit size={18} />
                            </button>

                            {/* Nút Xóa */}
                            <button 
                                onClick={() => handleDeleteClick(food)} 
                                className="btn btn-sm btn-ghost text-error hover:bg-red-100 tooltip" 
                                data-tip="Xóa"
                            >
                                <FaTrashAlt size={18} />
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                        Không tìm thấy món nào 🤔
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM/SỬA (Giữ nguyên logic của bạn) */}
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">{editingId ? "Sửa món ăn" : "Thêm món mới"}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            
            <div className="form-control">
                <label className="label-text mb-1">Tên món</label>
                <input name="name" placeholder="Ví dụ: Cơm rang" className="input input-bordered" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-control">
                <label className="label-text mb-1">Danh mục</label>
                <select 
                    name="category" 
                    className="select select-bordered w-full" 
                    value={formData.category} 
                    onChange={handleChange}
                >
                    {/* Dùng formCategories để không hiện 'Tất cả' trong lúc thêm mới */}
                    {formCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="form-control">
                <label className="label-text mb-1">Giá tiền</label>
                <input name="price" type="number" placeholder="0" className="input input-bordered" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="form-control">
                <label className="label-text mb-1">Hình ảnh (URL)</label>
                <input name="image" placeholder="https://..." className="input input-bordered" value={formData.image} onChange={handleChange} />
            </div>
            
            <div className="form-control">
                <label className="label-text mb-1">Mô tả</label>
                <textarea name="description" placeholder="Mô tả món ăn..." className="textarea textarea-bordered" value={formData.description} onChange={handleChange} />
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={() => document.getElementById('my_modal_1').close()}>Hủy</button>
              <button type="submit" className="btn btn-primary">Lưu lại</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
            <button>close</button>
        </form>
      </dialog>
      {/* MODAL XÁC NHẬN XÓA */}
                        {deleteModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-2xl text-red-500">⚠️ Xác nhận xóa</h3>
                        <p className="py-4 text-lg">
                            Bạn có chắc chắn muốn xóa món <span className="font-bold">{foodToDelete?.name}</span>  không?
                            <br/>
                            <span className="text-sm text-gray-500 italic">Hành động này không thể hoàn tác.</span>
                        </p>
                        <div className="modal-action">
                            <button 
                                className="btn btn-ghost" 
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                className="btn btn-error text-white" 
                                onClick={confirmDelete}
                            >
                                🗑️ Xóa ngay
                            </button>
                        </div>
                    </div>
                    {/* Click ra ngoài để đóng */}
                    <div className="modal-backdrop" onClick={() => setDeleteModalOpen(false)}></div>
                </div>
            )}
    </div>
  </>
  );
};

export default MenuPage;