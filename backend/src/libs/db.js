import mongoose from 'mongoose';

 const connectDB = async () => {

try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log('Liên kết với database thành công!');
} catch (error) {
    console.error('Lỗi khi kết nối với database:', error);
    process.exit(1);
}

}
export default connectDB;