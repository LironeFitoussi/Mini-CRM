const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { syncRouter, initializeSyncServices } = require('../sync/simpleSyncCron');

// Load environment variables
dotenv.config();

// Example of how to integrate the sync functionality into your Express server
async function setupServer() {
    const app = express();

    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Connect to MongoDB
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }

    // Mount the sync routes
    app.use('/api/sync', syncRouter);
    console.log('✅ Sync routes mounted at /api/sync');

    // Add a simple health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    });

    // Initialize sync services on server startup
    try {
        await initializeSyncServices();
        console.log('✅ Sync services initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize sync services:', error);
    }

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`Trigger sync: POST http://localhost:${PORT}/api/sync/trigger`);
        console.log(`Sync status: GET http://localhost:${PORT}/api/sync/status`);
    });
}

// Run the server
if (require.main === module) {
    setupServer().catch(console.error);
}

module.exports = { setupServer }; 