const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/error');

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const reports = require('./routes/reports');
const notifications = require('./routes/notifications');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/reports', reports);
app.use('/api/notifications', notifications);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Rregullo Tiranen API' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
