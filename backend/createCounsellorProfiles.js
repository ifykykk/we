const mongoose = require('mongoose');
const Admin = require('./models/admin');
const CounsellorProfile = require('./models/counsellorProfile');
require('dotenv').config();

const createCounsellorProfiles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all counsellors
    const counsellors = await Admin.find({ role: 'counsellor' });
    console.log(`Found ${counsellors.length} counsellors`);

    for (const counsellor of counsellors) {
      // Check if profile already exists
      const existingProfile = await CounsellorProfile.findOne({ adminId: counsellor._id });
      
      if (existingProfile) {
        console.log(`Profile already exists for ${counsellor.firstName} ${counsellor.lastName}`);
        continue;
      }

      // Create sample profile
      const profile = new CounsellorProfile({
        adminId: counsellor._id,
        specializations: [
          'stress_management',
          'anxiety_disorders', 
          'depression',
          'academic_pressure',
          'general_counseling'
        ],
        qualifications: [
          {
            degree: 'Ph.D. in Clinical Psychology',
            institution: 'University of Excellence',
            year: 2015,
            certification: 'Licensed Clinical Psychologist'
          },
          {
            degree: 'M.A. in Counseling Psychology',
            institution: 'Institute of Mental Health',
            year: 2012,
            certification: 'Certified Counselor'
          }
        ],
        experience: Math.floor(Math.random() * 10) + 5, // 5-15 years
        biography: `${counsellor.firstName} ${counsellor.lastName} is a dedicated mental health professional with extensive experience in counseling and therapy. Specializing in student wellness and academic stress management, they provide compassionate, evidence-based care to help individuals overcome challenges and achieve their personal goals.`,
        languages: ['English', 'Hindi'],
        availability: {
          monday: {
            available: true,
            startTime: '09:00',
            endTime: '17:00',
            maxBookings: 6
          },
          tuesday: {
            available: true,
            startTime: '09:00',
            endTime: '17:00',
            maxBookings: 6
          },
          wednesday: {
            available: true,
            startTime: '09:00',
            endTime: '17:00',
            maxBookings: 6
          },
          thursday: {
            available: true,
            startTime: '09:00',
            endTime: '17:00',
            maxBookings: 6
          },
          friday: {
            available: true,
            startTime: '09:00',
            endTime: '16:00',
            maxBookings: 4
          },
          saturday: {
            available: false,
            startTime: '',
            endTime: '',
            maxBookings: 0
          },
          sunday: {
            available: false,
            startTime: '',
            endTime: '',
            maxBookings: 0
          }
        },
        isAcceptingBookings: true,
        emergencyAvailable: true,
        officeLocation: {
          building: 'Student Services Building',
          room: `Room ${Math.floor(Math.random() * 50) + 100}`,
          floor: `${Math.floor(Math.random() * 3) + 1}st Floor`,
          additionalInfo: 'Near the main entrance'
        },
        contactInfo: {
          officePhone: '+91-9876543210',
          emergencyContact: '+91-9876543211',
          officeHours: 'Monday-Friday: 9:00 AM - 5:00 PM'
        }
      });

      await profile.save();
      console.log(`✅ Created profile for ${counsellor.firstName} ${counsellor.lastName}`);
    }

    console.log('\n🎉 Counsellor profiles created successfully!');
    console.log('\n📋 Now you can:');
    console.log('1. Restart your backend server');
    console.log('2. Try booking an appointment as a student');
    console.log('3. Login as counsellor to manage bookings');

  } catch (error) {
    console.error('Error creating counsellor profiles:', error);
  } finally {
    mongoose.disconnect();
  }
};

createCounsellorProfiles();