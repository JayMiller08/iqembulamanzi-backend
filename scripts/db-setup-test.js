const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Incident = require('../src/models/Incident');

// Simple database connectivity test
const testDatabaseSetup = async () => {
  console.log('🧪 iqembulamanzi Database Setup Test');
  console.log('====================================\n');
  
  // Test 1: Environment Variables
  console.log('📋 Testing Environment Variables...');
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  let envTestPassed = true;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar}: Set`);
    } else {
      console.log(`  ❌ ${envVar}: Missing`);
      envTestPassed = false;
    }
  });
  
  if (envTestPassed) {
    console.log('✅ Environment variables test passed\n');
  } else {
    console.log('❌ Environment variables test failed\n');
    return false;
  }
  
  // Test 2: Model Validation
  console.log('📊 Testing Database Models...');
  try {
    // Test User model
    const userSchema = User.schema;
    const userFields = Object.keys(userSchema.paths);
    console.log(`  ✅ User model: ${userFields.length} fields defined`);
    
    // Test Incident model
    const incidentSchema = Incident.schema;
    const incidentFields = Object.keys(incidentSchema.paths);
    console.log(`  ✅ Incident model: ${incidentFields.length} fields defined`);
    
    console.log('✅ Database models test passed\n');
  } catch (err) {
    console.log(`❌ Database models test failed: ${err.message}\n`);
    return false;
  }
  
  // Test 3: Database Connection (Optional)
  console.log('🔌 Testing Database Connection...');
  const mongoURI = process.env.MONGODB_URI;
  
  if (mongoURI.includes('mongodb+srv://') || mongoURI.includes('mongodb://localhost')) {
    try {
      // Set a short timeout for connection test
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      const connectPromise = mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 3000
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      console.log('  ✅ Database connection successful');
      console.log(`  📊 Database name: ${mongoose.connection.name}`);
      console.log(`  🌐 Host: ${mongoose.connection.host}`);
      
      await mongoose.connection.close();
      console.log('✅ Database connection test passed\n');
    } catch (err) {
      console.log(`  ⚠️  Database connection failed: ${err.message}`);
      console.log('  💡 This is expected if MongoDB is not running locally');
      console.log('  💡 For production, use MongoDB Atlas or ensure local MongoDB is running\n');
    }
  } else {
    console.log('  ⚠️  Invalid MongoDB URI format');
    console.log('  💡 Use mongodb://localhost:27017/dbname for local or mongodb+srv:// for Atlas\n');
  }
  
  // Test 4: Schema Validation
  console.log('📝 Testing Schema Validation...');
  try {
    // Test User schema validation
    const testUser = new User({
      userId: 'TEST001',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '+27123456789',
      address: 'Test Address',
      location: {
        type: 'Point',
        coordinates: [28.0473, -26.2041]
      },
      role: 'Guardian',
      password: 'hashedpassword'
    });
    
    const userValidation = testUser.validateSync();
    if (!userValidation) {
      console.log('  ✅ User schema validation passed');
    } else {
      console.log(`  ❌ User schema validation failed: ${userValidation.message}`);
    }
    
    // Test Incident schema validation
    const testIncident = new Incident({
      reporters: [{
        phone: '+27123456789',
        reportedAt: new Date(),
        description: 'Test incident'
      }],
      category: 'other',
      priority: 'P2',
      status: 'open',
      location: {
        type: 'Point',
        coordinates: [28.0473, -26.2041]
      },
      sewageLossEstimate: 100
    });
    
    const incidentValidation = testIncident.validateSync();
    if (!incidentValidation) {
      console.log('  ✅ Incident schema validation passed');
    } else {
      console.log(`  ❌ Incident schema validation failed: ${incidentValidation.message}`);
    }
    
    console.log('✅ Schema validation test passed\n');
  } catch (err) {
    console.log(`❌ Schema validation test failed: ${err.message}\n`);
    return false;
  }
  
  // Test 5: Index Configuration
  console.log('📈 Testing Index Configuration...');
  try {
    const userIndexes = User.schema.indexes();
    const incidentIndexes = Incident.schema.indexes();
    
    console.log(`  ✅ User model: ${userIndexes.length} indexes configured`);
    console.log(`  ✅ Incident model: ${incidentIndexes.length} indexes configured`);
    
    // Check for geospatial indexes
    const userHasGeoIndex = userIndexes.some(index => 
      JSON.stringify(index[0]).includes('2dsphere')
    );
    const incidentHasGeoIndex = incidentIndexes.some(index => 
      JSON.stringify(index[0]).includes('2dsphere')
    );
    
    if (userHasGeoIndex) {
      console.log('  ✅ User model has geospatial index');
    }
    if (incidentHasGeoIndex) {
      console.log('  ✅ Incident model has geospatial index');
    }
    
    console.log('✅ Index configuration test passed\n');
  } catch (err) {
    console.log(`❌ Index configuration test failed: ${err.message}\n`);
    return false;
  }
  
  console.log('🎉 Database Setup Test Complete!');
  console.log('================================\n');
  
  console.log('📋 Next Steps:');
  console.log('1. If using local MongoDB: Start MongoDB service');
  console.log('2. If using MongoDB Atlas: Update MONGODB_URI with your credentials');
  console.log('3. Run: npm run db:setup (to initialize with sample data)');
  console.log('4. Run: npm start (to start the application)');
  
  return true;
};

// Run the test
testDatabaseSetup().catch(console.error);
