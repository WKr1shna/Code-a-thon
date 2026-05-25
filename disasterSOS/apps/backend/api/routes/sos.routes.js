const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { sosLimiter } = require('../middleware/rateLimiter');

router.post('/', optionalAuth, sosLimiter, sosController.reportAlert);
router.get('/', protect, requireRole('admin', 'ngo', 'ndrf'), sosController.getAlerts);
router.get('/nearby', sosController.getNearbyAlerts);
router.get('/heatmap', protect, requireRole('admin', 'ngo', 'ndrf'), sosController.getAlertHeatmap);
router.get('/stats', protect, requireRole('admin', 'ndrf'), sosController.getAlertStats);
router.get('/:id', sosController.getAlertById);
router.patch('/:id/status', protect, requireRole('admin', 'ngo', 'ndrf'), sosController.updateAlertStatus);
router.patch('/:id/severity', protect, requireRole('admin', 'ndrf'), sosController.updateAlertSeverity);
router.post('/:id/media', protect, sosController.addAlertMedia);
router.delete('/:id', protect, requireRole('admin'), sosController.deleteAlert);

module.exports = router;
