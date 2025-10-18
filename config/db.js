const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

const connectDB = async (app) => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqembulamanzi';
  
  // Connection options for better performance and reliability
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
    serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
  };

  // Log connection attempt (masked credentials)
  const maskedURI = mongoURI.replace(/\/\/.*@/, '//***:***@');
  logger.info(`Attempting connection to MongoDB: ${maskedURI}`);

  try {
    await mongoose.connect(mongoURI, options);
    
    // Connection successful
    logger.info('✅ Successfully connected to MongoDB');
    logger.info(`Database name: ${mongoose.connection.name}`);
    logger.info(`Host: ${mongoose.connection.host}`);
    logger.info(`Port: ${mongoose.connection.port}`);
    logger.info(`Connection readyState: ${mongoose.connection.readyState}`);
    
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Initialize database indexes
    await initializeIndexes();
    
    return mongoose.connection;
  } catch (err) {
    logger.error('❌ MongoDB connection failed:', err.message);
    logger.error('Full error:', err);
    
    // Don't exit immediately, try to reconnect
    setTimeout(() => {
      logger.info('Attempting to reconnect to MongoDB...');
      connectDB(app);
    }, 5000);
    
    throw err;
  }
};

// Initialize database indexes for better performance
const initializeIndexes = async () => {
  try {
    logger.info('Initializing database indexes...');
    
    // User model indexes
    const User = mongoose.model('Users');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ userId: 1 }, { unique: true });
    await User.collection.createIndex({ location: '2dsphere' });
    await User.collection.createIndex({ role: 1 });
    
    // Incident model indexes
    const Incident = mongoose.model('Incident');
    await Incident.collection.createIndex({ location: '2dsphere' });
    await Incident.collection.createIndex({ status: 1 });
    await Incident.collection.createIndex({ priority: 1 });
    await Incident.collection.createIndex({ createdAt: -1 });
    await Incident.collection.createIndex({ 'reporters.phone': 1 });
    
    logger.info('✅ Database indexes initialized successfully');
  } catch (err) {
    logger.error('Error initializing indexes:', err);
    // Don't throw error, indexes are not critical for basic functionality
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database connection...');
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB, initializeIndexes };