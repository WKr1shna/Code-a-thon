const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // fallback to current working directory env

const requiredEnv = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FIREBASE_SERVICE_ACCOUNT_PATH',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_STORAGE_BUCKET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE',
  'TWILIO_WHATSAPP_FROM',
  'AI_SERVICE_URL'
];

// Check missing env vars
const missing = requiredEnv.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.warn(`WARNING: Missing environment variables: ${missing.join(', ')}`);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/disasterresponse',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json',
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE: process.env.TWILIO_PHONE || '',
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || '',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000'
};
