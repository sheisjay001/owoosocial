const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', leadController.createLead);
router.get('/', leadController.getLeads);
router.post('/:id/generate', leadController.generateFollowUp);
router.post('/:id/send', leadController.sendFollowUp);

module.exports = router;
