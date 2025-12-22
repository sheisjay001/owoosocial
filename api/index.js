const app = require('../server/index');

// Vercel serverless function handler
module.exports = (req, res) => {
  // Allow the Express app to handle the request
  app(req, res);
};
