const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    enum: ['water', 'electricity', 'roads', 'sanitation', 'drainage', 'streetlight', 'other']
  }],
  activeComplaints: {
    type: Number,
    default: 0
  },
  resolvedCount: {
    type: Number,
    default: 0
  },
  avgResolutionTime: {
    type: Number,
    default: 0
  },
  totalResolutionTime: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average resolution time
technicianSchema.methods.updateAvgResolutionTime = function(newResolutionTime) {
  this.totalResolutionTime += newResolutionTime;
  this.resolvedCount += 1;
  this.avgResolutionTime = Math.round(this.totalResolutionTime / this.resolvedCount);
};

technicianSchema.index({ specialization: 1, isAvailable: 1 });

module.exports = mongoose.model('Technician', technicianSchema);