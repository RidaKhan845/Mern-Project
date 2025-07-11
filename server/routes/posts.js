const express = require('express');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username fullName avatarUrl')
      .populate('comments.author', 'username fullName avatarUrl')
      .sort({ createdAt: -1 });

    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user._id)
    }));

    res.json(postsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username fullName avatarUrl')
      .populate('comments.author', 'username fullName avatarUrl')
      .sort({ createdAt: -1 });

    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user._id)
    }));

    res.json(postsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    const post = new Post({
      content,
      imageUrl: imageUrl || '',
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'username fullName avatarUrl');

    res.status(201).json({
      ...post.toObject(),
      isLiked: false
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      post.likesCount -= 1;
    } else {
      post.likes.push(req.user._id);
      post.likesCount += 1;
      
      // Create notification if user is not liking their own post
      if (post.author.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });
        await notification.save();
      }
    }

    await post.save();

    res.json({ 
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likesCount: post.likesCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:postId/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content,
      author: req.user._id,
      createdAt: new Date()
    };

    post.comments.push(comment);
    post.commentsCount += 1;
    await post.save();

    await post.populate('comments.author', 'username fullName avatarUrl');

    const newComment = post.comments[post.comments.length - 1];

    // Create notification if user is not commenting on their own post
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id
      });
      await notification.save();
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;