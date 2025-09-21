const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dotenv = require('dotenv');
const cors=require('cors');

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./config/firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://krishigrow-b07d4-default-rtdb.firebaseio.com"
});

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// console.log(process.env.MONGO_URI);
//Check server is running
app.get('/', (req, res) => {
    res.send('Server is up and running');
    }
);

// Firebase custom token endpoint
app.post('/auth/firebase-token', async (req, res) => {
    try {
        const { clerkId, email } = req.body;
        
        // Create a custom token for the user
        const customToken = await admin.auth().createCustomToken(clerkId, {
            email: email,
            clerkId: clerkId
        });
        
        res.json({ customToken });
    } catch (error) {
        console.error('Error creating custom token:', error);
        res.status(500).json({ error: 'Failed to create custom token' });
    }
});


//user Routes
app.use('/', require('./routes/userRoutes'));

//chat Routes
app.use('/', require('./routes/chatRoutes'));

//admin Routes
app.use('/api', require('./routes/adminRoutes'));

//booking Routes
app.use('/api', require('./routes/bookingRoutes'));

//tavus Routes
app.use('/', require('./routes/tavusRoutes'));

// Connect to MongoDB first, then start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server after MongoDB connection
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Could not connect to MongoDB:', err);
        process.exit(1);
    });