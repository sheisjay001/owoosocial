const app = require('../server/index');
const connectDB = require('../server/config/db');

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Check environment variables
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing!');
    }

    // Handle OPTIONS request (CORS Preflight) directly
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Ensure database is connected before handling the request
    await connectDB();
    
    // Allow the Express app to handle the request
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
