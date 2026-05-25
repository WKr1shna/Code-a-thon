const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incident.controller');
const validate = require('../middlewares/validate');
const { createIncidentSchema, updateStatusSchema } = require('../validators/incident.validator');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, incidentController.getIncidents);
router.post('/', protect, validate(createIncidentSchema), incidentController.createIncident);
router.patch('/:id/status', protect, authorize('SUPER_ADMIN', 'ADMIN', 'COORDINATOR'), validate(updateStatusSchema), incidentController.updateIncidentStatus);

module.exports = router;
