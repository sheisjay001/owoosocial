const express = require('express');
const router = express.Router();
const { createNewsletter, getNewsletters, sendNewsletterNow } = require('../controllers/newsletter.controller');

router.post('/', createNewsletter);
router.get('/', getNewsletters);
router.post('/:id/send', sendNewsletterNow);

module.exports = router;
