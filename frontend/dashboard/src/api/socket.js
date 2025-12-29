// src/api/socket.js
import { io } from "socket.io-client";

// Thay đổi URL này nếu backend của bạn chạy ở port khác (ví dụ 5000)
const URL = "http://localhost:3000"; 

const socket = io(URL, {
    transports: ['websocket'], // Sử dụng websocket cho nhanh
    autoConnect: true
});

export default socket;