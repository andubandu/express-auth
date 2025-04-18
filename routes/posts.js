import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js'; // Import User model
import { authenticateToken } from '../middleware/auth.js';
import { upload, handleFileUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', '-password');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(posts, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      '-password'
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(post, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching post' });
  }
});

router.post('/new', authenticateToken, async (req, res) => {
  try {
    const { title, content, media } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Create a new post
    const post = new Post({
      title,
      content,
      media,
      author: req.user.id, // Dynamically set the author field
    });

    await post.save();

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

router.delete('/del/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id,
    });
    if (!post)
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post' });
  }
});

router.put(
  '/upd/:id',
  authenticateToken,
  upload.single('media'),
  handleFileUpload,
  async (req, res) => {
    try {
      const updates = { ...req.body };
      if (req.fileUrl) {
        updates.media = {
          url: req.fileUrl,
          type: req.fileType,
        };
      }
      updates.updatedAt = new Date();

      const post = await Post.findOneAndUpdate(
        { _id: req.params.id, author: req.user.id },
        updates,
        { new: true }
      ).populate('author', '-password');

      if (!post)
        return res
          .status(404)
          .json({ error: 'Post not found or unauthorized' });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Error updating post' });
    }
  }
);

export default router;