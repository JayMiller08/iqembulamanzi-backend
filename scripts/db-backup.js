const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Incident = require('../src/models/Incident');

// Database connection
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqembulamanzi';
  
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database for backup');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
};

// Create backup directory
const createBackupDir = () => {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

// Backup users collection
const backupUsers = async (backupDir) => {
  try {
    console.log('📤 Backing up users...');
    const users = await User.find({}).lean();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `users_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(users, null, 2));
    console.log(`✅ Users backed up to: ${filename} (${users.length} records)`);
    
    return { filename, count: users.length };
  } catch (err) {
    console.error('❌ Error backing up users:', err.message);
    return null;
  }
};

// Backup incidents collection
const backupIncidents = async (backupDir) => {
  try {
    console.log('📤 Backing up incidents...');
    const incidents = await Incident.find({}).lean();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `incidents_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(incidents, null, 2));
    console.log(`✅ Incidents backed up to: ${filename} (${incidents.length} records)`);
    
    return { filename, count: incidents.length };
  } catch (err) {
    console.error('❌ Error backing up incidents:', err.message);
    return null;
  }
};

// Create backup summary
const createBackupSummary = (backupDir, results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const summary = {
    timestamp: new Date().toISOString(),
    backupId: timestamp,
    collections: results.filter(r => r !== null),
    totalRecords: results.reduce((sum, r) => sum + (r ? r.count : 0), 0)
  };
  
  const summaryFile = path.join(backupDir, `backup_summary_${timestamp}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  console.log(`📋 Backup summary created: backup_summary_${timestamp}.json`);
  return summary;
};

// Restore from backup
const restoreFromBackup = async (backupDir, backupId) => {
  try {
    console.log(`📥 Restoring from backup: ${backupId}`);
    
    // Find backup files
    const summaryFile = path.join(backupDir, `backup_summary_${backupId}.json`);
    if (!fs.existsSync(summaryFile)) {
      throw new Error(`Backup summary not found: ${summaryFile}`);
    }
    
    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    console.log(`📋 Restoring backup from: ${summary.timestamp}`);
    
    // Restore users
    const usersFile = summary.collections.find(c => c.filename.includes('users'));
    if (usersFile) {
      const usersData = JSON.parse(fs.readFileSync(path.join(backupDir, usersFile.filename), 'utf8'));
      
      // Clear existing users
      await User.deleteMany({});
      
      // Insert backed up users
      await User.insertMany(usersData);
      console.log(`✅ Restored ${usersData.length} users`);
    }
    
    // Restore incidents
    const incidentsFile = summary.collections.find(c => c.filename.includes('incidents'));
    if (incidentsFile) {
      const incidentsData = JSON.parse(fs.readFileSync(path.join(backupDir, incidentsFile.filename), 'utf8'));
      
      // Clear existing incidents
      await Incident.deleteMany({});
      
      // Insert backed up incidents
      await Incident.insertMany(incidentsData);
      console.log(`✅ Restored ${incidentsData.length} incidents`);
    }
    
    console.log('✅ Database restore completed successfully');
    return true;
  } catch (err) {
    console.error('❌ Error restoring from backup:', err.message);
    return false;
  }
};

// List available backups
const listBackups = (backupDir) => {
  try {
    console.log('📋 Available Backups:');
    
    const files = fs.readdirSync(backupDir);
    const summaries = files.filter(f => f.startsWith('backup_summary_'));
    
    if (summaries.length === 0) {
      console.log('  No backups found');
      return;
    }
    
    summaries.forEach(file => {
      const summaryPath = path.join(backupDir, file);
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      
      console.log(`\n  📅 ${summary.timestamp}`);
      console.log(`     ID: ${summary.backupId}`);
      console.log(`     Records: ${summary.totalRecords}`);
      console.log(`     Collections: ${summary.collections.length}`);
    });
    
  } catch (err) {
    console.error('❌ Error listing backups:', err.message);
  }
};

// Main backup function
const performBackup = async () => {
  console.log('💾 iqembulamanzi Database Backup');
  console.log('================================\n');
  
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Cannot perform backup without database connection');
    process.exit(1);
  }
  
  const backupDir = createBackupDir();
  console.log(`📁 Backup directory: ${backupDir}`);
  
  // Perform backups
  const userBackup = await backupUsers(backupDir);
  const incidentBackup = await backupIncidents(backupDir);
  
  // Create summary
  const summary = createBackupSummary(backupDir, [userBackup, incidentBackup]);
  
  console.log('\n✅ Backup completed successfully!');
  console.log(`📊 Total records backed up: ${summary.totalRecords}`);
  console.log(`📁 Backup location: ${backupDir}`);
  
  await mongoose.connection.close();
  console.log('\n👋 Database connection closed');
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === '--backup') {
    await performBackup();
  } else if (command === '--restore') {
    const backupId = args[1];
    if (!backupId) {
      console.log('❌ Please provide backup ID for restore');
      console.log('Usage: node scripts/db-backup.js --restore <backup-id>');
      return;
    }
    
    const connected = await connectDB();
    if (!connected) {
      console.log('❌ Cannot perform restore without database connection');
      process.exit(1);
    }
    
    const backupDir = createBackupDir();
    await restoreFromBackup(backupDir, backupId);
    await mongoose.connection.close();
  } else if (command === '--list') {
    const backupDir = createBackupDir();
    listBackups(backupDir);
  } else {
    console.log('📋 Database Backup Utility');
    console.log('==========================\n');
    console.log('Available commands:');
    console.log('  --backup              Create a new backup');
    console.log('  --restore <backup-id> Restore from backup');
    console.log('  --list                List available backups');
    console.log('\nExamples:');
    console.log('  node scripts/db-backup.js --backup');
    console.log('  node scripts/db-backup.js --list');
    console.log('  node scripts/db-backup.js --restore 2024-01-15T10-30-00-000Z');
  }
};

main().catch(console.error);
