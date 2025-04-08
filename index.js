import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import likeRoutes from './routes/like.js';
import commentRoutes from './routes/comment.js'; // Ensure this is imported correctly

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json()); // Ensure this is added before routes

// Database connection
connectDB();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes); // Ensure this is added

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
