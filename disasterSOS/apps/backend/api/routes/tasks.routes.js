const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/', protect, requireRole('ngo', 'ndrf'), taskController.createTask);
router.get('/', protect, requireRole('ngo', 'ndrf', 'admin'), taskController.getTasks);
router.get('/:id', protect, requireRole('ngo', 'ndrf', 'citizen'), taskController.getTaskById);
router.patch('/:id', protect, requireRole('ngo', 'ndrf'), taskController.updateTask);
router.patch('/:id/status', protect, requireRole('ngo', 'ndrf', 'citizen'), taskController.updateTaskStatus);
router.delete('/:id', protect, requireRole('ngo', 'ndrf'), taskController.deleteTask);

module.exports = router;
