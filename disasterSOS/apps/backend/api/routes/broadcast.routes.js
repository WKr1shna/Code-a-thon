const express = require('express');
const router = express.Router();

// Mass notification broadcast endpoint
router.post('/', (req, res) => res.json({ status: 'broadcasted' }));

module.exports = router;
