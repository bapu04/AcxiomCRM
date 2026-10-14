import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeds/seed.js';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Automatically ensure default accounts and sample data exist
    await seedDatabase();

    // 3. Start listening
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 AcxiomCRM Backend Server Running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Authentication: http://localhost:${PORT}/api/auth/login`);
      console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
      console.log(`💼 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server.');
      server.close(() => {
        console.log('HTTP server closed.');
      });
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
