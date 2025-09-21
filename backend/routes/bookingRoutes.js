const express = require('express');
const jwt = require('jsonwebtoken');
const Booking = require('../models/booking');
const CounsellorProfile = require('../models/counsellorProfile');
const Admin = require('../models/admin');
const User = require('../models/user');
const verifyStudentToken = require('../middleware/verifyStudentToken');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware to verify admin token (reusing existing)
const verifyAdminToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId).select('-password');
        
        if (!admin || !admin.isActive) {
            return res.status(401).json({ error: 'Invalid token or inactive admin.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Middleware to verify Firebase token for students (reusing existing pattern)
const verifyStudentTokenLegacy = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ clerkId: decodedToken.uid });
        
        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// ==================== STUDENT BOOKING ROUTES ====================

// Get available counsellors for booking
router.get('/bookings/counsellors', verifyStudentToken, async (req, res) => {
    try {
        const { specialization, date } = req.query;
        
        let filter = { 
            role: 'counsellor', 
            isActive: true 
        };

        const counsellors = await Admin.find(filter)
            .select('firstName lastName email department')
            .sort({ firstName: 1 });

        // Get counsellor profiles
        const counsellorsWithProfiles = await Promise.all(
            counsellors.map(async (counsellor) => {
                const profile = await CounsellorProfile.findOne({ adminId: counsellor._id });
                
                // If date provided, check availability for that specific date
                let isAvailableOnDate = true;
                if (date && profile) {
                    const requestDate = new Date(date);
                    const dayName = requestDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    
                    const dayAvailability = profile.availability[dayName];
                    if (!dayAvailability || !dayAvailability.available) {
                        isAvailableOnDate = false;
                    } else {
                        // Check if counsellor already has maximum bookings for that date
                        const bookingsOnDate = await Booking.countDocuments({
                            counsellorId: counsellor._id,
                            appointmentDate: {
                                $gte: new Date(requestDate.setHours(0,0,0,0)),
                                $lt: new Date(requestDate.setHours(23,59,59,999))
                            },
                            status: { $in: ['pending', 'confirmed'] }
                        });
                        
                        if (bookingsOnDate >= dayAvailability.maxBookings) {
                            isAvailableOnDate = false;
                        }
                    }
                }
                
                return {
                    ...counsellor.toObject(),
                    profile: profile ? {
                        specializations: profile.specializations,
                        biography: profile.biography,
                        experience: profile.experience,
                        rating: profile.rating,
                        isAcceptingBookings: profile.isAcceptingBookings,
                        isAvailableOnDate
                    } : null
                };
            })
        );

        // Filter by specialization if provided
        let filteredCounsellors = counsellorsWithProfiles;
        if (specialization) {
            filteredCounsellors = counsellorsWithProfiles.filter(counsellor => 
                counsellor.profile && 
                counsellor.profile.specializations.includes(specialization)
            );
        }

        // Only return counsellors who are accepting bookings and have complete profiles
        const availableCounsellors = filteredCounsellors.filter(counsellor => 
            counsellor.profile && 
            counsellor.profile.isAcceptingBookings &&
            (!date || counsellor.profile.isAvailableOnDate)
        );

        res.json(availableCounsellors);
    } catch (error) {
        console.error('Get counsellors error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new booking
router.post('/bookings/create', verifyStudentToken, async (req, res) => {
    try {
        const {
            counsellorId,
            appointmentDate,
            appointmentTime,
            mode,
            reason,
            urgency,
            notes
        } = req.body;

        // Validate required fields
        if (!appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if counsellor exists and is active
        const counsellor = await Admin.findOne({ 
            _id: counsellorId, 
            role: 'counsellor', 
            isActive: true 
        });

        if (!counsellor) {
            return res.status(404).json({ error: 'Counsellor not found or not available' });
        }

        // Check counsellor profile and availability
        const profile = await CounsellorProfile.findOne({ adminId: counsellorId });
        if (!profile || !profile.isAcceptingBookings) {
            return res.status(400).json({ error: 'Counsellor is not accepting bookings currently' });
        }

        // Check date availability
        const requestDate = new Date(appointmentDate);
        const dayName = requestDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayAvailability = profile.availability[dayName];
        
        if (!dayAvailability || !dayAvailability.available) {
            return res.status(400).json({ error: 'Counsellor is not available on the selected date' });
        }

        // Check if counsellor already has maximum bookings for that date
        const bookingsOnDate = await Booking.countDocuments({
            counsellorId: counsellorId,
            appointmentDate: {
                $gte: new Date(requestDate.setHours(0,0,0,0)),
                $lt: new Date(requestDate.setHours(23,59,59,999))
            },
            status: { $in: ['pending', 'confirmed'] }
        });

        if (bookingsOnDate >= dayAvailability.maxBookings) {
            return res.status(400).json({ error: 'Counsellor is fully booked for the selected date' });
        }

        // Check if student already has a pending or confirmed booking with any counsellor
        const existingBooking = await Booking.findOne({
            studentId: req.user.clerkId,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(400).json({ 
                error: 'You already have a pending or confirmed appointment. Please wait for completion or cancellation.' 
            });
        }

        // Create new booking with anonymized student info
        const booking = new Booking({
            studentId: req.user.clerkId,
            studentInfo: {
                firstName: 'Anonymous',
                lastName: 'Student',
                email: 'anonymous@student.system',
                clerkId: req.user.clerkId
            },
            counsellorId: counsellorId,
            counsellorInfo: {
                firstName: counsellor.firstName,
                lastName: counsellor.lastName,
                email: counsellor.email,
                department: counsellor.department
            },
            appointmentDate: new Date(appointmentDate),
            appointmentTime,
            mode: mode || 'online',
            reason,
            urgency: urgency || 'medium',
            notes: notes || ''
        });

        await booking.save();

        res.status(201).json({
            message: 'Booking created successfully',
            booking: {
                ticketId: booking.ticketId,
                appointmentDate: booking.appointmentDate,
                appointmentTime: booking.appointmentTime,
                status: booking.status,
                counsellorName: `${counsellor.firstName} ${counsellor.lastName}`,
                mode: booking.mode
            }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get student's bookings
router.get('/bookings/my-bookings', verifyStudentToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ studentId: req.user.clerkId })
            .sort({ createdAt: -1 })
            .select('-studentInfo.clerkId -counsellorNotes');

        res.json(bookings);
    } catch (error) {
        console.error('Get student bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get booking details by ticket ID
router.get('/bookings/ticket/:ticketId', verifyStudentToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({ 
            ticketId: req.params.ticketId,
            studentId: req.user.clerkId 
        }).select('-studentInfo.clerkId -counsellorNotes');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get booking details error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel booking (student)
router.patch('/bookings/:bookingId/cancel', verifyStudentToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            studentId: req.user.clerkId,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== COUNSELLOR ROUTES ====================

// Get counsellor's pending bookings
router.get('/admin/counsellor/pending-bookings', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const bookings = await Booking.find({
            counsellorId: req.admin._id,
            status: 'pending'
        })
        .sort({ createdAt: -1 })
        .select('-studentInfo.clerkId -studentInfo.email -studentInfo.firstName -studentInfo.lastName');

        // Ensure complete anonymization for counsellor view
        const anonymizedBookings = bookings.map(booking => ({
            ...booking.toObject(),
            studentInfo: {
                firstName: 'Anonymous',
                lastName: 'Student',
                email: 'anonymous@student.system'
            }
        }));

        res.json(anonymizedBookings);
    } catch (error) {
        console.error('Get pending bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all counsellor's bookings
router.get('/admin/counsellor/my-bookings', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const { status, date } = req.query;
        let filter = { counsellorId: req.admin._id };
        
        if (status) filter.status = status;
        if (date) {
            const selectedDate = new Date(date);
            filter.appointmentDate = {
                $gte: new Date(selectedDate.setHours(0,0,0,0)),
                $lt: new Date(selectedDate.setHours(23,59,59,999))
            };
        }

        const bookings = await Booking.find(filter)
            .sort({ appointmentDate: -1, appointmentTime: 1 })
            .select('-studentInfo.clerkId -studentInfo.email -studentInfo.firstName -studentInfo.lastName');

        // Ensure complete anonymization for counsellor view
        const anonymizedBookings = bookings.map(booking => ({
            ...booking.toObject(),
            studentInfo: {
                firstName: 'Anonymous',
                lastName: 'Student',
                email: 'anonymous@student.system'
            }
        }));

        res.json(anonymizedBookings);
    } catch (error) {
        console.error('Get counsellor bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Confirm booking (counsellor)
router.patch('/admin/counsellor/booking/:bookingId/confirm', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const { counsellorNotes } = req.body;

        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            counsellorId: req.admin._id,
            status: 'pending'
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or already processed' });
        }

        booking.status = 'confirmed';
        booking.confirmedAt = new Date();
        if (counsellorNotes) {
            booking.counsellorNotes = counsellorNotes;
        }

        await booking.save();

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reject booking (counsellor)
router.patch('/admin/counsellor/booking/:bookingId/reject', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            counsellorId: req.admin._id,
            status: 'pending'
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or already processed' });
        }

        booking.status = 'rejected';
        booking.rejectedAt = new Date();
        booking.rejectionReason = rejectionReason;

        await booking.save();

        res.json({ message: 'Booking rejected successfully', booking });
    } catch (error) {
        console.error('Reject booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Complete booking (counsellor)
router.patch('/admin/counsellor/booking/:bookingId/complete', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const { counsellorNotes, followUpRequired, nextFollowUpDate } = req.body;

        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            counsellorId: req.admin._id,
            status: 'confirmed'
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or not confirmed' });
        }

        booking.status = 'completed';
        booking.completedAt = new Date();
        if (counsellorNotes) {
            booking.counsellorNotes = counsellorNotes;
        }
        if (followUpRequired !== undefined) {
            booking.followUpRequired = followUpRequired;
        }
        if (nextFollowUpDate) {
            booking.nextFollowUpDate = new Date(nextFollowUpDate);
        }

        await booking.save();

        // Get counsellor profile
router.get('/admin/counsellor/profile', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const profile = await CounsellorProfile.findOne({ adminId: req.admin._id });
        
        if (!profile) {
            // Return default profile structure if none exists
            return res.json(null);
        }

        res.json(profile);
    } catch (error) {
        console.error('Get counsellor profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update counsellor profile total sessions
        await CounsellorProfile.findOneAndUpdate(
            { adminId: req.admin._id },
            { $inc: { totalSessions: 1 } }
        );

        res.json({ message: 'Booking completed successfully', booking });
    } catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== COUNSELLOR PROFILE ROUTES ====================

// Get counsellor profile
router.get('/admin/counsellor/profile', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        let profile = await CounsellorProfile.findOne({ adminId: req.admin._id });
        
        if (!profile) {
            // Create default profile if doesn't exist
            profile = new CounsellorProfile({
                adminId: req.admin._id,
                specializations: [],
                qualifications: [],
                availability: {}
            });
            await profile.save();
        }

        res.json(profile);
    } catch (error) {
        console.error('Get counsellor profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update counsellor profile
router.put('/admin/counsellor/profile', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const profile = await CounsellorProfile.findOneAndUpdate(
            { adminId: req.admin._id },
            req.body,
            { new: true, upsert: true }
        );

        res.json(profile);
    } catch (error) {
        console.error('Update counsellor profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get all bookings (Super Admin & Dept Admin)
router.get('/admin/bookings/all', verifyAdminToken, async (req, res) => {
    try {
        if (!['super_admin', 'dept_admin'].includes(req.admin.role)) {
            return res.status(403).json({ error: 'Access denied. Admin access required.' });
        }

        const { page = 1, limit = 20, status, counsellorId, date, urgency } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (counsellorId) filter.counsellorId = counsellorId;
        if (urgency) filter.urgency = urgency;
        if (date) {
            const selectedDate = new Date(date);
            filter.appointmentDate = {
                $gte: new Date(selectedDate.setHours(0,0,0,0)),
                $lt: new Date(selectedDate.setHours(23,59,59,999))
            };
        }

        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-studentInfo.clerkId -studentInfo.email -studentInfo.firstName -studentInfo.lastName');

        // Ensure complete anonymization for admin view
        const anonymizedBookings = bookings.map(booking => ({
            ...booking.toObject(),
            studentInfo: {
                firstName: 'Anonymous',
                lastName: 'Student',
                email: 'anonymous@student.system'
            }
        }));

        const total = await Booking.countDocuments(filter);

        res.json({
            bookings: anonymizedBookings,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get booking statistics
router.get('/admin/bookings/statistics', verifyAdminToken, async (req, res) => {
    try {
        if (!['super_admin', 'dept_admin'].includes(req.admin.role)) {
            return res.status(403).json({ error: 'Access denied. Admin access required.' });
        }

        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });

        // Monthly trends
        const monthlyStats = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Urgency distribution
        const urgencyStats = await Booking.aggregate([
            { $group: { _id: '$urgency', count: { $sum: 1 } } }
        ]);

        // Counsellor performance
        const counsellorStats = await Booking.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$counsellorId',
                    completedSessions: { $sum: 1 },
                    counsellorInfo: { $first: '$counsellorInfo' }
                }
            },
            { $sort: { completedSessions: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            total: totalBookings,
            pending: pendingBookings,
            confirmed: confirmedBookings,
            completed: completedBookings,
            rejected: rejectedBookings,
            monthlyTrends: monthlyStats,
            urgencyDistribution: urgencyStats,
            topCounsellors: counsellorStats
        });
    } catch (error) {
        console.error('Get booking statistics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auto-assign counsellor role based on email domain
router.post('/admin/auto-assign-counsellor', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({ error: 'Access denied. Super admin only.' });
        }

        const { email } = req.body;

        // Check email domain rule
        if (!email.includes('dr.') || !email.endsWith('@institution.edu')) {
            return res.status(400).json({ error: 'Email does not match counsellor criteria' });
        }

        // Find admin and update role
        const admin = await Admin.findOneAndUpdate(
            { email: email.toLowerCase() },
            { role: 'counsellor' },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.json({ message: 'Counsellor role assigned successfully', admin });
    } catch (error) {
        console.error('Auto-assign counsellor error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get counsellor profile
router.get('/admin/counsellor/profile', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const profile = await CounsellorProfile.findOne({ adminId: req.admin._id });
        
        if (!profile) {
            return res.json(null);
        }

        res.json(profile);
    } catch (error) {
        console.error('Get counsellor profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update counsellor profile
router.put('/admin/counsellor/profile', verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== 'counsellor') {
            return res.status(403).json({ error: 'Access denied. Counsellors only.' });
        }

        const profileData = {
            ...req.body,
            isProfileComplete: true,
            lastUpdated: new Date()
        };

        const profile = await CounsellorProfile.findOneAndUpdate(
            { adminId: req.admin._id },
            profileData,
            { new: true, upsert: true }
        );

        res.json(profile);
    } catch (error) {
        console.error('Update counsellor profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;