const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const Admin = require('./models/admin');
const FlaggedCase = require('./models/flaggedCase');
const Resource = require('./models/resource');
const Feedback = require('./models/feedback');

// Sample data
const sampleAdmins = [
  {
    username: 'admin',
    email: 'admin@institution.edu',
    password: 'password123',
    role: 'super_admin',
    department: 'Student Welfare',
    firstName: 'System',
    lastName: 'Administrator',
    permissions: ['view_reports', 'manage_counsellors', 'view_analytics', 'manage_resources', 'view_feedback']
  },
  {
    username: 'counsellor1',
    email: 'dr.smith@institution.edu',
    password: 'password123',
    role: 'counsellor',
    department: 'Psychology',
    firstName: 'Sarah',
    lastName: 'Smith',
    permissions: ['view_reports', 'view_feedback']
  },
  {
    username: 'counsellor2',
    email: 'dr.johnson@institution.edu',
    password: 'password123',
    role: 'counsellor',
    department: 'Psychology',
    firstName: 'Michael',
    lastName: 'Johnson',
    permissions: ['view_reports', 'view_feedback']
  },
  {
    username: 'dept_admin',
    email: 'welfare@institution.edu',
    password: 'password123',
    role: 'dept_admin',
    department: 'Student Welfare',
    firstName: 'Jane',
    lastName: 'Wilson',
    permissions: ['view_reports', 'view_analytics', 'view_feedback']
  }
];

const sampleFlaggedCases = [
  {
    studentId: 'student_001',
    anonymizedId: 'STU-2024-001',
    department: 'Computer Science',
    year: '3',
    semester: '6',
    riskLevel: 'high',
    flaggedFor: ['anxiety', 'stress'],
    screeningScores: {
      pss: 28,
      phq9: 15,
      gad7: 12
    },
    status: 'pending',
    followUpRequired: true
  },
  {
    studentId: 'student_002',
    anonymizedId: 'STU-2024-002',
    department: 'Engineering',
    year: '2',
    semester: '4',
    riskLevel: 'moderate',
    flaggedFor: ['depression', 'stress'],
    screeningScores: {
      pss: 22,
      phq9: 11,
      gad7: 8
    },
    status: 'assigned',
    followUpRequired: true
  },
  {
    studentId: 'student_003',
    anonymizedId: 'STU-2024-003',
    department: 'Medicine',
    year: '4',
    semester: '8',
    riskLevel: 'critical',
    flaggedFor: ['depression', 'anxiety', 'burnout'],
    screeningScores: {
      pss: 35,
      phq9: 19,
      gad7: 16
    },
    status: 'escalated',
    followUpRequired: true
  },
  {
    studentId: 'student_004',
    anonymizedId: 'STU-2024-004',
    department: 'Business',
    year: '1',
    semester: '2',
    riskLevel: 'low',
    flaggedFor: ['stress'],
    screeningScores: {
      pss: 18,
      phq9: 6,
      gad7: 5
    },
    status: 'completed',
    followUpRequired: false
  },
  {
    studentId: 'student_005',
    anonymizedId: 'STU-2024-005',
    department: 'Arts',
    year: '3',
    semester: '5',
    riskLevel: 'moderate',
    flaggedFor: ['anxiety'],
    screeningScores: {
      pss: 24,
      phq9: 9,
      gad7: 11
    },
    status: 'in_progress',
    followUpRequired: true
  }
];

