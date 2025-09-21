const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/user');
const FlaggedCase = require('./models/flaggedCase');
const Admin = require('./models/admin');
const Resource = require('./models/resource');

async function testDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test queries
    console.log('\n📋 Database Status:');
    
    const userCount = await User.countDocuments();
    console.log(`👥 Total users: ${userCount}`);
    
    const usersWithPSS = await User.countDocuments({ 'pssScore.0': { $exists: true } });
    console.log(`📊 Users with PSS scores: ${usersWithPSS}`);
    
    const flaggedCaseCount = await FlaggedCase.countDocuments();
    console.log(`🚩 Total flagged cases: ${flaggedCaseCount}`);
    
    const adminCount = await Admin.countDocuments();
    console.log(`👤 Total admins: ${adminCount}`);
    
    const resourceCount = await Resource.countDocuments();
    console.log(`📚 Total resources: ${resourceCount}`);
    
    // Show recent flagged cases
    const recentCases = await FlaggedCase.find().sort({ createdAt: -1 }).limit(10);
    console.log('\n🕜 Recent Flagged Cases:');
    recentCases.forEach((case_, index) => {
      console.log(`${index + 1}. ${case_.anonymizedId} - ${case_.riskLevel} (${case_.department})`);
    });
    
    // Show recent users with PSS scores
    const recentUsers = await User.find({ 'pssScore.0': { $exists: true } })
      .select('email clerkId pssScore')
      .sort({ 'pssScore.date': -1 })
      .limit(5);
    
    console.log('\n👥 Recent Users with PSS Scores:');
    recentUsers.forEach((user, index) => {
      const latestScore = user.pssScore[user.pssScore.length - 1];
      console.log(`${index + 1}. ${user.email} - PSS: ${latestScore.value} (${latestScore.date})`);
    });
    
    // Show all users for debugging
    const allUsers = await User.find().select('email clerkId firstName lastName');
    console.log('\n🔍 All Users in Database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (clerkId: ${user.clerkId})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testDatabase();
