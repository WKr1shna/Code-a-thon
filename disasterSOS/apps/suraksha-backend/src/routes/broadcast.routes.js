const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcast.controller');
const { protect, authorize } = require('../middlewares/auth');

router.post('/push', protect, authorize('SUPER_ADMIN', 'ADMIN', 'COORDINATOR'), broadcastController.sendBroadcast);
router.get('/history', protect, authorize('SUPER_ADMIN', 'ADMIN', 'COORDINATOR'), broadcastController.getBroadcasts);

module.exports = router;
