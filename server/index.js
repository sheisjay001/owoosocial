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
const initScheduler = require('./services/scheduler.service');
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

app.get('/', (req, res) => {
  res.send('OWOO Social AI Server is running');
});

// Only connect if running directly (not imported)
if (require.main === module) {
  connectDB();
  initScheduler();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;