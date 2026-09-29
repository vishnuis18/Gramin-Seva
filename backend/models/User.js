const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[6-9]\d{9}$/
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'technician'],
    default: 'citizen'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  panchayatName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ phone: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);