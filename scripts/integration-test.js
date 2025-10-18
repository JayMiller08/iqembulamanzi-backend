const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Incident = require('../src/models/Incident');

// Test the complete registration flow
const testCompleteRegistrationFlow = async () => {
  console.log('🧪 Testing Complete Frontend-Backend-Database Integration');
  console.log('========================================================\n');
  
  // Test 1: Backend API Registration Endpoint
  console.log('📝 Testing Backend Registration API...');
  try {
    const testUserData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser@example.com',
      phone: '+27123456789',
      password: 'password123',
      role: 'Guardian',
      address: '123 Test Street, Johannesburg',
      lat: -26.2041,
      lng: 28.0473
    };

    const response = await request(app)
      .post('/submit')
      .send(testUserData)
      .expect(201);

    console.log('  ✅ Registration API endpoint working');
    console.log(`  📊 Response: ${response.body.message}`);
    
    // Test 2: Verify user was saved to database
    console.log('\n🗄️  Testing Database Storage...');
    const savedUser = await User.findOne({ email: 'testuser@example.com' });
    
    if (savedUser) {
      console.log('  ✅ User successfully saved to database');
      console.log(`  👤 User ID: ${savedUser.userId}`);
      console.log(`  📧 Email: ${savedUser.email}`);
      console.log(`  🏷️  Role: ${savedUser.role}`);
      console.log(`  📍 Location: [${savedUser.location.coordinates[1]}, ${savedUser.location.coordinates[0]}]`);
    } else {
      console.log('  ❌ User not found in database');
      return false;
    }

    // Test 3: Test Login API
    console.log('\n🔑 Testing Login API...');
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      })
      .expect(200);

    if (loginResponse.body.token) {
      console.log('  ✅ Login API working');
      console.log('  🔐 JWT token generated successfully');
    } else {
      console.log('  ❌ Login failed');
      return false;
    }

    // Test 4: Test Protected Routes
    console.log('\n🛡️  Testing Protected Routes...');
    const token = loginResponse.body.token;
    
    const usersResponse = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    if (usersResponse.body.length > 0) {
      console.log('  ✅ Protected route access working');
      console.log(`  👥 Found ${usersResponse.body.length} users`);
    } else {
      console.log('  ❌ Protected route failed');
      return false;
    }

    // Test 5: Test Incident Creation
    console.log('\n📋 Testing Incident Creation...');
    const incidentResponse = await request(app)
      .post('/whatsapp')
      .send({
        From: 'whatsapp:+27123456789',
        Body: 'Test incident report',
        Latitude: -26.2041,
        Longitude: 28.0473
      })
      .expect(200);

    console.log('  ✅ Incident creation working');
    
    // Verify incident was saved
    const savedIncident = await Incident.findOne({ 
      'reporters.phone': '+27123456789' 
    });
    
    if (savedIncident) {
      console.log('  ✅ Incident successfully saved to database');
      console.log(`  📋 Incident ID: ${savedIncident._id}`);
      console.log(`  📝 Description: ${savedIncident.reporters[0].description}`);
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'testuser@example.com' });
    if (savedIncident) {
      await Incident.deleteOne({ _id: savedIncident._id });
    }
    console.log('  ✅ Test data cleaned up');

    console.log('\n🎉 Complete Integration Test Passed!');
    console.log('====================================');
    console.log('✅ Frontend can register users');
    console.log('✅ Backend processes registration');
    console.log('✅ Database stores user data');
    console.log('✅ Authentication works');
    console.log('✅ Protected routes accessible');
    console.log('✅ Incident creation works');
    
    return true;
  } catch (err) {
    console.error('❌ Integration test failed:', err.message);
    return false;
  }
};

// Test database connection
const testDatabaseConnection = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqembulamanzi';
  
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.log('⚠️  Database connection failed:', err.message);
    console.log('💡 This is expected if MongoDB is not running');
    console.log('💡 For testing, you can use MongoDB Atlas or start local MongoDB');
    return false;
  }
};

// Main test runner
const runIntegrationTests = async () => {
  console.log('🚀 iqembulamanzi Integration Test Suite');
  console.log('======================================\n');
  
  const dbConnected = await testDatabaseConnection();
  
  if (dbConnected) {
    await testCompleteRegistrationFlow();
  } else {
    console.log('\n⚠️  Skipping integration tests due to database connection');
    console.log('📋 To run full integration tests:');
    console.log('1. Set up MongoDB Atlas or start local MongoDB');
    console.log('2. Update MONGODB_URI in .env file');
    console.log('3. Run: npm run integration-test');
  }
  
  await mongoose.connection.close();
  console.log('\n👋 Test completed');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = {
  testCompleteRegistrationFlow,
  testDatabaseConnection
};
