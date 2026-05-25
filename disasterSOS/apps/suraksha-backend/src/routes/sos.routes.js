const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'COORDINATOR'));

router.get('/', sosController.getSosRequests);
router.get('/available-resources', sosController.getAvailableResources);
router.post('/:id/assign', sosController.assignResource);
router.post('/:id/ai-recommendation', sosController.getAiRecommendation);

module.exports = router;
