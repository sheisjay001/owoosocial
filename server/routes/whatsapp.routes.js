const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(protect);

// Contacts
router.get('/contacts', whatsappController.getContacts);
router.post('/contacts', whatsappController.addContact);
router.post('/contacts/import', upload.single('file'), whatsappController.importContacts);
router.delete('/contacts/:id', whatsappController.deleteContact);

// Broadcasts
router.get('/broadcasts', whatsappController.getBroadcasts);
router.post('/broadcasts', whatsappController.createBroadcast);
router.get('/broadcasts/:id', whatsappController.getBroadcastStats);

module.exports = router;
