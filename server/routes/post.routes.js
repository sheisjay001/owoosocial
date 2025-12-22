const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');

router.post('/', protect, postController.createPost);
router.get('/', protect, postController.getPosts);

module.exports = router;
