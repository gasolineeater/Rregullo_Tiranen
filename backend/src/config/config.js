const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/rregullo_tiranen',
  jwtSecret: process.env.JWT_SECRET || 'rregullo_tiranen_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '30d'
};
