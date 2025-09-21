const express = require('express');
const { 
    createUser, 
    getUserByEmail, 
    updateDailyData, 
    updatePSSScore, 
    processScreeningResults,
    updateDailyTaskCompletions,
    getDailyTaskCompletions,
    // Add these new functions:
    createTask,
    getUserTasks,
    updateTask,
    deleteTask
} = require('../controllers/userController');

const router = express.Router();

// Existing routes...
router.post('/user/create', createUser);
router.post('/user/:email/daily-update', updateDailyData);
router.get('/user/:email', getUserByEmail);
router.post('/user/:email/pss', updatePSSScore);

// Task completion tracking (what you have)
router.post('/user/:email/task-completion', updateDailyTaskCompletions);
router.get('/user/:email/task-completion', getDailyTaskCompletions);

// NEW: Proper task CRUD operations
router.post('/user/:email/tasks', createTask);           // Create task
router.get('/user/:email/tasks', getUserTasks);          // Get all user tasks
router.put('/user/:email/tasks/:taskId', updateTask);    // Update task (including completion)
router.delete('/user/:email/tasks/:taskId', deleteTask); // Delete task

router.post('/api/submit-screening', processScreeningResults);

module.exports = router;