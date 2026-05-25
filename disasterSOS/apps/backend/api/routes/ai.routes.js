const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/verify', aiController.verifyAlert); // internal or webhook trigger
router.get('/verify/:alertId', protect, requireRole('admin'), aiController.getAlertVerification);
router.post('/translate', protect, aiController.translateAlert);
router.get('/translate/:alertId', protect, aiController.getAlertTranslations);
router.post('/predict/flood', protect, requireRole('ndrf', 'admin'), aiController.predictFlood);
router.get('/risk-zones', protect, requireRole('ngo', 'ndrf', 'admin'), aiController.getRiskZones);

module.exports = router;
