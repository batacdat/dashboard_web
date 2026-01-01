// src/api/socket.js
import { io } from "socket.io-client";

// 👇 Tự động lấy link server thật khi deploy
// Lưu ý: Socket kết nối vào gốc domain, không có đuôi /api
const URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; 

const socket = io(URL, {
    transports: ['websocket'], // Sử dụng websocket cho nhanh
    autoConnect: true
});

export default socket;