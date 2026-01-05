const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const expressRaw = require('express');
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
const brandRoutes = require('./routes/brand.routes');
const oauthRoutes = require('./routes/oauth.routes');
const leadRoutes = require('./routes/lead.routes');
const subscriberRoutes = require('./routes/subscriber.routes');
// const initScheduler = require('./services/scheduler.service'); // Moved to conditional import
const statusRoutes = require('./routes/status.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const allowedOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigin === '*' || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Handle preflight requests explicitly
// app.options('*', cors()); // Removed to avoid routing error. Global cors() middleware handles this.

app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    try {
      const auth = req.headers['authorization'] || '';
      const [, token] = auth.split(' ');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
        return decoded.id || req.ip;
      }
    } catch (e) {}
    return req.ip;
  }
});
app.use(limiter);

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
  { path: '/brands', route: brandRoutes },
  { path: '/oauth', route: oauthRoutes },
  { path: '/leads', route: leadRoutes },
  { path: '/subscribers', route: subscriberRoutes },
  { path: '/whatsapp', route: whatsappRoutes },
  { path: '/status', route: statusRoutes },
];

routes.forEach(({ path, route }) => {
  app.use(`/api${path}`, route);
  app.use(path, route); // Fallback if /api is stripped
});

// Generic Webhook Endpoint with HMAC verification
function verifySignature(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return res.status(400).json({ success: false, error: 'Webhook secret not configured' });
  const sig = req.headers['x-signature'] || req.headers['x-hub-signature-256'];
  if (!sig) return res.status(401).json({ success: false, error: 'Missing signature' });
  // Support "sha256=..." format or raw hex
  const provided = sig.includes('=') ? sig.split('=')[1] : sig;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(req.body);
  const expected = hmac.digest('hex');
  if (provided !== expected) {
    return res.status(401).json({ success: false, error: 'Invalid signature' });
  }
  next();
}

app.post('/api/webhooks/:provider', expressRaw.raw({ type: '*/*' }), verifySignature, (req, res) => {
  console.log(`[Webhook] Received from ${req.params.provider}`);
  res.status(200).json({ success: true });
});

// DEBUG: Catch-all 404 handler to inspect the path
app.use((req, res) => {
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
