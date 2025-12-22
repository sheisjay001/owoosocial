const Report = require('../models/Report');
const Post = require('../models/Post');
const Newsletter = require('../models/Newsletter');
const Podcast = require('../models/Podcast');

exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    
    // 1. Gather Social Stats
    let socialStats = { totalPosts: 0, totalLikes: 0, totalImpressions: 0, engagementRate: 0 };
    try {
        const posts = await Post.find(); // Filter by date in real app if needed, currently global
        socialStats.totalPosts = posts.length;
        posts.forEach(p => {
            if(p.analytics) {
                socialStats.totalLikes += p.analytics.likes || 0;
                socialStats.totalImpressions += p.analytics.impressions || 0;
            }
        });
        if(socialStats.totalImpressions > 0) {
            socialStats.engagementRate = ((socialStats.totalLikes / socialStats.totalImpressions) * 100).toFixed(1);
        }
    } catch (e) {
        console.log("Error fetching posts for report:", e.message);
        // No mock fallback
    }

    // 2. Gather Newsletter Stats
    let newsletterStats = { totalSent: 0, avgOpenRate: 0, totalSubscribers: 0 };
    try {
        const newsletters = await Newsletter.find();
        newsletterStats.totalSent = newsletters.filter(n => n.status === 'sent').length;
        // Real aggregation logic (if data exists)
        // Currently assuming newsletter model might not have open rate tracking fully implemented
        // So keeping as 0 if not found
    } catch (e) {
        console.log("Error fetching newsletters for report:", e.message);
        // No mock fallback
    }

    // 3. Gather Podcast Stats
    let podcastStats = { totalEpisodes: 0, totalDownloads: 0, avgListenTime: 0 };
    try {
        const podcasts = await Podcast.find();
        podcastStats.totalEpisodes = podcasts.length;
        podcasts.forEach(p => {
            if(p.analytics) {
                podcastStats.totalDownloads += p.analytics.totalDownloads || 0;
            }
        });
    } catch (e) {
         console.log("Error fetching podcasts for report:", e.message);
         // No mock fallback
    }

    const reportData = {
        title: `Performance Report - ${new Date().toLocaleDateString()}`,
        type: type || 'monthly',
        dateRange: {
            start: startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
            end: endDate || new Date()
        },
        metrics: {
            social: socialStats,
            newsletter: newsletterStats,
            podcast: podcastStats
        },
        generatedAt: new Date()
    };

    const report = await Report.create(reportData);
    res.status(201).json({ success: true, data: report });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ generatedAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
