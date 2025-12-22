const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domain.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', domainController.addDomain);
router.get('/', domainController.getDomains);
router.post('/:id/verify', domainController.checkVerification);
router.delete('/:id', domainController.deleteDomain);

module.exports = router;