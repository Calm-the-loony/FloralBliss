const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageProxyController');

router.get('/proxy', imageController.proxyImage);
router.get('/metadata', imageController.getImageMetadata);
router.get('/thumbnail', imageController.createThumbnail);
router.get('/check', imageController.checkImageAvailability);
router.post('/download', imageController.downloadImage);

module.exports = router;