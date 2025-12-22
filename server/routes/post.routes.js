const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protectOptional } = require('../middleware/auth');

router.post('/', protectOptional, postController.createPost);
router.get('/', protectOptional, postController.getPosts);

module.exports = router;
