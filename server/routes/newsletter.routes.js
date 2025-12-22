const express = require('express');
const router = express.Router();
const { createNewsletter, getNewsletters, sendNewsletterNow } = require('../controllers/newsletter.controller');
const { protect } = require('../middleware/auth');

router.post('/', protect, createNewsletter);
router.get('/', protect, getNewsletters);
router.post('/:id/send', protect, sendNewsletterNow);

module.exports = router;
