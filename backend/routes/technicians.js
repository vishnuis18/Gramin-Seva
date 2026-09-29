const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { auth, authorize } = require('../middleware/auth');

// Get all technicians
router.get('/', auth, technicianController.getTechnicians);

// Get technician by ID
router.get('/:id', auth, technicianController.getTechnicianById);

// Create technician (admin only)
router.post('/', auth, authorize('admin'), technicianController.createTechnician);

// Update technician (admin or self)
router.put('/:id', auth, authorize('admin', 'technician'), technicianController.updateTechnician);

// Delete technician (admin only)
router.delete('/:id', auth, authorize('admin'), technicianController.deleteTechnician);

// Get technician performance stats
router.get('/:id/stats', auth, technicianController.getTechnicianStats);

// Update technician location (technician only)
router.post('/location', auth, authorize('technician'), technicianController.updateTechnicianLocation);

module.exports = router;