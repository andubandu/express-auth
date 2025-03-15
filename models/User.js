import mongoose from 'mongoose';
import Post from './Post.js'; 

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('findOneAndDelete', async function (next) {
  const userId = this.getQuery()._id;
  await Post.deleteMany({ author: userId }); 
  next();
});

export default mongoose.model('User', userSchema);
