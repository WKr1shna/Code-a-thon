const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from apps/backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // fallback to current working directory env

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/disasterresponse';
const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || `${jwtSecret}_refresh`;

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: mongoUri,
  JWT_SECRET: jwtSecret,
  JWT_REFRESH_SECRET: jwtRefreshSecret,
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json',
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE: process.env.TWILIO_PHONE || '',
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || '',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000'
};

