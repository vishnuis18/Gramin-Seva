const Complaint = require('../models/Complaint');
const Technician = require('../models/Technician');

// Create new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { category, description, location, citizenPhone, citizenName, priority } = req.body;

    if (!category || !description || !location || !citizenPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    const complaint = new Complaint({
      category,
      description,
      images,
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        address: location.address
      },
      citizenPhone,
      citizenName,
      priority: priority || 'medium',
      statusHistory: [{ status: 'submitted', changedBy: req.userId }]
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      complaint,
      message: `Complaint registered successfully. Your complaint ID is ${complaint.complaintId}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all complaints with filters
exports.getComplaints = async (req, res) => {
  try {
    const {
      status, category, startDate, endDate, assignedTo,
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (req.user.role === 'citizen') {
      filter.citizenPhone = req.user.phone;
    }

    if (req.user.role === 'technician') {
      const technician = await Technician.findOne({ userId: req.userId });
      if (technician) filter.assignedTo = technician._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name phone specialization')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      complaints,
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

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findOne({ $or: [{ _id: id }, { complaintId: id }] })
      .populate('assignedTo', 'name phone specialization rating')
      .populate('internalNotes.addedBy', 'name role')
      .populate('statusHistory.changedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (req.user?.role === 'citizen' && complaint.citizenPhone !== req.user.phone) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = status;
    complaint.statusHistory.push({ status, changedBy: req.userId });

    if (notes) {
      complaint.internalNotes.push({ note: notes, addedBy: req.userId });
    }

    if (status === 'closed' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    if (status === 'closed' && complaint.assignedTo) {
      const technician = await Technician.findById(complaint.assignedTo);
      if (technician) {
        technician.activeComplaints = Math.max(0, technician.activeComplaints - 1);
        if (complaint.actualResolutionTime) technician.updateAvgResolutionTime(complaint.actualResolutionTime);
        await technician.save();
      }
    }

    res.json({ success: true, complaint, message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign complaint to technician
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId, estimatedResolutionTime, priority, reason } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const technician = await Technician.findById(technicianId);
    if (!technician) return res.status(404).json({ error: 'Technician not found' });

    if (!technician.specialization.includes(complaint.category)) {
      return res.status(400).json({
        error: `Technician specialization (${technician.specialization.join(', ')}) does not match complaint category (${complaint.category})`
      });
    }

    // Track reassignment history
    complaint.assignmentHistory.push({
      technician: technicianId,
      assignedAt: new Date(),
      reason: reason || 'Initial assignment'
    });

    complaint.assignedTo = technicianId;
    complaint.assignedAt = new Date();
    complaint.status = 'assigned';
    if (estimatedResolutionTime) complaint.estimatedResolutionTime = new Date(estimatedResolutionTime);
    if (priority) complaint.priority = priority;

    complaint.statusHistory.push({ status: 'assigned', changedBy: req.userId });

    await complaint.save();

    technician.activeComplaints += 1;
    await technician.save();

    res.json({ success: true, complaint, message: 'Complaint assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Legacy resolve (kept for backward compat)
exports.resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const resolutionImages = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    complaint.status = 'pending_verification';
    complaint.resolutionNotes = resolutionNotes;
    complaint.resolutionImages = resolutionImages;
    complaint.technicianResolution = {
      note: resolutionNotes,
      images: resolutionImages,
      resolvedAt: new Date()
    };

    complaint.statusHistory.push({ status: 'pending_verification', changedBy: req.userId });

    await complaint.save();

    res.json({ success: true, complaint, message: 'Resolution submitted. Awaiting citizen verification.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add internal note
exports.addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.internalNotes.push({ note, addedBy: req.userId });
    await complaint.save();

    res.json({ success: true, complaint, message: 'Note added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get complaint statistics
exports.getComplaintStats = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (category) filter.category = category;

    const stats = await Complaint.aggregate([
      { $match: filter },
      {
        $facet: {
          statusCount: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          categoryCount: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
          priorityCount: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          avgResolutionTime: [
            { $match: { status: 'closed', actualResolutionTime: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$actualResolutionTime' } } }
          ],
          totalComplaints: [{ $count: 'count' }]
        }
      }
    ]);

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Double-verification handlers ─────────────────────────────────────────────

// Technician marks job done → status: pending_verification
exports.technicianResolve = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (!['in-progress', 'reopened'].includes(complaint.status)) {
      return res.status(400).json({ error: 'Complaint must be in-progress or reopened to submit resolution' });
    }

    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    complaint.technicianResolution = {
      note: note || '',
      images,
      resolvedAt: new Date()
    };

    complaint.status = 'pending_verification';
    complaint.statusHistory.push({ status: 'pending_verification', changedBy: req.userId });

    await complaint.save();

    res.json({
      success: true,
      complaint,
      message: 'Resolution submitted. Citizen will now be asked to verify.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Citizen confirms yes/no → recorded for admin review
exports.citizenVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed, note } = req.body;

    if (confirmed === undefined) {
      return res.status(400).json({ error: 'confirmed (true/false) is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (complaint.status !== 'pending_verification') {
      return res.status(400).json({ error: 'Complaint is not awaiting citizen verification' });
    }

    // Ensure citizen owns this complaint
    if (complaint.citizenPhone !== req.user.phone) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    complaint.citizenVerification = {
      confirmed: confirmed === 'true' || confirmed === true,
      note: note || '',
      images,
      respondedAt: new Date()
    };

    complaint.statusHistory.push({ status: 'pending_verification', changedBy: req.userId });

    await complaint.save();

    res.json({
      success: true,
      complaint,
      message: 'Verification submitted. Admin will review and close the complaint.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin closes or re-assigns after reviewing both responses
exports.adminClose = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note, technicianId } = req.body;

    if (!['closed', 'reassigned'].includes(action)) {
      return res.status(400).json({ error: 'action must be "closed" or "reassigned"' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.adminClosure = {
      closedBy: req.userId,
      action,
      note: note || '',
      actionAt: new Date()
    };

    if (action === 'closed') {
      complaint.status = 'closed';
      complaint.resolvedAt = new Date();

      if (complaint.createdAt) {
        const diffMs = complaint.resolvedAt - complaint.createdAt;
        complaint.actualResolutionTime = Math.round(diffMs / (1000 * 60 * 60));
      }

      complaint.statusHistory.push({ status: 'closed', changedBy: req.userId });

      // Update technician stats
      if (complaint.assignedTo) {
        const technician = await Technician.findById(complaint.assignedTo);
        if (technician) {
          technician.activeComplaints = Math.max(0, technician.activeComplaints - 1);
          if (complaint.actualResolutionTime) technician.updateAvgResolutionTime(complaint.actualResolutionTime);
          await technician.save();
        }
      }
    } else {
      // Reassign — reset verification fields so the flow restarts
      complaint.status = 'reopened';
      complaint.technicianResolution = undefined;
      complaint.citizenVerification = undefined;

      complaint.statusHistory.push({ status: 'reopened', changedBy: req.userId });

      // Optionally reassign to a different technician in the same call
      if (technicianId) {
        const technician = await Technician.findById(technicianId);
        if (technician) {
          complaint.assignmentHistory.push({
            technician: technicianId,
            assignedAt: new Date(),
            reason: note || 'Admin re-assigned after citizen reported unresolved'
          });
          complaint.assignedTo = technicianId;
          complaint.assignedAt = new Date();
          technician.activeComplaints += 1;
          await technician.save();
        }
      }
    }

    await complaint.save();

    res.json({
      success: true,
      complaint,
      message: action === 'closed' ? 'Complaint closed successfully.' : 'Complaint reopened and reassigned.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};