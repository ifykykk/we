const User = require('../models/user');
const FlaggedCase = require('../models/flaggedCase');
const crypto = require('crypto');

const createUser = async (req, res) => {
    try {
        const { clerkId, email,age,gender } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        
        if (user) {
            // Update existing user
            user = await User.findOneAndUpdate(
                { email },
                { 
                    ...req.body,
                    age,
                    gender
                },
                { new: true }
            );
        } else {
            // Create new user
            user = new User({
                ...req.body,
                sleepDuration: [],
                waterIntake: [],
                meditationDuration: [],
                physicalActivity: [],
                pssScore: [],
                dailyTaskCompletions: [],
                tasks: [],  // Initialize tasks array
                assessmentHistory: []
            });
            await user.save();
        }
        console.log(user);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDailyData = async (req, res) => {
    try {
        const { email } = req.params;
        const { waterIntake, sleepHours, meditationMinutes, physicalActivityMinutes } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add new data to arrays
        user.waterIntake.push({ value: waterIntake, date: new Date() });
        user.sleepDuration.push({ value: sleepHours, date: new Date() });
        user.meditationDuration.push({ value: meditationMinutes, date: new Date() });
        user.physicalActivity.push({ value: physicalActivityMinutes, date: new Date() });

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePSSScore = async (req, res) => {
    try {
        const { email } = req.params;
        const { score } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.pssScore.push({ value: score, date: new Date() });
        await user.save();
        
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateDailyTaskCompletions = async (req, res) => {
    try {
        const { email } = req.params;
        const { completedTasks, totalTasks } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's already an entry for today
        const todayIndex = user.dailyTaskCompletions.findIndex(
            completion => completion.date.toISOString().split('T')[0] === today
        );

        if (todayIndex !== -1) {
            // Update existing entry
            user.dailyTaskCompletions[todayIndex].completedTasks = completedTasks;
            user.dailyTaskCompletions[todayIndex].totalTasks = totalTasks;
        } else {
            // Create new entry for today
            user.dailyTaskCompletions.push({
                date: new Date(),
                completedTasks,
                totalTasks
            });
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getDailyTaskCompletions = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ dailyTaskCompletions: user.dailyTaskCompletions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to generate anonymized ID
function generateAnonymizedId(userId) {
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    const shortHash = hash.substring(0, 8);
    const year = new Date().getFullYear();
    return `STU-${year}-${shortHash.toUpperCase()}`;
}

// Function to calculate risk level for individual assessments
function calculateIndividualRiskLevel(screeningType, score) {
    switch (screeningType) {
        case 'gad7':
            if (score >= 15) return 'critical';
            if (score >= 10) return 'moderate';
            return 'low';
        
        case 'phq9':
            if (score >= 20) return 'critical';
            if (score >= 10) return 'moderate';
            return 'low';
        
        case 'ghq12':
            if (score >= 26) return 'critical';
            if (score >= 13) return 'moderate';
            return 'low';
        
        default:
            return 'low';
    }
}

// Function to calculate risk level for comprehensive screening (legacy)
function calculateRiskLevel(scores) {
    const { pss, phq9, gad7, ghq } = scores;
    
    let riskScore = 0;
    
    if (pss >= 27) riskScore += 3;
    else if (pss >= 21) riskScore += 2;
    else if (pss >= 14) riskScore += 1;
    
    if (phq9 >= 15) riskScore += 3;
    else if (phq9 >= 10) riskScore += 2;
    else if (phq9 >= 5) riskScore += 1;
    
    if (gad7 >= 15) riskScore += 3;
    else if (gad7 >= 10) riskScore += 2;
    else if (gad7 >= 5) riskScore += 1;
    
    if (riskScore >= 7) return 'critical';
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'moderate';
    return 'low';
}

// Function to determine flagged issues for individual assessments
function determineIndividualFlaggedIssues(screeningType, score) {
    const issues = [];
    
    switch (screeningType) {
        case 'gad7':
            if (score >= 10) issues.push('anxiety');
            break;
        case 'phq9':
            if (score >= 10) issues.push('depression');
            // For severe cases, we can add additional flags
            if (score >= 20) issues.push('burnout'); // Using existing enum value
            break;
        case 'ghq12':
            if (score >= 13) issues.push('stress'); // Map to existing 'stress'
            if (score >= 26) issues.push('burnout'); // Map to existing 'burnout'
            break;
    }
    
    return issues;
}

// Function to determine flagged issues for comprehensive screening (legacy)
function determineFlaggedIssues(scores) {
    const issues = [];
    const { pss, phq9, gad7 } = scores;
    
    if (phq9 >= 10) issues.push('depression');
    if (gad7 >= 10) issues.push('anxiety');
    if (pss >= 21) issues.push('stress');
    if (phq9 >= 15 && gad7 >= 15) issues.push('burnout');
    
    return issues;
}

// Process screening results (both individual and comprehensive)
const processScreeningResults = async (req, res) => {
    try {
        console.log('🔍 Processing screening results:', req.body);
        const { userId, screeningType, scores, userProfile } = req.body;
        
        // Find user by clerkId or email
        let user = await User.findOne({ 
            $or: [{ clerkId: userId }, { email: userId }] 
        });
        
        console.log('👤 Found user:', user ? user.email : 'Not found');
        
        // If user not found, create a minimal user record for testing
        if (!user) {
            console.log('🔧 Creating minimal user record for assessment');
            user = new User({
                clerkId: userId,
                firstName: 'Test',
                lastName: 'User',
                email: userId.includes('@') ? userId : `${userId}@test.com`,
                age: 25,
                gender: 'other',
                sleepDuration: [],
                waterIntake: [],
                meditationDuration: [],
                physicalActivity: [],
                pssScore: [],
                assessmentHistory: [],
                dailyTaskCompletions: [],
                tasks: []
            });
            await user.save();
            console.log('✅ Minimal user created for assessment');
        }
        
        let riskLevel, flaggedIssues;
        
        // Handle individual assessments (new system)
        if (['gad7', 'phq9', 'ghq12'].includes(screeningType)) {
            console.log('📋 Processing individual assessment:', screeningType);
            
            // Get the individual score
            const individualScore = scores[screeningType];
            console.log('📊 Individual score:', { [screeningType]: individualScore });
            
            // Calculate risk level for this specific assessment
            riskLevel = calculateIndividualRiskLevel(screeningType, individualScore);
            flaggedIssues = determineIndividualFlaggedIssues(screeningType, individualScore);
            
            // Update user's assessment history
            if (!user.assessmentHistory) {
                user.assessmentHistory = [];
            }
            
            user.assessmentHistory.push({
                type: screeningType,
                score: individualScore,
                riskLevel: riskLevel,
                date: new Date()
            });
            
            console.log('📊 Individual risk assessment:', { screeningType, individualScore, riskLevel, flaggedIssues });
            
        } else if (screeningType === 'comprehensive') {
            // Handle comprehensive screening (legacy system)
            console.log('📋 Processing comprehensive assessment');
            
            // Update user's screening scores
            if (scores.pss !== undefined) {
                user.pssScore.push({ value: scores.pss, date: new Date() });
            }
            
            // Calculate risk level using comprehensive logic
            riskLevel = calculateRiskLevel(scores);
            flaggedIssues = determineFlaggedIssues(scores);
            
            console.log('📊 Comprehensive risk assessment:', { riskLevel, flaggedIssues, scores });
        }
        
        await user.save();
        console.log('✅ User assessment data updated');
        
        // Only create flagged case if risk level is moderate or above
        if (riskLevel === 'moderate' || riskLevel === 'critical') {
            const anonymizedId = generateAnonymizedId(user.clerkId || user.email);
            
            console.log('🏷️ Generated anonymized ID:', anonymizedId);
            
            // Check if flagged case already exists for this user
            let flaggedCase = await FlaggedCase.findOne({ studentId: user.clerkId || user.email });
            
            const currentScores = {
                ...scores,
                assessmentType: screeningType
            };
            
            if (flaggedCase) {
                console.log('📝 Updating existing flagged case');
                
                // Update the highest risk level if this assessment is worse
                const currentRiskPriority = { 'low': 0, 'moderate': 1, 'high': 2, 'critical': 3 };
                if (currentRiskPriority[riskLevel] > currentRiskPriority[flaggedCase.riskLevel]) {
                    flaggedCase.riskLevel = riskLevel;
                }
                
                // Merge flagged issues
                flaggedCase.flaggedFor = [...new Set([...flaggedCase.flaggedFor, ...flaggedIssues])];
                
                // Update screening scores
                flaggedCase.screeningScores = {
                    ...flaggedCase.screeningScores,
                    ...currentScores
                };
                
                flaggedCase.status = 'pending'; // Reset to pending for new screening
                flaggedCase.updatedAt = new Date();
                
            } else {
                console.log('🆕 Creating new flagged case');
                
                // Create new flagged case
                flaggedCase = new FlaggedCase({
                    studentId: user.clerkId || user.email,
                    anonymizedId,
                    department: userProfile?.department || 'Computer Science',
                    year: userProfile?.year || '3',
                    semester: userProfile?.semester || '6',
                    riskLevel,
                    flaggedFor: flaggedIssues,
                    screeningScores: currentScores,
                    status: 'pending',
                    followUpRequired: true
                });
            }
            
            await flaggedCase.save();
            console.log('💾 Flagged case saved:', flaggedCase._id);
            
        } else {
            console.log('✅ Low risk - no flagged case created');
        }
        
        res.json({ 
            success: true, 
            riskLevel,
            flaggedIssues,
            message: `${screeningType} assessment processed successfully`
        });
        
    } catch (error) {
        console.error('❌ Error processing screening:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// TASK MANAGEMENT FUNCTIONS
const createTask = async (req, res) => {
    try {
        const { email } = req.params;
        const taskData = req.body;
        
        console.log('➕ Creating task for:', email, 'Task data:', taskData);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a consistent string ID
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTask = {
            id: taskId,
            ...taskData,
            completed: false,
            createdAt: new Date()
        };
        
        console.log('🆕 Generated task:', newTask);
        
        // Initialize tasks array if it doesn't exist
        if (!user.tasks) {
            user.tasks = [];
        }
        
        user.tasks.push(newTask);
        
        // Mark the tasks array as modified for Mongoose
        user.markModified('tasks');
        
        await user.save();

        // Update daily completion count
        await updateDailyCompletionCount(user);

        console.log('✅ Task created successfully with ID:', taskId);
        res.status(201).json(newTask);
        
    } catch (error) {
        console.error('❌ Error creating task:', error);
        res.status(400).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getUserTasks = async (req, res) => {
    try {
        const { email } = req.params;
        console.log('Fetching tasks for user:', email);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Initialize tasks if doesn't exist
        if (!user.tasks) {
            user.tasks = [];
            await user.save();
        }
        
        // Organize tasks by type
        const tasksByType = {
            videos: user.tasks.filter(task => task.type === 'videos') || [],
            blogs: user.tasks.filter(task => task.type === 'blogs') || [],
            books: user.tasks.filter(task => task.type === 'books') || [],
            podcasts: user.tasks.filter(task => task.type === 'podcasts') || []
        };
        
        console.log('✅ Tasks fetched:', {
            videos: tasksByType.videos.length,
            blogs: tasksByType.blogs.length,
            books: tasksByType.books.length,
            podcasts: tasksByType.podcasts.length
        });
        
        res.status(200).json(tasksByType);
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { email, taskId } = req.params;
        const updates = req.body;
        
        console.log('🔧 Updating task:', taskId, 'for user:', email);
        console.log('📝 Updates to apply:', updates);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.tasks || user.tasks.length === 0) {
            console.log('❌ No tasks found for user:', email);
            return res.status(404).json({ message: 'No tasks found for user' });
        }

        console.log('🔍 Looking for task in', user.tasks.length, 'tasks');
        console.log('🎯 Task IDs:', user.tasks.map(t => ({ id: t.id, type: typeof t.id })));
        
        const taskIndex = user.tasks.findIndex(task => {
            console.log('🔍 Comparing:', task.id, '(type:', typeof task.id, ') with', taskId, '(type:', typeof taskId, ')');
            return task.id === taskId || task.id === String(taskId) || String(task.id) === String(taskId);
        });
        
        console.log('📍 Task index found:', taskIndex);
        
        if (taskIndex === -1) {
            console.log('❌ Task not found. Available task IDs:', user.tasks.map(t => t.id));
            return res.status(404).json({ 
                message: 'Task not found',
                availableTaskIds: user.tasks.map(t => t.id),
                searchingFor: taskId
            });
        }

        const currentTask = user.tasks[taskIndex];
        console.log('📋 Current task before update:', currentTask);

        // Update the task directly in the array
        const updatedTaskData = {
            ...currentTask.toObject ? currentTask.toObject() : currentTask,
            ...updates,
            // Ensure completed is properly converted to boolean
            completed: updates.hasOwnProperty('completed') ? Boolean(updates.completed) : currentTask.completed,
            // Keep the original ID and creation date
            id: currentTask.id,
            createdAt: currentTask.createdAt
        };

        // Replace the task in the array
        user.tasks[taskIndex] = updatedTaskData;
        
        // Mark the tasks array as modified for Mongoose
        user.markModified('tasks');
        
        await user.save();
        console.log('✅ Task updated and saved successfully');

        // Update daily completion count
        await updateDailyCompletionCount(user);

        const responseTask = user.tasks[taskIndex];
        console.log('📤 Returning updated task:', responseTask);
        
        res.status(200).json(responseTask);
        
    } catch (error) {
        console.error('❌ Error updating task:', error);
        res.status(400).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { email, taskId } = req.params;
        
        console.log('🗑️ Deleting task:', taskId, 'for user:', email);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.tasks || user.tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for user' });
        }

        const initialLength = user.tasks.length;
        console.log('🔍 Before deletion - total tasks:', initialLength);
        
        // Filter out the task with flexible ID matching
        user.tasks = user.tasks.filter(task => {
            const match = task.id !== taskId && task.id !== String(taskId) && String(task.id) !== String(taskId);
            if (!match) console.log('🎯 Found task to delete:', task.id);
            return match;
        });
        
        console.log('📊 After deletion - total tasks:', user.tasks.length);
        
        if (user.tasks.length === initialLength) {
            console.log('❌ Task not found for deletion. Available IDs:', user.tasks.map(t => t.id));
            return res.status(404).json({ 
                message: 'Task not found',
                availableTaskIds: user.tasks.map(t => t.id),
                searchingFor: taskId
            });
        }

        // Mark the tasks array as modified for Mongoose
        user.markModified('tasks');
        
        await user.save();

        // Update daily completion count
        await updateDailyCompletionCount(user);

        console.log('✅ Task deleted successfully:', taskId);
        res.status(200).json({ message: 'Task deleted successfully' });
        
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        res.status(400).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Helper function to update daily completion count
const updateDailyCompletionCount = async (user) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const totalTasks = user.tasks ? user.tasks.length : 0;
        const completedTasks = user.tasks ? user.tasks.filter(task => task.completed === true).length : 0;

        console.log('📊 Updating daily completion count:', { totalTasks, completedTasks });

        // Initialize dailyTaskCompletions if it doesn't exist
        if (!user.dailyTaskCompletions) {
            user.dailyTaskCompletions = [];
        }

        const todayIndex = user.dailyTaskCompletions.findIndex(
            completion => completion.date.toISOString().split('T')[0] === today
        );

        if (todayIndex !== -1) {
            user.dailyTaskCompletions[todayIndex].completedTasks = completedTasks;
            user.dailyTaskCompletions[todayIndex].totalTasks = totalTasks;
        } else {
            user.dailyTaskCompletions.push({
                date: new Date(),
                completedTasks,
                totalTasks
            });
        }

        await user.save();
        console.log('✅ Daily completion count updated');
    } catch (error) {
        console.error('❌ Error updating daily completion count:', error);
    }
};

// Export all functions
module.exports = {
    createUser,
    getUserByEmail,
    updateDailyData,
    updatePSSScore,
    processScreeningResults,
    updateDailyTaskCompletions,
    getDailyTaskCompletions,
    createTask,
    getUserTasks,
    updateTask,
    deleteTask
};
