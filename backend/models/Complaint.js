const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['water', 'electricity', 'roads', 'sanitation', 'drainage', 'streetlight', 'other']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, trim: true }
  },
  citizenPhone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/
  },
  citizenName: {
    type: String,
    trim: true
  },

  // ─── Status ───────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['submitted', 'assigned', 'in-progress', 'resolved', 'pending_verification', 'closed', 'reopened', 'rejected'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // ─── Assignment ───────────────────────────────────────────────────────────────
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  assignedAt: Date,

  // tracks every (re)assignment with reason
  assignmentHistory: [{
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    reason: String,   // e.g. "citizen reported unresolved"
  }],

  // ─── Technician resolution ────────────────────────────────────────────────────
  technicianResolution: {
    note: { type: String, trim: true },
    images: [{
      url: String,
      filename: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    resolvedAt: Date,
  },

  // ─── Citizen verification ─────────────────────────────────────────────────────
  citizenVerification: {
    confirmed: Boolean,       // true = fixed, false = not fixed
    note: { type: String, trim: true },
    images: [{
      url: String,
      filename: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    respondedAt: Date,
  },

  // ─── Admin closure ────────────────────────────────────────────────────────────
  adminClosure: {
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['closed', 'reassigned'] },
    note: { type: String, trim: true },
    actionAt: Date,
  },

  // ─── Legacy / misc ────────────────────────────────────────────────────────────
  internalNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  estimatedResolutionTime: Date,
  actualResolutionTime: Number,   // in hours
  resolvedAt: Date,               // kept for backward compat — also set in pre('save')
  resolutionNotes: { type: String, trim: true },  // kept for backward compat

}, { timestamps: true });

// ─── Auto-generate complaint ID ───────────────────────────────────────────────
complaintSchema.pre('validate', async function (next) {
  if (!this.complaintId) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const number = (count + 1).toString().padStart(5, '0');
    this.complaintId = `CMP${year}${month}${number}`;
  }
  next();
});

// ─── Auto-compute resolution time on close ────────────────────────────────────
complaintSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'closed' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    if (this.createdAt) {
      const timeDiff = this.resolvedAt - this.createdAt;
      this.actualResolutionTime = Math.round(timeDiff / (1000 * 60 * 60));
    }
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ citizenPhone: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);