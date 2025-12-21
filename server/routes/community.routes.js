const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getConversations, 
    getConversationById, 
    replyToConversation,
    generateAIReply
} = require('../controllers/community.controller');

router.get('/', protect, getConversations);
router.get('/:id', protect, getConversationById);
router.post('/:id/reply', protect, replyToConversation);
router.post('/:id/ai-reply', protect, generateAIReply);

module.exports = router;
