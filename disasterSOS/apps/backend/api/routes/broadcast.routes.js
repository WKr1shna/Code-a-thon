const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcast.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/push', protect, requireRole('admin', 'ndrf'), broadcastController.sendPushNotification);
router.post('/sms', protect, requireRole('admin', 'ndrf'), broadcastController.sendSMS);
router.post('/whatsapp', protect, requireRole('admin', 'ndrf'), broadcastController.sendWhatsApp);
router.get('/history', protect, requireRole('admin'), broadcastController.getBroadcastHistory);
router.post('/emergency', protect, requireRole('ndrf'), broadcastController.sendEmergencyBroadcast);

module.exports = router;
