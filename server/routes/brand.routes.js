const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const { protectOptional } = require('../middleware/auth');

router.post('/', protectOptional, brandController.createBrand);
router.get('/', protectOptional, brandController.getBrands);
router.get('/:id', protectOptional, brandController.getBrandById);
router.put('/:id', protectOptional, brandController.updateBrand);
router.delete('/:id', protectOptional, brandController.deleteBrand);

module.exports = router;
