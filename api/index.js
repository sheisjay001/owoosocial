const app = require('../server/index');
const connectDB = require('../server/config/db');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Ensure database is connected before handling the request
  await connectDB();
  
  // Allow the Express app to handle the request
  app(req, res);
};
