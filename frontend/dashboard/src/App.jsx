// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'


function App() {
  return (
    <div className="p-10 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-5">Quản lý Nhà hàng 🍜</h1>
      
      {/* Thử một cái Card món ăn */}
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
        <div className="card-body">
          <h2 className="card-title">Cơm chiên dương châu</h2>
          <p>Món ngon bán chạy nhất hôm nay!</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Đặt món ngay</button>
          </div>
        </div>
      </div>
      
    </div>
  )
}


export default App
