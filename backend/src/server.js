// server.js - SỬA CHÍNH TẢ
import express from 'express'; // <-- Sửa từ 'expess' thành 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './libs/db.js';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';




// 1. Cấu hình & Kết nối DB
dotenv.config();
connectDB();

// 2. Khởi tạo server
const app = express(); // <-- Sửa ở đây
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173', 
  'https://dashboard-web-eight.vercel.app',
  'https://dashboard-iuvxctx34-muinguyens-projects.vercel.app'];
// 3. Cấu hình socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Đảm bảo đúng port frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// 👇 QUAN TRỌNG: Thêm dòng này để lưu biến io vào app
app.set('io', io);

// 9. Kết nối socket.io
io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  //1.lắng nghe sự kiện "Có đơn mới" từ OrderPage
  socket.on('newOrder', (orderData) => {
    console.log("🔔 Có đơn mới từ bàn:", orderData.table_name);

    // 2. Phát loa thông báo cho TẤT CẢ mọi người (Bếp, Thu ngân...)
        io.emit('newOrder', orderData);
  });
  //3.lắng nghe sự kiện "Cập nhật trạng thái món ăn" từ KitchenPage
  socket.on('update_status', (data) => {
    io.emit('update_status', data); // Báo cho Thu ngân biết
  });

  socket.on('disconnect', () => {
    console.log('🔥 User disconnected ' + socket.id);
  });
});


// 4. Middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json()); // <-- Sửa ở đây

// Thêm socket.io vào request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 5. Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// 6. Test route
app.get('/', (req, res) => {
  res.json({ message: 'API Restaurant is running...' });
});

// 7. Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 8. Xử lý lỗi server
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});



// 10. Chạy server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});