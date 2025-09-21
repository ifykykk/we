const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Admin = require('../models/admin');
const FlaggedCase = require('../models/flaggedCase');
const Resource = require('../models/resource');
const Feedback = require('../models/feedback');
const User = require('../models/user');

const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware to verify admin token
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

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({ error: 'Account is deactivated. Please contact administrator.' });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, role: admin.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                department: admin.department,
                firstName: admin.firstName,
                lastName: admin.lastName,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Forgot Password
router.post('/admin/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        await admin.save();

        // In a real application, you would send an email here
        // For now, we'll just return the token (remove in production)
        res.json({ 
            message: 'Reset token generated',
            resetToken // Remove this in production
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password
router.post('/admin/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        admin.password = newPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        
        await admin.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Dashboard Overview
router.get('/admin/dashboard/overview', verifyAdminToken, async (req, res) => {
    try {
        console.log('📋 Admin dashboard overview requested');
        
        // Get total screenings (users with ANY assessment history OR PSS scores)
        const totalScreenings = await User.countDocuments({
            $or: [
                { 'pssScore.0': { $exists: true } },
                { 'assessmentHistory.0': { $exists: true } }
            ]
        });
        console.log('📊 Total screenings found:', totalScreenings);
        
        // Get flagged cases count
        const flaggedCases = await FlaggedCase.countDocuments();
        console.log('🚩 Total flagged cases:', flaggedCases);
        
        // Get active counsellors count
        const activeCounsellors = await Admin.countDocuments({ 
            role: 'counsellor', 
            isActive: true 
        });
        console.log('👥 Active counsellors:', activeCounsellors);
        
        // Get total resources
        const totalResources = await Resource.countDocuments({ isActive: true });
        console.log('📚 Total resources:', totalResources);
        
        // Get recent flagged cases (anonymized)
        const recentCases = await FlaggedCase.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('assignedCounsellor', 'firstName lastName')
            .select('-studentId'); // Remove PII
        
        console.log('🕜 Recent cases found:', recentCases.length);

        // Get most common issues
        const commonIssues = await FlaggedCase.aggregate([
            { $unwind: '$flaggedFor' },
            { $group: { _id: '$flaggedFor', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        console.log('📈 Common issues:', commonIssues);

        const responseData = {
            overview: {
                totalScreenings,
                flaggedCases,
                activeCounsellors,
                totalResources
            },
            recentCases,
            commonIssues
        };
        
        console.log('📤 Sending response:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('❌ Dashboard overview error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Flagged Cases
router.get('/admin/flagged-cases', verifyAdminToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, riskLevel, status, department } = req.query;
        
        let filter = {};
        if (riskLevel) filter.riskLevel = riskLevel;
        if (status) filter.status = status;
        if (department) filter.department = department;

        const cases = await FlaggedCase.find(filter)
            .populate('assignedCounsellor', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-studentId'); // Remove PII

        const total = await FlaggedCase.countDocuments(filter);

        res.json({
            cases,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Flagged cases error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Assign Counsellor to Case
router.patch('/admin/flagged-cases/:caseId/assign', verifyAdminToken, async (req, res) => {
    try {
        const { counsellorId } = req.body;
        
        const flaggedCase = await FlaggedCase.findByIdAndUpdate(
            req.params.caseId,
            { 
                assignedCounsellor: counsellorId,
                status: 'assigned',
                nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            },
            { new: true }
        ).populate('assignedCounsellor', 'firstName lastName');

        res.json(flaggedCase);
    } catch (error) {
        console.error('Assign counsellor error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Analytics Data
router.get('/admin/analytics', verifyAdminToken, async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        switch (period) {
            case '7d':
                dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case '30d':
                dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
                break;
            case '90d':
                dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
                break;
        }

        // Risk level distribution
        const riskDistribution = await FlaggedCase.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);

        // Department-wise breakdown
        const departmentBreakdown = await FlaggedCase.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Monthly trends
        const monthlyTrends = await FlaggedCase.aggregate([
            { $match: dateFilter },
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

        res.json({
            riskDistribution,
            departmentBreakdown,
            monthlyTrends
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Counsellors
router.get('/admin/counsellors', verifyAdminToken, async (req, res) => {
    try {
        const counsellors = await Admin.find({ role: 'counsellor' })
            .select('-password')
            .sort({ firstName: 1 });

        // Get assigned cases count for each counsellor
        const counsellorsWithCases = await Promise.all(
            counsellors.map(async (counsellor) => {
                const assignedCases = await FlaggedCase.countDocuments({
                    assignedCounsellor: counsellor._id,
                    status: { $in: ['assigned', 'in_progress'] }
                });
                
                return {
                    ...counsellor.toObject(),
                    assignedCases
                };
            })
        );

        res.json(counsellorsWithCases);
    } catch (error) {
        console.error('Get counsellors error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Resources
router.get('/admin/resources', verifyAdminToken, async (req, res) => {
    try {
        const { category, type, language } = req.query;
        
        let filter = { isActive: true };
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (language) filter.language = language;

        const resources = await Resource.find(filter)
            .populate('uploadedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create New Resource
router.post('/admin/resources', verifyAdminToken, async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            uploadedBy: req.admin._id
        };

        const resource = new Resource(resourceData);
        await resource.save();

        res.status(201).json(resource);
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Feedback
router.get('/admin/feedback', verifyAdminToken, async (req, res) => {
    try {
        const { category, sentiment, status } = req.query;
        
        let filter = {};
        if (category) filter.category = category;
        if (sentiment) filter.sentiment = sentiment;
        if (status) filter.status = status;

        const feedback = await Feedback.find(filter)
            .populate('reviewedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
