const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/register', protect, requireRole('citizen'), volunteerController.registerVolunteer);
router.get('/', protect, requireRole('ngo', 'ndrf', 'admin'), volunteerController.getVolunteers);
router.get('/nearby', protect, requireRole('ngo', 'ndrf'), volunteerController.getNearbyVolunteers);
router.get('/my-tasks', protect, requireRole('citizen'), volunteerController.getMyTasks);
router.get('/:id', protect, requireRole('ngo', 'ndrf', 'admin'), volunteerController.getVolunteerById);
router.patch('/:id/status', protect, requireRole('ngo', 'ndrf'), volunteerController.updateVolunteerStatus);
router.patch('/my-tasks/:taskId', protect, requireRole('citizen'), volunteerController.updateMyTaskStatus);

module.exports = router;
