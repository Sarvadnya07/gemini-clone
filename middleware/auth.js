const admin = require('firebase-admin');

// Initialize Firebase Admin with credentials from env or file
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin Initialized');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found. Auth middleware will be in bypass mode for dev.');
    }
  } catch (e) {
    console.error('❌ Failed to initialize Firebase Admin:', e.message);
  }
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In dev mode without Firebase config, we can bypass if needed, 
    // but the system should behave as 'unauthenticated'.
    req.user = null;
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    if (!admin.apps.length) throw new Error('Firebase Admin not initialized');
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // contains uid, email, etc.
    next();
  } catch (error) {
    console.error('🔒 Auth Error:', error.message);
    return res.status(401).json({ error: 'Unauthorized', details: error.message });
  }
};

module.exports = authMiddleware;
