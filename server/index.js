const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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
const statusRoutes = require('./routes/status.routes');
const connectDB = require('./config/db');
const initScheduler = require('./services/scheduler.service');

// Connect to Database
connectDB();

// Initialize Scheduler
initScheduler();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/status', statusRoutes);

app.get('/', (req, res) => {
  res.send('OWOO Social AI Server is running');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
