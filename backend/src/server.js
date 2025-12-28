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





// 1. Cấu hình & Kết nối DB
dotenv.config();
connectDB();

// 2. Khởi tạo server
const app = express(); // <-- Sửa ở đây
const server = http.createServer(app);

// 3. Cấu hình socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT'], // Thêm PUT method
    credentials: true,
  },
});

// 4. Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
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

// 9. Kết nối socket.io
io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
});

// 10. Chạy server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});