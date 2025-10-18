# 🗄️ iqembulamanzi Database Setup Guide

This guide will help you set up, configure, and manage the MongoDB database for the iqembulamanzi project.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
cd iqembulamanzi-backend
npm install
```

### 2. **Set Up Environment Variables**
```bash
# Copy the environment template
cp env-template.txt .env

# Edit .env with your database credentials
```

### 3. **Choose Database Option**

#### Option A: Local MongoDB (Recommended for Development)
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
mongod

# Your .env should contain:
MONGODB_URI=mongodb://localhost:27017/iqembulamanzi
```

#### Option B: MongoDB Atlas (Recommended for Production)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update your `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iqembulamanzi?retryWrites=true&w=majority
```

### 4. **Initialize Database**
```bash
# Set up database with sample data
npm run db:setup
```

### 5. **Test Database Connection**
```bash
# Run comprehensive database tests
npm run db:test
```

### 6. **Start the Application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Database Configuration

### Environment Variables
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/iqembulamanzi
DB_NAME=iqembulamanzi
DB_HOST=localhost
DB_PORT=27017

# Connection Options
DB_CONNECTION_TIMEOUT=30000
DB_SOCKET_TIMEOUT=45000
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=5
```

### Database Features
- ✅ **Connection Pooling**: Optimized connection management
- ✅ **Automatic Reconnection**: Handles connection drops gracefully
- ✅ **Indexes**: Performance-optimized database indexes
- ✅ **Geospatial Support**: Location-based queries
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Logging**: Detailed connection and operation logs

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  userId: String (unique), // USER001, USER002, etc.
  first_name: String (required),
  last_name: String (required),
  email: String (unique, required),
  phone: String,
  address: String (required),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  role: String (enum: ["Guardian", "Manager", "Admin"]),
  password: String (hashed),
  createdAt: Date
}
```

### Incidents Collection
```javascript
{
  _id: ObjectId,
  reporters: [{
    phone: String (required),
    reportedAt: Date,
    description: String (required)
  }],
  category: String (enum: ["manhole_overflow", "toilet_backup", "pipe_burst", "other"]),
  priority: String (enum: ["P0", "P1", "P2"]),
  status: String (enum: ["open", "in_progress", "allocated", "verified", "closed"]),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  guardianAssigned: ObjectId (ref: "Users"),
  verifiedBy: ObjectId (ref: "Users"),
  mediaUrls: [String],
  sewageLossEstimate: Number (liters),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Database Management Commands

### Setup Commands
```bash
# Initialize database with sample data
npm run db:setup

# Test database operations
npm run db:test

# Create backup
npm run db:backup

# List available backups
npm run db:list

# Restore from backup
npm run db:restore <backup-id>
```

### Manual Database Operations
```bash
# Connect to MongoDB shell
mongosh

# Use the database
use iqembulamanzi

# View collections
show collections

# Count documents
db.users.countDocuments()
db.incidents.countDocuments()

# Find users
db.users.find().pretty()

# Find incidents
db.incidents.find().pretty()
```

## 🧪 Testing Database

### Automated Tests
```bash
# Run all database tests
npm run db:test
```

### Test Coverage
- ✅ Database connectivity
- ✅ User CRUD operations
- ✅ Incident CRUD operations
- ✅ API endpoint integration
- ✅ Geospatial queries
- ✅ Index performance

### Manual Testing
```bash
# Test user registration
curl -X POST http://localhost:2000/submit \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "+27123456789",
    "password": "password123",
    "role": "Guardian",
    "address": "Test Address",
    "lat": -26.2041,
    "lng": 28.0473
  }'

# Test user login
curl -X POST http://localhost:2000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔒 Database Security

### Security Features
- ✅ **Password Hashing**: bcrypt with configurable rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Input Validation**: Mongoose schema validation
- ✅ **SQL Injection Protection**: Mongoose ODM protection
- ✅ **Connection Security**: TLS/SSL support

### Best Practices
- Use environment variables for credentials
- Enable MongoDB authentication
- Use TLS/SSL for production connections
- Regular database backups
- Monitor connection logs

## 📈 Performance Optimization

### Database Indexes
```javascript
// User indexes
{ email: 1 } (unique)
{ userId: 1 } (unique)
{ location: "2dsphere" }
{ role: 1 }

// Incident indexes
{ location: "2dsphere" }
{ status: 1 }
{ priority: 1 }
{ createdAt: -1 }
{ "reporters.phone": 1 }
```

### Connection Pooling
- Max pool size: 10 connections
- Min pool size: 5 connections
- Connection timeout: 30 seconds
- Socket timeout: 45 seconds

## 🚨 Troubleshooting

### Common Issues

#### 1. **Connection Failed**
```bash
# Check MongoDB service
mongosh --eval "db.adminCommand('ismaster')"

# Check connection string
echo $MONGODB_URI

# Test connection
npm run db:test
```

#### 2. **Authentication Error**
```bash
# Check credentials in .env
# Ensure user has proper permissions
# Verify database name matches
```

#### 3. **Index Creation Failed**
```bash
# Check MongoDB version compatibility
# Verify schema definitions
# Check for duplicate indexes
```

#### 4. **Geospatial Queries Not Working**
```bash
# Ensure 2dsphere indexes are created
# Verify coordinate format [lng, lat]
# Check MongoDB version supports geospatial
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=mongoose:* npm run dev

# Check connection state
# In your application, log mongoose.connection.readyState
# 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
```

## 📋 Database Maintenance

### Regular Tasks
- **Daily**: Check connection logs
- **Weekly**: Run database tests
- **Monthly**: Create backups
- **Quarterly**: Review and optimize indexes

### Monitoring
- Connection pool usage
- Query performance
- Index usage statistics
- Error rates and patterns

## 🎯 Production Deployment

### Production Checklist
- ✅ Use MongoDB Atlas or secured local instance
- ✅ Enable authentication and authorization
- ✅ Use TLS/SSL connections
- ✅ Set up monitoring and alerting
- ✅ Configure automated backups
- ✅ Test disaster recovery procedures

### Environment-Specific Settings
```env
# Development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/iqembulamanzi_dev

# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/iqembulamanzi_prod
```

## 📞 Support

If you encounter issues:
1. Check the logs in `logs/` directory
2. Run `npm run db:test` to diagnose issues
3. Verify environment variables are set correctly
4. Check MongoDB service status
5. Review the troubleshooting section above

---

**Your database is now ready! 🎉**

The iqembulamanzi database is fully configured with:
- ✅ Optimized connection management
- ✅ Comprehensive error handling
- ✅ Performance indexes
- ✅ Backup and restore capabilities
- ✅ Testing suite
- ✅ Security features
