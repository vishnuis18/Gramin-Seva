const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Technician = require('../models/Technician');

//test OTP from environment
const TEST_OTP = process.env.TEST_OTP || '123456';

// Store OTPs temporarily (in production, will be using Redis)
const otpStore = new Map();

//send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    //store OTP with 5 minute expiry
    otpStore.set(phone, {
      otp: TEST_OTP,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      testOTP: TEST_OTP // Only for development
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//verify OTP and login
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, role } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Verify OTP
    const storedOTP = otpStore.get(phone);
    if (!storedOTP) {
      return res.status(400).json({ error: 'OTP not found. Please request a new OTP' });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP expired. Please request a new OTP' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    //clearing otp
    otpStore.delete(phone);

    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new user
      user = new User({
        phone,
        role: role || 'citizen'
      });
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    //get additional info for technicians
    let technicianData = null;
    if (user.role === 'technician') {
      technicianData = await Technician.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        email: user.email,
        panchayatName: user.panchayatName
      },
      technician: technicianData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    
    let profile = {
      user
    };

    if (user.role === 'technician') {
      const technician = await Technician.findOne({ userId: user._id });
      profile.technician = technician;
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();

    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};