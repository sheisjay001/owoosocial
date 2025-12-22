const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');

// Apply protection to all AI routes to access user API keys
router.use(protect);

router.post('/generate', aiController.generateContent);
router.post('/generate-captions', aiController.generateCaptionVariations);
router.post('/generate-hashtags', aiController.generateHashtags);
router.post('/generate-calendar', aiController.generateCalendar);
router.post('/rewrite-post', aiController.rewritePost);
router.post('/generate-carousel', aiController.generateCarouselIdeas);
router.post('/translate', aiController.translateCaption);
router.post('/image-to-caption', aiController.imageToCaption);

module.exports = router;
