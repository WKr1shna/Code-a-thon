const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => res.json({ status: 'registered' }));

module.exports = router;
