const Technician = require('../models/Technician');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Create new technician
exports.createTechnician = async (req, res) => {
  try {
    const { name, phone, specialization, email } = req.body;

    // Validate phone number
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Check if technician already exists
    const existingTechnician = await Technician.findOne({ phone });
    if (existingTechnician) {
      return res.status(400).json({ error: 'Technician with this phone already exists' });
    }

    // Create or find user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({
        phone,
        name,
        email,
        role: 'technician'
      });
      await user.save();
    } else {
      // Update existing user
      user.role = 'technician';
      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();
    }

    // Create technician
    const technician = new Technician({
      userId: user._id,
      name,
      phone,
      specialization: Array.isArray(specialization) ? specialization : [specialization]
    });

    await technician.save();

    res.status(201).json({
      success: true,
      technician,
      message: 'Technician created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all technicians
exports.getTechnicians = async (req, res) => {
  try {
    const { specialization, isAvailable, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const technicians = await Technician.find(filter)
      .populate('userId', 'name phone email')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Technician.countDocuments(filter);

    res.json({
      success: true,
      technicians,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get technician by ID
exports.getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findById(id).populate('userId', 'name phone email');

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Get assigned complaints
    const assignedComplaints = await Complaint.find({
      assignedTo: id,
      status: { $in: ['assigned', 'in-progress'] }
    }).select('complaintId category status location createdAt priority');

    res.json({
      success: true,
      technician,
      assignedComplaints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update technician
exports.updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, isAvailable, location } = req.body;

    const technician = await Technician.findById(id);

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    if (name) technician.name = name;
    if (specialization) technician.specialization = Array.isArray(specialization) ? specialization : [specialization];
    if (isAvailable !== undefined) technician.isAvailable = isAvailable;
    if (location) technician.location = location;

    await technician.save();

    // Update user name if provided
    if (name) {
      await User.findByIdAndUpdate(technician.userId, { name });
    }

    res.json({
      success: true,
      technician,
      message: 'Technician updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete technician
exports.deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findById(id);

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Check for active complaints
    const activeComplaints = await Complaint.countDocuments({
      assignedTo: id,
      status: { $in: ['assigned', 'in-progress'] }
    });

    if (activeComplaints > 0) {
      return res.status(400).json({ 
        error: `Cannot delete technician with ${activeComplaints} active complaint(s). Please reassign or resolve them first.` 
      });
    }

    await Technician.findByIdAndDelete(id);

    // Update user role to citizen
    await User.findByIdAndUpdate(technician.userId, { role: 'citizen' });

    res.json({
      success: true,
      message: 'Technician deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get technician performance stats
exports.getTechnicianStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const technician = await Technician.findById(id);

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    const filter = { assignedTo: id };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Complaint.aggregate([
      { $match: filter },
      {
        $facet: {
          statusCount: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          categoryCount: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          avgResolutionTime: [
            { $match: { status: 'resolved', actualResolutionTime: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$actualResolutionTime' } } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      technician: {
        name: technician.name,
        phone: technician.phone,
        specialization: technician.specialization,
        activeComplaints: technician.activeComplaints,
        resolvedCount: technician.resolvedCount,
        avgResolutionTime: technician.avgResolutionTime,
        rating: technician.rating
      },
      stats: stats[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update technician location (for tracking)
exports.updateTechnicianLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const technician = await Technician.findOne({ userId: req.userId });

    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    technician.location = { latitude, longitude };
    await technician.save();

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};