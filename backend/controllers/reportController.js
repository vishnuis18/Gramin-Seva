const Complaint = require('../models/Complaint');
const Technician = require('../models/Technician');

// Generate monthly report data
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year, category, status, technicianId } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Calculate date range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Build filter
    const filter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (technicianId) filter.assignedTo = technicianId;

    // Get all complaints for the period
    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name phone specialization')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalComplaints = complaints.length;
    
    const statusBreakdown = complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
    const unresolvedComplaints = totalComplaints - resolvedComplaints.length;

    const avgResolutionTime = resolvedComplaints.length > 0
      ? Math.round(
          resolvedComplaints
            .filter(c => c.actualResolutionTime)
            .reduce((sum, c) => sum + c.actualResolutionTime, 0) / resolvedComplaints.length
        )
      : 0;

    // Technician-wise performance
    const technicianPerformance = {};
    complaints.forEach(c => {
      if (c.assignedTo) {
        const techId = c.assignedTo._id.toString();
        if (!technicianPerformance[techId]) {
          technicianPerformance[techId] = {
            name: c.assignedTo.name,
            phone: c.assignedTo.phone,
            assigned: 0,
            resolved: 0,
            inProgress: 0
          };
        }
        technicianPerformance[techId].assigned += 1;
        if (c.status === 'resolved') technicianPerformance[techId].resolved += 1;
        if (c.status === 'in-progress') technicianPerformance[techId].inProgress += 1;
      }
    });

    // Location-wise complaint density
    const locationDensity = {};
    complaints.forEach(c => {
      const address = c.location.address || 'Unknown';
      locationDensity[address] = (locationDensity[address] || 0) + 1;
    });

    // Month-over-month comparison
    const prevMonthStart = new Date(year, month - 2, 1);
    const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);
    const prevMonthCount = await Complaint.countDocuments({
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });

    const monthOverMonthChange = prevMonthCount > 0
      ? Math.round(((totalComplaints - prevMonthCount) / prevMonthCount) * 100)
      : 0;

    res.json({
      success: true,
      report: {
        period: {
          month: parseInt(month),
          year: parseInt(year),
          startDate,
          endDate
        },
        summary: {
          totalComplaints,
          resolved: resolvedComplaints.length,
          unresolved: unresolvedComplaints,
          avgResolutionTime: `${avgResolutionTime} hours`,
          monthOverMonthChange: `${monthOverMonthChange > 0 ? '+' : ''}${monthOverMonthChange}%`
        },
        statusBreakdown,
        categoryBreakdown,
        technicianPerformance: Object.values(technicianPerformance),
        locationDensity,
        complaints: complaints.map(c => ({
          complaintId: c.complaintId,
          category: c.category,
          description: c.description.substring(0, 100) + (c.description.length > 100 ? '...' : ''),
          status: c.status,
          location: c.location.address || 'N/A',
          createdAt: c.createdAt,
          resolvedAt: c.resolvedAt,
          assignedTo: c.assignedTo ? c.assignedTo.name : 'Unassigned'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalComplaints,
      todayComplaints,
      pendingComplaints,
      resolvedComplaints,
      inProgressComplaints,
      activeTechnicians,
      categoryStats,
      recentComplaints
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ createdAt: { $gte: today } }),
      Complaint.countDocuments({ status: 'submitted' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'in-progress' }),
      Technician.countDocuments({ isAvailable: true }),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Complaint.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('assignedTo', 'name')
        .select('complaintId category status createdAt location.address')
    ]);

    res.json({
      success: true,
      overview: {
        totalComplaints,
        todayComplaints,
        pendingComplaints,
        resolvedComplaints,
        inProgressComplaints,
        activeTechnicians,
        categoryStats,
        recentComplaints
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};