const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;