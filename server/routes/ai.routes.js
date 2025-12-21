const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/generate', aiController.generateContent);

module.exports = router;
