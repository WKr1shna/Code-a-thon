const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/users', protect, requireRole('admin'), adminController.getUsers);
router.patch('/users/:id/role', protect, requireRole('admin'), adminController.updateUserRole);
router.patch('/users/:id/ban', protect, requireRole('admin'), adminController.banUser);
router.get('/analytics', protect, requireRole('admin', 'ndrf'), adminController.getAnalytics);
router.get('/fake-queue', protect, requireRole('admin'), adminController.getFakeQueue);
router.post('/fake-queue/:id/confirm', protect, requireRole('admin'), adminController.confirmFakeAlert);
router.post('/fake-queue/:id/override', protect, requireRole('admin'), adminController.overrideFakeAlert);
router.get('/logs', protect, requireRole('admin'), adminController.getAuditLogs);

module.exports = router;
