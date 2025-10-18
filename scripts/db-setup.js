const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Incident = require('./src/models/Incident');

// Database connection
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqembulamanzi';
  
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

// Initialize database with sample data
const initializeDatabase = async () => {
  try {
    console.log('🗄️  Initializing database...');
    
    // Clear existing data (optional - comment out for production)
    await User.deleteMany({});
    await Incident.deleteMany({});
    console.log('🧹 Cleared existing data');
    
    // Create sample users
    const sampleUsers = [
      {
        userId: 'USER001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+27123456789',
        address: '123 Main St, Johannesburg',
        location: {
          type: 'Point',
          coordinates: [28.0473, -26.2041] // [lng, lat]
        },
        role: 'Admin',
        password: await bcrypt.hash('admin123', 12)
      },
      {
        userId: 'USER002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone: '+27123456790',
        address: '456 Oak Ave, Cape Town',
        location: {
          type: 'Point',
          coordinates: [18.4241, -33.9249]
        },
        role: 'Guardian',
        password: await bcrypt.hash('guardian123', 12)
      },
      {
        userId: 'USER003',
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike@example.com',
        phone: '+27123456791',
        address: '789 Pine Rd, Durban',
        location: {
          type: 'Point',
          coordinates: [31.0292, -29.8587]
        },
        role: 'Manager',
        password: await bcrypt.hash('manager123', 12)
      }
    ];
    
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`👥 Created ${createdUsers.length} sample users`);
    
    // Create sample incidents
    const sampleIncidents = [
      {
        reporters: [{
          phone: '+27123456790',
          reportedAt: new Date(),
          description: 'Sewer overflow near the park'
        }],
        category: 'manhole_overflow',
        priority: 'P0',
        status: 'open',
        location: {
          type: 'Point',
          coordinates: [28.0473, -26.2041]
        },
        guardianAssigned: createdUsers[1]._id, // Jane (Guardian)
        mediaUrls: [],
        sewageLossEstimate: 500,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reporters: [{
          phone: '+27123456791',
          reportedAt: new Date(),
          description: 'Toilet backup in residential area'
        }],
        category: 'toilet_backup',
        priority: 'P1',
        status: 'in_progress',
        location: {
          type: 'Point',
          coordinates: [31.0292, -29.8587]
        },
        guardianAssigned: createdUsers[1]._id, // Jane (Guardian)
        mediaUrls: [],
        sewageLossEstimate: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const createdIncidents = await Incident.insertMany(sampleIncidents);
    console.log(`📋 Created ${createdIncidents.length} sample incidents`);
    
    // Display created data
    console.log('\n📊 Database Summary:');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Incidents: ${await Incident.countDocuments()}`);
    
    console.log('\n👤 Sample Users:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('\n📋 Sample Incidents:');
    createdIncidents.forEach(incident => {
      console.log(`  - ${incident.category} - Status: ${incident.status} - Priority: ${incident.priority}`);
    });
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n🔑 Test Credentials:');
    console.log('  Admin: john@example.com / admin123');
    console.log('  Guardian: jane@example.com / guardian123');
    console.log('  Manager: mike@example.com / manager123');
    
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  }
};

// Test database operations
const testDatabaseOperations = async () => {
  try {
    console.log('\n🧪 Testing database operations...');
    
    // Test user operations
    const user = await User.findOne({ email: 'john@example.com' });
    if (user) {
      console.log('✅ User query successful:', user.first_name);
    }
    
    // Test incident operations
    const incidents = await Incident.find({ status: 'open' });
    console.log(`✅ Incident query successful: ${incidents.length} open incidents`);
    
    // Test geospatial query
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [28.0473, -26.2041]
          },
          $maxDistance: 10000 // 10km
        }
      }
    });
    console.log(`✅ Geospatial query successful: ${nearbyUsers.length} users within 10km`);
    
    console.log('✅ All database operations working correctly!');
    
  } catch (err) {
    console.error('❌ Database operation test failed:', err);
  }
};

// Main execution
const main = async () => {
  console.log('🚀 iqembulamanzi Database Setup');
  console.log('================================\n');
  
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--init')) {
    await initializeDatabase();
  }
  
  if (args.includes('--test')) {
    await testDatabaseOperations();
  }
  
  if (args.length === 0) {
    console.log('\n📋 Available commands:');
    console.log('  node scripts/db-setup.js --init    Initialize database with sample data');
    console.log('  node scripts/db-setup.js --test     Test database operations');
    console.log('  node scripts/db-setup.js --init --test  Initialize and test');
  }
  
  await mongoose.connection.close();
  console.log('\n👋 Database connection closed');
};

main().catch(console.error);
