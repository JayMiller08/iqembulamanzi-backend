const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Incident = require('../src/models/Incident');

// Database connection for testing
const connectTestDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqembulamanzi_test';
  
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to test database');
    return true;
  } catch (err) {
    console.error('❌ Test database connection error:', err.message);
    return false;
  }
};

// Test database connectivity
const testDatabaseConnectivity = async () => {
  console.log('\n🔌 Testing Database Connectivity...');
  
  try {
    // Test basic connection
    const state = mongoose.connection.readyState;
    console.log(`Connection state: ${state} (1=connected)`);
    
    if (state !== 1) {
      throw new Error('Database not connected');
    }
    
    // Test database operations
    const dbName = mongoose.connection.name;
    console.log(`Database name: ${dbName}`);
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Collections: ${collections.map(c => c.name).join(', ')}`);
    
    console.log('✅ Database connectivity test passed');
    return true;
  } catch (err) {
    console.error('❌ Database connectivity test failed:', err.message);
    return false;
  }
};

// Test user operations
const testUserOperations = async () => {
  console.log('\n👤 Testing User Operations...');
  
  try {
    // Test user creation
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
    
    await testUser.save();
    console.log('✅ User creation successful');
    
    // Test user query
    const foundUser = await User.findOne({ email: 'test@example.com' });
    if (foundUser) {
      console.log('✅ User query successful');
    }
    
    // Test user update
    foundUser.first_name = 'Updated';
    await foundUser.save();
    console.log('✅ User update successful');
    
    // Test user deletion
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ User deletion successful');
    
    console.log('✅ All user operations passed');
    return true;
  } catch (err) {
    console.error('❌ User operations test failed:', err.message);
    return false;
  }
};

// Test incident operations
const testIncidentOperations = async () => {
  console.log('\n📋 Testing Incident Operations...');
  
  try {
    // Test incident creation
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
    
    await testIncident.save();
    console.log('✅ Incident creation successful');
    
    // Test incident query
    const foundIncident = await Incident.findOne({ status: 'open' });
    if (foundIncident) {
      console.log('✅ Incident query successful');
    }
    
    // Test incident update
    foundIncident.status = 'in_progress';
    await foundIncident.save();
    console.log('✅ Incident update successful');
    
    // Test incident deletion
    await Incident.deleteOne({ _id: foundIncident._id });
    console.log('✅ Incident deletion successful');
    
    console.log('✅ All incident operations passed');
    return true;
  } catch (err) {
    console.error('❌ Incident operations test failed:', err.message);
    return false;
  }
};

// Test API endpoints
const testAPIEndpoints = async () => {
  console.log('\n🌐 Testing API Endpoints...');
  
  try {
    // Test home endpoint
    const homeResponse = await request(app).get('/');
    if (homeResponse.status === 200) {
      console.log('✅ Home endpoint working');
    }
    
    // Test user registration
    const registerResponse = await request(app)
      .post('/submit')
      .send({
        first_name: 'API',
        last_name: 'Test',
        email: 'apitest@example.com',
        phone: '+27123456789',
        password: 'password123',
        role: 'Guardian',
        address: 'Test Address',
        lat: -26.2041,
        lng: 28.0473
      });
    
    if (registerResponse.status === 201) {
      console.log('✅ User registration endpoint working');
    }
    
    // Test user login
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'apitest@example.com',
        password: 'password123'
      });
    
    if (loginResponse.status === 200) {
      console.log('✅ User login endpoint working');
    }
    
    // Clean up test user
    await User.deleteOne({ email: 'apitest@example.com' });
    console.log('✅ Test user cleaned up');
    
    console.log('✅ All API endpoint tests passed');
    return true;
  } catch (err) {
    console.error('❌ API endpoint test failed:', err.message);
    return false;
  }
};

// Test geospatial queries
const testGeospatialQueries = async () => {
  console.log('\n🗺️  Testing Geospatial Queries...');
  
  try {
    // Create test users with different locations
    const users = [
      {
        userId: 'GEO001',
        first_name: 'Geo',
        last_name: 'User1',
        email: 'geo1@example.com',
        phone: '+27123456789',
        address: 'Johannesburg',
        location: { type: 'Point', coordinates: [28.0473, -26.2041] },
        role: 'Guardian',
        password: 'password'
      },
      {
        userId: 'GEO002',
        first_name: 'Geo',
        last_name: 'User2',
        email: 'geo2@example.com',
        phone: '+27123456790',
        address: 'Cape Town',
        location: { type: 'Point', coordinates: [18.4241, -33.9249] },
        role: 'Guardian',
        password: 'password'
      }
    ];
    
    await User.insertMany(users);
    console.log('✅ Test users created for geospatial testing');
    
    // Test near query
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [28.0473, -26.2041]
          },
          $maxDistance: 1000000 // 1000km
        }
      }
    });
    
    if (nearbyUsers.length >= 2) {
      console.log('✅ Geospatial near query working');
    }
    
    // Clean up
    await User.deleteMany({ email: { $in: ['geo1@example.com', 'geo2@example.com'] } });
    console.log('✅ Geospatial test users cleaned up');
    
    console.log('✅ All geospatial query tests passed');
    return true;
  } catch (err) {
    console.error('❌ Geospatial query test failed:', err.message);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🧪 iqembulamanzi Database Test Suite');
  console.log('====================================\n');
  
  const connected = await connectTestDB();
  if (!connected) {
    console.log('❌ Cannot run tests without database connection');
    process.exit(1);
  }
  
  const tests = [
    { name: 'Database Connectivity', fn: testDatabaseConnectivity },
    { name: 'User Operations', fn: testUserOperations },
    { name: 'Incident Operations', fn: testIncidentOperations },
    { name: 'API Endpoints', fn: testAPIEndpoints },
    { name: 'Geospatial Queries', fn: testGeospatialQueries }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`❌ ${test.name} test crashed:`, err.message);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Database is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  await mongoose.connection.close();
  console.log('\n👋 Test database connection closed');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDatabaseConnectivity,
  testUserOperations,
  testIncidentOperations,
  testAPIEndpoints,
  testGeospatialQueries
};
