import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
fullname: {
    type: String,
    required: true
},
username: {
    type: String,
    required: true,
    unique: true
},
password: {
    type: String,
    required: true
},
role: {
    type: String,
    enum: ['staff', 'admin', 'kitchen'],
    default: 'staff',

},
is_active: {
    type: Boolean,
    default: true
},
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) {
         next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
   
}
);
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
const User = mongoose.model('User', userSchema);
export default User;















