require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./src/utils/logger');
const PORT = process.env.PORT || 2000;

const startServer = async () => {
  try {
    logger.info('🚀 Starting iqembulamanzi-backend server...');
    
    // Connect to database first
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`✅ Server running on http://localhost:${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Using default local'}`);
      
      // Log available routes
      logger.info('📋 Available routes:');
      logger.info('  GET  / - Home page');
      logger.info('  POST /submit - User registration');
      logger.info('  POST /login - User login');
      logger.info('  GET  /users - Get users (protected)');
      logger.info('  POST /whatsapp - WhatsApp webhook');
      logger.info('  GET  /api/incidents - Get incidents (protected)');
      logger.info('  PUT  /api/incidents/:id - Update incident (protected)');
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err.message);
    logger.error('Full error:', err);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();