const express = require('express');
const router = express.Router();
const responderController = require('../controllers/responder.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/claim/:alertId', protect, requireRole('ngo', 'ndrf'), responderController.claimAlert);
router.get('/my-alerts', protect, requireRole('ngo', 'ndrf'), responderController.getMyAlerts);
router.post('/update/:alertId', protect, requireRole('ngo', 'ndrf'), responderController.addResponderUpdate);
router.get('/updates/:alertId', responderController.getResponderUpdates);
router.get('/teams', protect, requireRole('ndrf'), responderController.getTeams);
router.patch('/teams/:teamId/deploy', protect, requireRole('ndrf'), responderController.deployTeam);

module.exports = router;
