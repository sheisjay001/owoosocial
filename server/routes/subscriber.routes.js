const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriber.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', subscriberController.getSubscribers);
router.post('/', subscriberController.addSubscriber);
router.post('/bulk', subscriberController.bulkAddSubscribers);
router.delete('/:id', subscriberController.deleteSubscriber);

module.exports = router;
