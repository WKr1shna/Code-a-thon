const express = require('express');
const router = express.Router();

// JWT login and signup endpoints
router.post('/login', (req, res) => res.json({ message: 'Login path' }));
router.post('/register', (req, res) => res.json({ message: 'Register path' }));

module.exports = router;
