const express = require('express');
const router = express.Router();

// Resource distribution (food, shelters, medicines)
router.get('/', (req, res) => res.json({ resources: [] }));

module.exports = router;
