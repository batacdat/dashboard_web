import expess from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './libs/db.js';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';


// 1. Cấu hình & Kết nối DB
dotenv.config();
connectDB();
//2. Khởi tạo server
const app = expess();

const server = http.createServer(app);

// 3.cau hinh soket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
//4. middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(expess.json());

app.use((req, res, next) =>{
  req.io = io;
  next();
});
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

//5. routes
app.get('/', (req, res) => {
  res.send('API Restaurant is running...');
});

//6. ket noi socket.io
io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

socket.on('disconnect', () => {
    console.log('User disconnected: ');
    });
});
//7. chay server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});