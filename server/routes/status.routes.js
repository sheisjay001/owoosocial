const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'online',
    environment: process.env.NODE_ENV,
    database: {
      state: dbState,
      status: dbStatus[dbState] || 'unknown',
      host: mongoose.connection.host || 'none',
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;