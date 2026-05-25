const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', resourceController.getResources);
router.get('/nearby', resourceController.getNearbyResources);
router.get('/types', resourceController.getResourceTypes);
router.get('/:id', resourceController.getResourceById);

router.post('/', protect, requireRole('ngo', 'ndrf', 'admin'), resourceController.createResource);
router.patch('/:id/capacity', protect, requireRole('ngo', 'ndrf'), resourceController.updateResourceCapacity);
router.patch('/:id', protect, requireRole('ngo', 'ndrf', 'admin'), resourceController.updateResource);
router.delete('/:id', protect, requireRole('admin'), resourceController.deleteResource);

module.exports = router;
