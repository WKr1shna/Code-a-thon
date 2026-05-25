const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth');

router.get('/analytics', protect, authorize('SUPER_ADMIN', 'ADMIN', 'COORDINATOR'), adminController.getAnalytics);
router.get('/fake-queue', protect, authorize('SUPER_ADMIN', 'ADMIN'), adminController.getFakeQueue);
router.get('/personnel', protect, authorize('SUPER_ADMIN', 'ADMIN', 'COORDINATOR'), adminController.getPersonnel);

module.exports = router;
