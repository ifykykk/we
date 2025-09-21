const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/admin');
require('dotenv').config();

const seedAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingAdmins = await Admin.find({});
    if (existingAdmins.length > 0) {
      console.log('Admin users already exist. Skipping seed.');
      process.exit(0);
    }

    // Create sample admin users
    const adminUsers = [
      {
        username: 'superadmin',
        email: 'admin@institution.edu',
        password: 'password123',
        role: 'super_admin',
        department: 'Administration',
        firstName: 'Super',
        lastName: 'Admin',
        permissions: ['view_reports', 'manage_counsellors', 'view_analytics', 'manage_resources', 'view_feedback']
      },
      {
        username: 'drsmith',
        email: 'dr.smith@institution.edu',
        password: 'password123',
        role: 'counsellor',
        department: 'Psychology',
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        permissions: ['view_reports', 'view_analytics']
      },
      {
        username: 'drjohnson',
        email: 'dr.johnson@institution.edu',
        password: 'password123',
        role: 'counsellor',
        department: 'Mental Health',
        firstName: 'Dr. Michael',
        lastName: 'Johnson',
        permissions: ['view_reports', 'view_analytics']
      },
      {
        username: 'welfaredept',
        email: 'welfare@institution.edu',
        password: 'password123',
        role: 'dept_admin',
        department: 'Student Welfare',
        firstName: 'Welfare',
        lastName: 'Department',
        permissions: ['view_reports', 'view_analytics', 'view_feedback']
      }
    ];

    // Hash passwords and create users
    for (const userData of adminUsers) {
      const admin = new Admin(userData);
      await admin.save();
      console.log(`Created admin user: ${userData.email} (${userData.role})`);
    }

    console.log('✅ Sample admin users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('1. Super Admin: admin@institution.edu / password123');
    console.log('2. Counsellor 1: dr.smith@institution.edu / password123');
    console.log('3. Counsellor 2: dr.johnson@institution.edu / password123');
    console.log('4. Dept Admin: welfare@institution.edu / password123');

  } catch (error) {
    console.error('Error seeding admin users:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedAdminUsers();