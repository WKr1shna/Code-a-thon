const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const env = require('./env');

let app = null;

try {
  const serviceAccountPath = path.isAbsolute(env.FIREBASE_SERVICE_ACCOUNT_PATH)
    ? env.FIREBASE_SERVICE_ACCOUNT_PATH
    : path.join(__dirname, '..', env.FIREBASE_SERVICE_ACCOUNT_PATH);

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: env.FIREBASE_DATABASE_URL,
      storageBucket: env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } else {
    // Fallback for development if file doesn't exist
    console.warn(`Firebase service account file not found at: ${serviceAccountPath}. Using mock Firebase initialization.`);
    app = admin.initializeApp({
      projectId: 'mock-disaster-response',
      databaseURL: env.FIREBASE_DATABASE_URL || 'https://mock.firebaseio.com',
      storageBucket: env.FIREBASE_STORAGE_BUCKET || 'mock.appspot.com'
    });
  }
} catch (error) {
  console.error(`Firebase SDK Initialization Error: ${error.message}`);
}

module.exports = admin;
