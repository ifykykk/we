const admin = require('firebase-admin');
const User = require('../models/user');

const verifyStudentToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Verifying token...', token.substring(0, 20) + '...');
        
        // Try Firebase token first
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = await User.findOne({ clerkId: decodedToken.uid });
            
            if (!user) {
                console.log('Firebase token valid but user not found');
                return res.status(401).json({ error: 'User not found.' });
            }

            console.log('Firebase auth successful for user:', user.email);
            req.user = user;
            return next();
        } catch (firebaseError) {
            console.log('Firebase token failed, trying simple token...', firebaseError.message);
        }

        // Try simple token as fallback
        try {
            const tokenData = JSON.parse(atob(token));
            console.log('Parsed token data:', { userId: tokenData.userId, email: tokenData.email });
            
            // Check if token is not too old (24 hours)
            if (Date.now() - tokenData.timestamp > 24 * 60 * 60 * 1000) {
                return res.status(401).json({ error: 'Token expired.' });
            }

            // Find user by Clerk ID
            let user = await User.findOne({ clerkId: tokenData.userId });
            
            // If user doesn't exist, create one
            if (!user) {
                console.log('Creating new user:', tokenData.email);
                user = new User({
                    clerkId: tokenData.userId,
                    email: tokenData.email,
                    firstName: tokenData.firstName,
                    lastName: tokenData.lastName
                });
                await user.save();
                console.log('User created successfully');
            } else {
                console.log('Found existing user:', user.email);
            }

            req.user = user;
            return next();
        } catch (simpleTokenError) {
            console.log('Simple token also failed:', simpleTokenError.message);
            return res.status(401).json({ error: 'Invalid token.' });
        }

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'Authentication server error.' });
    }
};

module.exports = verifyStudentToken;