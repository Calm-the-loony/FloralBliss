const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/featured', productController.getFeaturedProducts);
router.get('/bouquets', productController.getBouquets);
router.get('/plants', productController.getPlants);  // Этот маршрут
router.get('/compositions', productController.getCompositions);
router.get('/all', productController.getAllProducts);
router.post('/save', productController.createOrUpdateProduct);

module.exports = router;