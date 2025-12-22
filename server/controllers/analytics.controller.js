const Post = require('../models/Post');
const Subscriber = require('../models/Subscriber');

exports.getAnalytics = async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        // const userId = req.user.id; // Posts currently don't have user association

        // 1. Determine Date Range
        const now = new Date();
        const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);

        // 2. Fetch Real Data
        const posts = await Post.find({
            createdAt: { $gte: startDate }
        });
        
        // Filter subscribers by user if possible, otherwise global
        const subscriberQuery = { createdAt: { $gte: startDate } };
        if (req.user?.id) {
             subscriberQuery.user = req.user.id;
        }
        const subscribers = await Subscriber.find(subscriberQuery);

        // 3. Aggregate Data
        const labels = [];
        const reachData = [];
        const engagementData = [];
        const platformStats = {};
        
        // Generate daily buckets
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labels.push(dateStr);
            
            // Filter items for this day
            const dayStart = new Date(d);
            dayStart.setHours(0,0,0,0);
            const dayEnd = new Date(d);
            dayEnd.setHours(23,59,59,999);
            
            const daysPosts = posts.filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate >= dayStart && pDate <= dayEnd;
            });
            
            const dayReach = daysPosts.reduce((acc, p) => acc + (p.analytics?.impressions || 0), 0);
            const dayEng = daysPosts.reduce((acc, p) => acc + (p.analytics?.likes || 0) + (p.analytics?.comments || 0) + (p.analytics?.shares || 0), 0);
            
            reachData.push(dayReach);
            engagementData.push(dayEng);
        }

        // Platform Breakdown
        posts.forEach(p => {
            if (p.platform) {
                const plat = p.platform.toLowerCase();
                if (!platformStats[plat]) platformStats[plat] = { reach: 0, engagement: 0, count: 0 };
                platformStats[plat].reach += (p.analytics?.impressions || 0);
                platformStats[plat].engagement += (p.analytics?.likes || 0) + (p.analytics?.comments || 0) + (p.analytics?.shares || 0);
                platformStats[plat].count++;
            }
        });

        // Format Platform Breakdown for UI
        const platformBreakdown = {};
        Object.keys(platformStats).forEach(key => {
            platformBreakdown[key] = {
                reach: platformStats[key].reach.toLocaleString(),
                engagement: platformStats[key].engagement.toLocaleString()
            };
        });

        // Overview
        const totalPosts = posts.length;
        const totalReach = reachData.reduce((a, b) => a + b, 0);
        const totalEngagement = engagementData.reduce((a, b) => a + b, 0);
        const newFollowers = subscribers.length;
        const impressions = totalReach; 

        const data = {
            overview: {
                totalPosts,
                totalReach,
                totalEngagement,
                newFollowers,
                impressions
            },
            charts: {
                labels,
                reach: reachData,
                engagement: engagementData
            },
            platformBreakdown
        };
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Analytics Error:', error);
        // Return empty structure on error instead of mock
        res.status(200).json({ 
            success: true, 
            data: {
                overview: { totalReach: 0, totalEngagement: 0, newFollowers: 0, impressions: 0 },
                charts: { labels: [], reach: [], engagement: [] },
                platformBreakdown: {}
            } 
        });
    }
};
