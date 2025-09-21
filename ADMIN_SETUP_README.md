# Admin Dashboard Setup Guide

## Overview
This guide will help you set up and run the SoulSync Admin Dashboard alongside the existing student platform.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

## Backend Setup

### 1. Install Additional Dependencies
```bash
cd backend
npm install bcrypt jsonwebtoken
```

### 2. Environment Variables
Make sure your `.env` file in the backend directory includes:
```env
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key-for-admin-auth
```

### 3. Seed Admin Data
Run the seeding script to create sample admin accounts and test data:
```bash
cd backend
node seedAdminData.js
```

### 4. Start Backend Server
```bash
cd backend
npm start
```
The server will run on `http://localhost:3000`

## Frontend Setup

### 1. Install Additional Dependencies
```bash
cd ../  # Go back to root directory
npm install recharts
```

### 2. Start Frontend Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## Admin Login Credentials

After running the seeding script, you can use these test accounts:

### Super Administrator
- **Email**: `admin@institution.edu`
- **Password**: `password123`
- **Access**: Full system access

### Counsellor Accounts
- **Email**: `dr.smith@institution.edu` / **Password**: `password123`
- **Email**: `dr.johnson@institution.edu` / **Password**: `password123`
- **Access**: View flagged cases, manage assigned students

### Department Admin
- **Email**: `welfare@institution.edu`
- **Password**: `password123`
- **Access**: View analytics, reports, feedback

## Accessing the Admin Dashboard

1. Navigate to `http://localhost:5173/admin-login`
2. Use any of the credentials above
3. After successful login, you'll be redirected to the admin dashboard

## Admin Dashboard Features

### 📊 Overview Dashboard
- Total screenings and flagged cases
- Active counsellors count
- Recent flagged cases
- Most common mental health issues

### 🚨 Flagged Cases Management
- View all students requiring attention
- Filter by risk level (Low, Moderate, High, Critical)
- Assign counsellors to cases
- Track case status and progress
- Anonymized student data for privacy

### 📈 Analytics & Trends
- Risk level distribution charts
- Department-wise breakdown
- Monthly trend analysis
- Key insights and recommendations

### 👥 Counsellor Management
- View all counsellors
- Track assigned cases per counsellor
- Monitor workload distribution

### 📚 Resource Management
- Upload psychoeducational content
- Manage videos, audio, guides
- Track engagement analytics
- Support for regional languages

### 💬 Feedback System
- Anonymous student feedback
- Sentiment analysis
- Category-wise feedback sorting
- Response management

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/forgot-password` - Password reset request
- `POST /api/admin/reset-password` - Reset password with token

### Dashboard
- `GET /api/admin/dashboard/overview` - Dashboard statistics
- `GET /api/admin/flagged-cases` - List flagged cases with filters
- `PATCH /api/admin/flagged-cases/:id/assign` - Assign counsellor to case

### Analytics
- `GET /api/admin/analytics` - Analytics data with period filter

### Resources
- `GET /api/admin/resources` - List all resources
- `POST /api/admin/resources` - Create new resource

### Counsellors
- `GET /api/admin/counsellors` - List all counsellors with case counts

### Feedback
- `GET /api/admin/feedback` - List all feedback with filters

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Session timeout (8 hours)

### Data Privacy
- Anonymized student identifiers
- No personally identifiable information exposed
- Secure API endpoints with token verification

### Access Levels
- **Super Admin**: Full system access
- **Counsellor**: Case management and student interaction
- **Department Admin**: Analytics and reporting
- **IQAC Admin**: Quality assurance and reporting

## Database Schema

### Admin Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: ['super_admin', 'counsellor', 'dept_admin', 'iqac_admin'],
  department: String,
  firstName: String,
  lastName: String,
  isActive: Boolean,
  permissions: [String],
  lastLogin: Date
}
```

### Flagged Cases Collection
```javascript
{
  studentId: String,
  anonymizedId: String,
  department: String,
  year: String,
  semester: String,
  riskLevel: ['low', 'moderate', 'high', 'critical'],
  flaggedFor: [String],
  screeningScores: {
    pss: Number,
    phq9: Number,
    gad7: Number,
    ghq: Number
  },
  assignedCounsellor: ObjectId,
  status: ['pending', 'assigned', 'in_progress', 'completed', 'escalated'],
  notes: String,
  followUpRequired: Boolean,
  nextFollowUpDate: Date
}
```

## Development Notes

### Student Interface Unchanged
The original student-facing interface remains completely unchanged. The admin system is a separate module that doesn't interfere with existing functionality.

### Responsive Design
The admin dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

### Color Scheme
Follows a calming, professional color palette:
- Primary: Green (#10B981)
- Warning: Yellow/Orange
- Danger: Red
- Background: Light gray/white

## Troubleshooting

### Common Issues

1. **Cannot connect to database**
   - Check MongoDB connection string
   - Ensure MongoDB service is running
   - Verify network connectivity

2. **Admin login fails**
   - Run the seeding script: `node seedAdminData.js`
   - Check if admin accounts were created
   - Verify JWT_SECRET is set in environment

3. **Charts not displaying**
   - Ensure recharts is installed: `npm install recharts`
   - Check browser console for errors

4. **API calls failing**
   - Verify backend server is running on port 3000
   - Check CORS configuration
   - Ensure admin token is valid

### Support
For technical support or questions about the admin system, contact the development team.

## Production Deployment

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backup
- [ ] Enable logging and monitoring
- [ ] Implement rate limiting
- [ ] Regular security audits

### Environment Configuration
```env
# Production Environment Variables
NODE_ENV=production
MONGO_URI=mongodb+srv://production-connection
JWT_SECRET=your-very-strong-production-secret
CORS_ORIGIN=https://your-production-domain.com
```

This admin dashboard provides institutional authorities with powerful tools to monitor student mental health, manage counselling resources, and ensure effective support delivery while maintaining strict privacy and security standards.