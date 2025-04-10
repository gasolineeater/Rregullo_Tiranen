/**
 * Database initialization script for Rregullo Tiranen
 * This script creates sample data for development purposes
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
  process.exit(1);
});

// Sample data
const sampleUsers = [
  {
    fullname: 'Admin User',
    email: 'admin@example.com',
    phone: '355691234567',
    password: 'admin123',
    neighborhood: 'njesia5',
    role: 'admin'
  },
  {
    fullname: 'Test User',
    email: 'user@example.com',
    phone: '355697654321',
    password: 'user123',
    neighborhood: 'njesia7',
    role: 'user'
  }
];

const tiranaCenterLat = 41.3275;
const tiranaCenterLng = 19.8187;

const sampleReports = [
  {
    title: 'Gropë e madhe në rrugën Myslym Shyri',
    description: 'Ka një gropë të madhe në rrugën Myslym Shyri që është e rrezikshme për automjetet dhe këmbësorët.',
    category: 'infrastructure',
    subcategory: 'road-damage',
    type: 'pothole',
    address: 'Rruga Myslym Shyri, Tiranë',
    neighborhood: 'njesia5',
    location: {
      type: 'Point',
      coordinates: [tiranaCenterLng + 0.01, tiranaCenterLat + 0.01]
    },
    severity: 'high',
    status: 'in-progress'
  },
  {
    title: 'Ndriçim i dëmtuar në Bulevardin Zhan D\'Ark',
    description: 'Disa llamba të rrugës janë të dëmtuara në Bulevardin Zhan D\'Ark, duke e bërë zonën të errët dhe të pasigurt natën.',
    category: 'infrastructure',
    subcategory: 'street-lighting',
    type: 'broken-light',
    address: 'Bulevardi Zhan D\'Ark, Tiranë',
    neighborhood: 'njesia7',
    location: {
      type: 'Point',
      coordinates: [tiranaCenterLng - 0.01, tiranaCenterLat - 0.01]
    },
    severity: 'medium',
    status: 'pending'
  },
  {
    title: 'Depozitim i paligjshëm i mbeturinave',
    description: 'Ka një grumbull të madh mbeturinash të depozituara në mënyrë të paligjshme pranë parkut të liqenit.',
    category: 'environment',
    subcategory: 'littering',
    type: 'illegal-dumping',
    address: 'Parku i Liqenit Artificial, Tiranë',
    neighborhood: 'njesia11',
    location: {
      type: 'Point',
      coordinates: [tiranaCenterLng + 0.02, tiranaCenterLat - 0.02]
    },
    severity: 'high',
    status: 'pending'
  }
];

// Function to initialize the database
async function initializeDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create users
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        notifications: {
          status: true,
          comments: true,
          nearby: true,
          email: true,
          push: true
        },
        createdAt: new Date()
      });
      
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }
    
    // Create reports
    for (let i = 0; i < sampleReports.length; i++) {
      const reportData = sampleReports[i];
      const user = createdUsers[i % createdUsers.length];
      
      const report = await Report.create({
        ...reportData,
        user: user._id,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Each report 1 day apart
      });
      
      console.log(`Created report: ${report.title}`);
      
      // Add status updates for in-progress reports
      if (report.status === 'in-progress') {
        report.statusUpdates = new Map();
        report.statusUpdates.set('pending', {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          comment: 'Raportimi u krijua',
          updatedBy: user._id
        });
        report.statusUpdates.set('in-progress', {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          comment: 'Ekipi ynë është duke punuar për zgjidhjen e problemit',
          updatedBy: createdUsers.find(u => u.role === 'admin')._id
        });
        
        await report.save();
        console.log(`Added status updates to report: ${report.title}`);
      }
      
      // Create notification for the report
      const notification = await Notification.create({
        user: user._id,
        type: 'status',
        title: 'Raportim i ri u krijua',
        message: `Raportimi juaj "${report.title}" u krijua me sukses dhe është në pritje të shqyrtimit.`,
        report: report._id,
        read: false,
        createdAt: report.createdAt
      });
      
      console.log(`Created notification for report: ${report.title}`);
      
      // Add a comment to the first report
      if (i === 0) {
        const adminUser = createdUsers.find(u => u.role === 'admin');
        
        report.comments.push({
          text: 'Faleminderit për raportimin. Ekipi ynë do të jetë në vendngjarje brenda 48 orëve.',
          user: adminUser._id,
          name: adminUser.fullname,
          createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
        });
        
        await report.save();
        console.log(`Added comment to report: ${report.title}`);
        
        // Create notification for the comment
        await Notification.create({
          user: user._id,
          type: 'comment',
          title: 'Koment i ri në raportin tuaj',
          message: `${adminUser.fullname}: "Faleminderit për raportimin. Ekipi ynë do të jetë në vendngjarje brenda 48 orëve."`,
          report: report._id,
          read: true,
          createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
        });
        
        console.log(`Created notification for comment on report: ${report.title}`);
      }
    }
    
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
