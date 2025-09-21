const mongoose = require('mongoose');
const Admin = require('./models/admin');
require('dotenv').config();

const checkAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all admin users
    const admins = await Admin.find({}).select('-password');
    
    console.log('\n📋 Current Admin Users in Database:');
    console.log('=' .repeat(60));
    
    if (admins.length === 0) {
      console.log('No admin users found in database.');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Department: ${admin.department}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('   ' + '-'.repeat(50));
      });
    }

    console.log('\n🔑 Login Instructions:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Start your frontend server: npm run dev');
    console.log('3. Go to: http://localhost:5173/admin-login');
    console.log('4. Use any of the emails above with password: password123');
    
    console.log('\n🎯 Role Capabilities:');
    console.log('• super_admin: Full system access + counsellor management');
    console.log('• counsellor: Pending bookings + appointment management');
    console.log('• dept_admin: Analytics + reports + booking oversight');

  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkAdminUsers();