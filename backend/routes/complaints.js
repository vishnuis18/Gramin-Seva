const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route - track complaint by ID
router.get('/track/:id', complaintController.getComplaintById);

// Create complaint (citizens)
router.post('/', auth, upload.array('images', 5), complaintController.createComplaint);

// Get complaints (with role-based filtering)
router.get('/', auth, complaintController.getComplaints);

// Get complaint by ID (authenticated)
router.get('/:id', auth, complaintController.getComplaintById);

// Update complaint status (admin and technician)
router.patch('/:id/status', auth, authorize('admin', 'technician'), complaintController.updateComplaintStatus);

// Assign complaint (admin only)
router.post('/:id/assign', auth, authorize('admin'), complaintController.assignComplaint);

// Resolve complaint (technician)
router.post('/:id/resolve', auth, authorize('technician'), upload.array('resolutionImages', 5), complaintController.resolveComplaint);

// Add internal note (admin only)
router.post('/:id/notes', auth, authorize('admin'), complaintController.addInternalNote);

// Get statistics (admin only)
router.get('/stats/overview', auth, authorize('admin'), complaintController.getComplaintStats);


// Technician marks job done + uploads proof → status: pending_verification
router.post('/:id/technician-resolve', auth, authorize('technician'), upload.array('images', 3), complaintController.technicianResolve);

// Citizen confirms yes/no + optional photo → triggers admin review
router.post('/:id/citizen-verify', auth, authorize('citizen'), upload.array('images', 3), complaintController.citizenVerify);

// Admin closes or re-assigns after seeing both responses
router.post('/:id/admin-close', auth, authorize('admin'), complaintController.adminClose);


module.exports = router;