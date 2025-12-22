const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriber.controller');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(protect);

router.get('/', subscriberController.getSubscribers);
router.post('/', subscriberController.addSubscriber);
router.post('/bulk', subscriberController.bulkAddSubscribers);
router.post('/upload-csv', upload.single('file'), subscriberController.importSubscribers);
router.delete('/:id', subscriberController.deleteSubscriber);

module.exports = router;
