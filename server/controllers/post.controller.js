const Post = require('../models/Post');

let mockPosts = []; // In-memory fallback if DB fails

// @desc    Create a new post
// @route   POST /api/posts
// @access  Public (for now)
exports.createPost = async (req, res) => {
  try {
    const { topic, platform, content, hashtags, imagePrompt, scheduledTime, status, targetAudience } = req.body;

    let post;
    try {
      post = await Post.create({
        topic,
        platform,
        content,
        hashtags,
        imagePrompt,
        scheduledTime,
        status: status || 'draft',
        targetAudience,
      });
    } catch (dbError) {
      console.log('DB Error, using in-memory store:', dbError.message);
      post = {
        _id: Date.now().toString(),
        topic,
        platform,
        content,
        hashtags,
        imagePrompt,
        scheduledTime,
        status: status || 'draft',
        targetAudience,
        createdAt: new Date()
      };
      mockPosts.push(post);
    }

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    let posts;
    try {
      posts = await Post.find().sort({ scheduledTime: 1, createdAt: -1 });
    } catch (dbError) {
      console.log('DB Error, using in-memory store:', dbError.message);
      posts = mockPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
