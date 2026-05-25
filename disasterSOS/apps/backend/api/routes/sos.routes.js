const express = require('express');
const router = express.Router();

// SOS emergencies reporting & alerts feed
router.post('/report', (req, res) => res.json({ message: 'Report emergency' }));
router.get('/feed', (req, res) => res.json({ alerts: [] }));

module.exports = router;
