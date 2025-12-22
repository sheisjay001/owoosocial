const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauth.controller');

// GET /api/oauth/facebook/login
router.get('/:platform/login', oauthController.initAuth);

// GET /api/oauth/facebook/callback
router.get('/:platform/callback', oauthController.handleCallback);

module.exports = router;
