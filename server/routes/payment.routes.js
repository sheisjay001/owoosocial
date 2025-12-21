const express = require('express');
const router = express.Router();
const { getSubscription, createCheckoutSession, upgradeSubscription } = require('../controllers/payment.controller');

router.get('/subscription', getSubscription);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/upgrade', upgradeSubscription);

module.exports = router;
