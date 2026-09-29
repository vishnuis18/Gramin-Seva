require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Technician = require('./models/Technician');
const Complaint = require('./models/Complaint');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_complaint_portal');
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Technician.deleteMany({});
    await Complaint.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create Admin User
    const adminUser = await User.create({
      phone: '9876543210',
      name: 'Admin User',
      role: 'admin',
      email: 'admin@ruralportal.in',
      panchayatName: 'Ashta Panchayat'
    });
    console.log('✓ Created admin user');

    // Create Technician Users
    const technicianUsers = await User.insertMany([
      {
        phone: '9876543211',
        name: 'Ramesh Kumar',
        role: 'technician',
        email: 'ramesh@ruralportal.in'
      },
      {
        phone: '9876543212',
        name: 'Suresh Patel',
        role: 'technician',
        email: 'suresh@ruralportal.in'
      },
      {
        phone: '9876543213',
        name: 'Mukesh Singh',
        role: 'technician',
        email: 'mukesh@ruralportal.in'
      }
    ]);
    console.log('✓ Created technician users');

    // Create Technician Profiles
    const technicians = await Technician.insertMany([
      {
        userId: technicianUsers[0]._id,
        name: 'Ramesh Kumar',
        phone: '9876543211',
        specialization: ['water', 'sanitation'],
        activeComplaints: 0,
        resolvedCount: 45,
        avgResolutionTime: 42,
        totalResolutionTime: 1890,
        isAvailable: true,
        rating: 4.5,
        totalRatings: 45
      },
      {
        userId: technicianUsers[1]._id,
        name: 'Suresh Patel',
        phone: '9876543212',
        specialization: ['electricity', 'streetlight'],
        activeComplaints: 0,
        resolvedCount: 38,
        avgResolutionTime: 36,
        totalResolutionTime: 1368,
        isAvailable: true,
        rating: 4.7,
        totalRatings: 38
      },
      {
        userId: technicianUsers[2]._id,
        name: 'Mukesh Singh',
        phone: '9876543213',
        specialization: ['roads', 'drainage'],
        activeComplaints: 0,
        resolvedCount: 52,
        avgResolutionTime: 60,
        totalResolutionTime: 3120,
        isAvailable: true,
        rating: 4.3,
        totalRatings: 52
      }
    ]);
    console.log('✓ Created technician profiles');

    // Create Citizen Users
    const citizenUsers = await User.insertMany([
      {
        phone: '9876543220',
        name: 'Rajesh Sharma',
        role: 'citizen'
      },
      {
        phone: '9876543221',
        name: 'Priya Gupta',
        role: 'citizen'
      },
      {
        phone: '9876543222',
        name: 'Amit Verma',
        role: 'citizen'
      }
    ]);
    console.log('✓ Created citizen users');

    // Create Sample Complaints
    const complaints = [];
    const categories = ['water', 'electricity', 'roads', 'sanitation', 'drainage', 'streetlight'];
    const statuses = ['submitted', 'assigned', 'in-progress', 'resolved'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const locations = [
      { address: 'Village Ashta, Main Road', latitude: 23.7041, longitude: 86.9740 },
      { address: 'Ashta School Area', latitude: 23.7050, longitude: 86.9750 },
      { address: 'Market Area, Ashta', latitude: 23.7035, longitude: 86.9730 },
      { address: 'Temple Road, Ashta', latitude: 23.7045, longitude: 86.9735 },
      { address: 'Railway Station Road', latitude: 23.7055, longitude: 86.9745 }
    ];

    const descriptions = {
      water: [
        'No water supply for the last 3 days',
        'Water pipe leakage causing wastage',
        'Low water pressure in the area',
        'Contaminated water supply issue'
      ],
      electricity: [
        'Frequent power cuts in the area',
        'Transformer making unusual noise',
        'Electric pole damaged and tilted',
        'Meter not working properly'
      ],
      roads: [
        'Large potholes on main road',
        'Road completely damaged after rain',
        'Speed breaker needed near school',
        'Road construction incomplete'
      ],
      sanitation: [
        'Garbage not collected for a week',
        'Public toilet not functioning',
        'Drainage overflow near houses',
        'Waste dumping in open area'
      ],
      drainage: [
        'Blocked drainage causing waterlogging',
        'Drainage cover missing - safety hazard',
        'Sewage overflow in residential area',
        'Need new drainage line installation'
      ],
      streetlight: [
        'Street lights not working for 2 weeks',
        'Multiple bulbs fused in the area',
        'New street light needed on dark road',
        'Timer not functioning properly'
      ]
    };

    // Create 50 complaints with varied statuses
    const existingComplaintCount = await Complaint.countDocuments();
    for (let i = 0; i < 50; i++) {
      const category = categories[i % categories.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const location = locations[i % locations.length];
      const citizenPhone = citizenUsers[i % citizenUsers.length].phone;
      const citizenName = citizenUsers[i % citizenUsers.length].name;
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const number = (existingComplaintCount + i + 1).toString().padStart(5, '0');
      const complaintId = `CMP${year}${month}${number}`;
      
      // Select appropriate technician based on category
      let assignedTechnician = null;
      if (status !== 'submitted') {
        if (['water', 'sanitation'].includes(category)) {
          assignedTechnician = technicians[0]._id;
        } else if (['electricity', 'streetlight'].includes(category)) {
          assignedTechnician = technicians[1]._id;
        } else if (['roads', 'drainage'].includes(category)) {
          assignedTechnician = technicians[2]._id;
        }
      }

      const createdDate = new Date(2024, 1, Math.floor(Math.random() * 12) + 1); // February 2024
      
      const complaint = {
        complaintId,
        category,
        description: descriptions[category][Math.floor(Math.random() * descriptions[category].length)],
        location,
        citizenPhone,
        citizenName,
        status,
        priority,
        assignedTo: assignedTechnician,
        assignedAt: assignedTechnician ? new Date(createdDate.getTime() + 3600000) : null,
        createdAt: createdDate,
        statusHistory: [
          { status: 'submitted', changedAt: createdDate, changedBy: adminUser._id }
        ]
      };

      if (status === 'assigned' || status === 'in-progress' || status === 'resolved') {
        complaint.statusHistory.push({
          status: 'assigned',
          changedAt: new Date(createdDate.getTime() + 3600000),
          changedBy: adminUser._id
        });
      }

      if (status === 'in-progress' || status === 'resolved') {
        complaint.statusHistory.push({
          status: 'in-progress',
          changedAt: new Date(createdDate.getTime() + 7200000),
          changedBy: assignedTechnician
        });
      }

      if (status === 'resolved') {
        const resolvedDate = new Date(createdDate.getTime() + 86400000 * Math.floor(Math.random() * 3 + 1));
        complaint.resolvedAt = resolvedDate;
        complaint.actualResolutionTime = Math.floor((resolvedDate - createdDate) / (1000 * 60 * 60)); // hours
        complaint.resolutionNotes = 'Issue resolved successfully. All necessary repairs completed.';
        complaint.statusHistory.push({
          status: 'resolved',
          changedAt: resolvedDate,
          changedBy: assignedTechnician
        });
      }

      complaints.push(complaint);
    }

    await Complaint.insertMany(complaints);
    console.log('✓ Created 50 sample complaints');

    // Update technician active complaint counts
    for (const tech of technicians) {
      const activeCount = await Complaint.countDocuments({
        assignedTo: tech._id,
        status: { $in: ['assigned', 'in-progress'] }
      });
      tech.activeComplaints = activeCount;
      await tech.save();
    }
    console.log('✓ Updated technician complaint counts');

    console.log('\n==============================================');
    console.log('✅ Database seeded successfully!');
    console.log('==============================================');
    console.log('\nTest Credentials:');
    console.log('\n📱 Admin:');
    console.log('   Phone: 9876543210');
    console.log('   OTP: 123456');
    console.log('\n🔧 Technicians:');
    console.log('   Phone: 9876543211 (Water/Sanitation)');
    console.log('   Phone: 9876543212 (Electricity/Streetlight)');
    console.log('   Phone: 9876543213 (Roads/Drainage)');
    console.log('   OTP: 123456');
    console.log('\n👤 Citizens:');
    console.log('   Phone: 9876543220');
    console.log('   Phone: 9876543221');
    console.log('   Phone: 9876543222');
    console.log('   OTP: 123456');
    console.log('\n📊 Data Created:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Technicians: ${await Technician.countDocuments()}`);
    console.log(`   Complaints: ${await Complaint.countDocuments()}`);
    console.log('==============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();