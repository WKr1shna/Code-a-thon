const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { sosLimiter } = require('../middleware/rateLimiter');

router.post('/', optionalAuth, sosLimiter, sosController.reportAlert);
router.get('/', protect, requireRole('admin', 'ngo', 'ndrf', 'citizen'), sosController.getAlerts);
router.get('/nearby', sosController.getNearbyAlerts);
router.get('/heatmap', protect, requireRole('admin', 'ngo', 'ndrf'), sosController.getAlertHeatmap);
router.get('/stats', protect, requireRole('admin', 'ndrf'), sosController.getAlertStats);
router.get('/available-resources', protect, requireRole('admin', 'ngo', 'ndrf'), sosController.getAvailableResources);
router.get('/:id', sosController.getAlertById);
router.patch('/:id/status', protect, requireRole('admin', 'ngo', 'ndrf'), sosController.updateAlertStatus);
router.patch('/:id/severity', protect, requireRole('admin', 'ndrf'), sosController.updateAlertSeverity);
router.post('/:id/media', protect, sosController.addAlertMedia);
router.post('/:id/assign', protect, requireRole('admin', 'ngo', 'ndrf'), sosController.assignAlert);
router.post('/:id/ai-recommendation', protect, sosController.getAiRecommendation);
router.delete('/:id', protect, requireRole('admin'), sosController.deleteAlert);

module.exports = router;
