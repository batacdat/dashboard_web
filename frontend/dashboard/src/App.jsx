import React from 'react';
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import OrderPage from './pages/OrderPage';
function App() {
  return (
   <BrowserRouter>
    <Sidebar>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/order" element={<OrderPage />} />
      </Routes>
    </Sidebar>
   </BrowserRouter>
  )
};


export default App
