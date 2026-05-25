const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const uploadMiddleware = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/image', protect, uploadMiddleware.single('image'), uploadController.uploadImage);
router.delete('/image', protect, requireRole('admin'), uploadController.deleteImage);

module.exports = router;
