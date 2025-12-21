const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateReport, getReports } = require('../controllers/report.controller');

router.post('/generate', protect, generateReport);
router.get('/', protect, getReports);

module.exports = router;