const sampleResources = [
  {
    title: 'Mindfulness Meditation Guide',
    description: 'A comprehensive guide to mindfulness meditation for stress reduction',
    type: 'guide',
    category: 'stress',
    language: 'en',
    fileUrl: '/resources/mindfulness-guide.pdf',
    analytics: {
      views: 245,
      likes: 32,
      shares: 8,
      downloads: 67
    },
    tags: ['mindfulness', 'meditation', 'stress relief']
  },
  {
    title: 'Breathing Exercises for Anxiety',
    description: 'Audio guide for breathing exercises to manage anxiety',
    type: 'audio',
    category: 'anxiety',
    language: 'en',
    fileUrl: '/resources/breathing-exercises.mp3',
    duration: 900, // 15 minutes
    analytics: {
      views: 189,
      likes: 28,
      shares: 12,
      downloads: 45
    },
    tags: ['breathing', 'anxiety', 'relaxation']
  },
  {
    title: 'Sleep Hygiene Best Practices',
    description: 'Video tutorial on establishing healthy sleep habits',
    type: 'video',
    category: 'sleep',
    language: 'en',
    fileUrl: '/resources/sleep-hygiene.mp4',
    duration: 1200, // 20 minutes
    analytics: {
      views: 312,
      likes: 45,
      shares: 15,
      downloads: 0
    },
    tags: ['sleep', 'hygiene', 'health']
  }
];

const sampleFeedback = [
  {
    isAnonymous: true,
    category: 'platform',
    rating: 4,
    feedback: 'The platform is very helpful and easy to use. The counsellor matching system works well.',
    sentiment: 'positive',
    status: 'reviewed'
  },
  {
    isAnonymous: true,
    category: 'counselling',
    rating: 5,
    feedback: 'My counsellor was very understanding and provided great support during my difficult time.',
    sentiment: 'positive',
    status: 'new'
  },
  {
    isAnonymous: false,
    category: 'technical',
    rating: 2,
    feedback: 'The video call feature sometimes has connectivity issues. Please fix this.',
    sentiment: 'negative',
    status: 'new'
  },
  {
    isAnonymous: true,
    category: 'resources',
    rating: 4,
    feedback: 'The meditation resources are excellent. Would love to see more content in regional languages.',
    sentiment: 'positive',
    status: 'reviewed'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await FlaggedCase.deleteMany({});
    await Resource.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data');

    // Create admins
    console.log('Creating admin accounts...');
    const adminIds = [];
    for (const adminData of sampleAdmins) {
      const admin = new Admin(adminData);
      await admin.save();
      adminIds.push(admin._id);
      console.log(`Created admin: ${admin.email}`);
    }

    // Assign counsellors to some flagged cases
    const counsellorIds = adminIds.slice(1, 3); // Get counsellor IDs
    
    console.log('Creating flagged cases...');
    for (let i = 0; i < sampleFlaggedCases.length; i++) {
      const caseData = {
        ...sampleFlaggedCases[i],
        // Assign counsellors to assigned and in_progress cases
        assignedCounsellor: (sampleFlaggedCases[i].status === 'assigned' || sampleFlaggedCases[i].status === 'in_progress') 
          ? counsellorIds[i % counsellorIds.length] 
          : undefined
      };
      
      const flaggedCase = new FlaggedCase(caseData);
      await flaggedCase.save();
      console.log(`Created flagged case: ${flaggedCase.anonymizedId}`);
    }

    // Create resources with admin as uploader
    console.log('Creating resources...');
    for (const resourceData of sampleResources) {
      const resource = new Resource({
        ...resourceData,
        uploadedBy: adminIds[0] // First admin as uploader
      });
      await resource.save();
      console.log(`Created resource: ${resource.title}`);
    }

    // Create feedback
    console.log('Creating feedback...');
    for (const feedbackData of sampleFeedback) {
      const feedback = new Feedback(feedbackData);
      await feedback.save();
      console.log(`Created feedback entry`);
    }

    console.log('\n=== SEEDING COMPLETED ===');
    console.log('\nAdmin Login Credentials:');
    console.log('Super Admin: admin@institution.edu / password123');
    console.log('Counsellor 1: dr.smith@institution.edu / password123');
    console.log('Counsellor 2: dr.johnson@institution.edu / password123');
    console.log('Dept Admin: welfare@institution.edu / password123');
    console.log('\nYou can now access the admin portal at: http://localhost:5173/admin-login');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
