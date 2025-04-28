const express = require('express');
const { registerUser, loginUser } = require('../Controllers/userController');
const router = express.Router();

// POST request for registering user
router.post('/register', registerUser);

// POST request for logging in user
router.post('/login', loginUser);

module.exports = router;
