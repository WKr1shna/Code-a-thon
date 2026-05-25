const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ alerts: [] }));
router.put('/:id/verify', (req, res) => res.json({ status: 'updated' }));

module.exports = router;
