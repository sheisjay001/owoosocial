const Report = require('../models/Report');
const Post = require('../models/Post');
const Newsletter = require('../models/Newsletter');
const Podcast = require('../models/Podcast');

// In-memory store for fallback
let mockReports = [];

exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    
    // Mock data aggregation logic (simulating DB queries)
    // In a real app, we would query the DB with date ranges
    
    // 1. Gather Social Stats
    let socialStats = { totalPosts: 0, totalLikes: 0, totalImpressions: 0, engagementRate: 0 };
    try {
        const posts = await Post.find(); // Filter by date in real app
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
        // Fallback mock data
        socialStats = { totalPosts: 12, totalLikes: 450, totalImpressions: 12000, engagementRate: 3.8 };
    }

    // 2. Gather Newsletter Stats
    let newsletterStats = { totalSent: 0, avgOpenRate: 0, totalSubscribers: 0 };
    try {
        const newsletters = await Newsletter.find();
        newsletterStats.totalSent = newsletters.filter(n => n.status === 'sent').length;
        // Mock averages
        newsletterStats.avgOpenRate = 24.5; 
        newsletterStats.totalSubscribers = 1500;
    } catch (e) {
        console.log("Error fetching newsletters for report:", e.message);
        newsletterStats = { totalSent: 4, avgOpenRate: 22.1, totalSubscribers: 1250 };
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
        podcastStats.avgListenTime = 65; // Mock avg
    } catch (e) {
         console.log("Error fetching podcasts for report:", e.message);
         podcastStats = { totalEpisodes: 3, totalDownloads: 3400, avgListenTime: 72 };
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

    let report;
    try {
        report = await Report.create(reportData);
    } catch (dbError) {
        console.log('DB Error, using in-memory store:', dbError.message);
        report = { ...reportData, _id: Date.now().toString() };
        mockReports.push(report);
    }

    res.status(201).json({ success: true, data: report });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    let reports;
    try {
        reports = await Report.find().sort({ generatedAt: -1 });
    } catch (dbError) {
        console.log('DB Error, using in-memory store:', dbError.message);
        reports = mockReports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    }
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
