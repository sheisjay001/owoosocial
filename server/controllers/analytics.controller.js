// Mock Analytics Data
const generateMockData = (period) => {
    // Generate data based on period (7d, 30d, 90d)
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const labels = [];
    const reach = [];
    const engagement = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        reach.push(Math.floor(Math.random() * 5000) + 1000);
        engagement.push(Math.floor(Math.random() * 800) + 100);
    }

    return {
        overview: {
            totalReach: reach.reduce((a, b) => a + b, 0),
            totalEngagement: engagement.reduce((a, b) => a + b, 0),
            newFollowers: Math.floor(Math.random() * 500) + 50,
            impressions: Math.floor(reach.reduce((a, b) => a + b, 0) * 1.5)
        },
        charts: {
            labels,
            reach,
            engagement
        },
        platformBreakdown: {
            facebook: { reach: Math.floor(Math.random() * 50) + 10 + '%', engagement: Math.floor(Math.random() * 10) + 1 + '%' },
            instagram: { reach: Math.floor(Math.random() * 60) + 20 + '%', engagement: Math.floor(Math.random() * 15) + 5 + '%' },
            twitter: { reach: Math.floor(Math.random() * 40) + 10 + '%', engagement: Math.floor(Math.random() * 8) + 2 + '%' },
            linkedin: { reach: Math.floor(Math.random() * 30) + 5 + '%', engagement: Math.floor(Math.random() * 12) + 3 + '%' }
        }
    };
};

exports.getAnalytics = async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        const data = generateMockData(period);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
