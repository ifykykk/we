const mongoose = require('mongoose');
const FlaggedCase = require('./models/flaggedCase');
require('dotenv').config();

async function updateFlaggedCaseSchema() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Drop the existing validation on the flaggedFor field
        await mongoose.connection.db.command({
            collMod: 'flaggedcases',
            validator: {},
            validationLevel: 'off'
        });
        
        console.log('✅ Removed old validation rules');
        
        // The new schema will be applied automatically when the server restarts
        console.log('✅ Schema update complete. Restart the server now.');
        
        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        mongoose.disconnect();
    }
}

updateFlaggedCaseSchema();
