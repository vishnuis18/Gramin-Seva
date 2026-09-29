const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

// Get monthly report (admin only)
router.get('/monthly', auth, authorize('admin'), reportController.getMonthlyReport);

// Get dashboard overview (admin only)
router.get('/dashboard', auth, authorize('admin'), reportController.getDashboardOverview);

module.exports = router;