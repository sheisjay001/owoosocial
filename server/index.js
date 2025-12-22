const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const aiRoutes = require('./routes/ai.routes');
const postRoutes = require('./routes/post.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const podcastRoutes = require('./routes/podcast.routes');
const reportRoutes = require('./routes/report.routes');
const paymentRoutes = require('./routes/payment.routes');
const domainRoutes = require('./routes/domain.routes');
const authRoutes = require('./routes/auth.routes');
const communityRoutes = require('./routes/community.routes');
const analyticsRoutes = require('./routes/analytics.routes');
// const initScheduler = require('./services/scheduler.service'); // Moved to conditional import
const statusRoutes = require('./routes/status.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS options
app.use(cors({
  origin: '*', // Allow all origins (for now) to fix 405/CORS issues
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// DEBUG: Log all incoming requests to Express
app.use((req, res, next) => {
  console.log(`[Express] Incoming Request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// DEBUG: Root handler for POST (in case URL is stripped)
app.post('/', (req, res) => {
    console.log('[Express] POST / hit (Root Path Mismatch?)');
    res.status(200).json({ success: true, message: 'POST / works - Path was stripped!' });
});

// DEBUG: Explicit test route to verify POST works
app.post('/api/test-post', (req, res) => {
  console.log('POST /api/test-post hit');
  res.status(200).json({ success: true, message: 'POST works!' });
});

// DEBUG: Test GET route
app.get('/api/test-get', (req, res) => {
    console.log('GET /api/test-get hit');
    res.status(200).json({ success: true, message: 'GET works!' });
});

// DEBUG: Explicit registration route override (to test user suggestion)
const debugRegisterHandler = (req, res) => {
  console.log('DEBUG REGISTER HIT:', req.body);
  res.status(200).json({ success: true, message: 'Debug Register Works' });
};
app.post('/api/auth/register-debug', debugRegisterHandler);
app.post('/auth/register-debug', debugRegisterHandler);

// Routes - Mount on both /api and root to handle Vercel rewrites robustly
const routes = [
  { path: '/ai', route: aiRoutes },
  { path: '/posts', route: postRoutes },
  { path: '/newsletters', route: newsletterRoutes },
  { path: '/podcasts', route: podcastRoutes },
  { path: '/reports', route: reportRoutes },
  { path: '/payments', route: paymentRoutes },
  { path: '/domains', route: domainRoutes },
  { path: '/auth', route: authRoutes },
  { path: '/community', route: communityRoutes },
  { path: '/status', route: statusRoutes },
];

routes.forEach(({ path, route }) => {
  app.use(`/api${path}`, route);
  app.use(path, route); // Fallback if /api is stripped
});

// DEBUG: Catch-all 404 handler to inspect the path
app.use('*', (req, res) => {
  const debugInfo = {
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
    baseUrl: req.baseUrl,
    routesMounted: routes.map(r => r.path)
  };
  console.log(`[Express] 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}. Debug: ${JSON.stringify(debugInfo)}`,
    debug: debugInfo
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Express Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error (Express Caught)',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.get('/', (req, res) => {
  res.send('OWOO Social AI Server is running');
});

// Only connect if running directly (not imported)
if (require.main === module) {
  connectDB();
  const initScheduler = require('./services/scheduler.service');
  initScheduler();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;