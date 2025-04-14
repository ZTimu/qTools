const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');

// Register route
router.post('/register', UserController.register);

// Login route
router.post('/login', UserController.login);

// Logout route
router.get('/logout', UserController.logout);

// Get user profile
router.get('/profile', auth, UserController.getProfile);

module.exports = router;