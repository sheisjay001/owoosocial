const app = require('../server/index');
const connectDB = require('../server/config/db');

// Vercel serverless function handler - using Catch-All Route [...route].js
module.exports = async (req, res) => {
  try {
    // Log debug info
    console.log(`[Vercel Entry] Method: ${req.method}, URL: ${req.url}`);
    
    // Check environment variables
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing!');
    }

    // Handle OPTIONS request (CORS Preflight) directly
    if (req.method === 'OPTIONS') {
      console.log('[Vercel] Handling OPTIONS request');
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );
      res.status(200).end();
      return;
    }

    // Ensure database is connected before handling the request
    await connectDB();
    
    // Allow the Express app to handle the request
    console.log('[Vercel] Passing to Express app...');
    app(req, res);
  } catch (error) {
    console.error('Vercel Function Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error (Vercel)',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};