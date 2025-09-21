// Add this to your routes file or create a separate test route file

const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Test route to check MongoDB connection and user model
router.get('/test/mongodb', async (req, res) => {
    try {
        // Test basic connection
        const userCount = await User.countDocuments();
        
        res.json({
            success: true,
            message: 'MongoDB connection working!',
            totalUsers: userCount,
            timestamp: new Date(),
            databaseReady: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'MongoDB connection failed',
            error: error.message,
            timestamp: new Date()
        });
    }
});

// Test route to create a sample task (for debugging)
router.post('/test/create-task/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a sample task
        const sampleTask = {
            id: 'test-' + Date.now(),
            name: 'Sample Test Task',
            type: 'videos',
            category: 'Test',
            duration: '10 min',
            priority: 'medium',
            completed: false,
            createdAt: new Date()
        };

        if (!user.tasks) {
            user.tasks = [];
        }

        user.tasks.push(sampleTask);
        await user.save();

        res.json({
            success: true,
            message: 'Sample task created',
            task: sampleTask,
            totalTasks: user.tasks.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating sample task',
            error: error.message
        });
    }
});

// Test route to view user tasks
router.get('/test/user-tasks/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                totalTasks: user.tasks ? user.tasks.length : 0,
                tasks: user.tasks || []
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user tasks',
            error: error.message
        });
    }
});

module.exports = router;