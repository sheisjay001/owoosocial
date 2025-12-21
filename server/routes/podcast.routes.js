const express = require('express');
const router = express.Router();
const { createPodcast, getPodcasts, generateScript, getPodcastAnalytics } = require('../controllers/podcast.controller');

router.post('/', createPodcast);
router.get('/', getPodcasts);
router.post('/:id/script', generateScript);
router.get('/:id/analytics', getPodcastAnalytics);

module.exports = router;
