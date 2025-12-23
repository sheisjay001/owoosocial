const Newsletter = require('../models/Newsletter');
const User = require('../models/User');
const emailService = require('../services/email.service');

// Mock subscribers list (Fallback)
const mockSubscribers = [
  'user1@example.com', 'user2@example.com', 'client@business.com'
];

let mockNewsletters = []; // In-memory fallback if DB fails
exports.mockNewsletters = mockNewsletters;

exports.createNewsletter = async (req, res) => {
  try {
    const { subject, content, scheduledTime, status, audience } = req.body;
    let newsletter;

    try {
      newsletter = await Newsletter.create({
        subject,
        content,
        scheduledTime,
        status: status || 'draft',
        user: req.user.id, // Link to creator
        audience: audience || 'all' // Save audience preference
      });
    } catch (dbError) {
      console.log('DB Error, using in-memory store:', dbError.message);
      newsletter = {
        _id: Date.now().toString(),
        subject,
        content,
        scheduledTime,
        status: status || 'draft',
        user: req.user.id,
        createdAt: new Date()
      };
      mockNewsletters.push(newsletter);
    }

    res.status(201).json({ success: true, data: newsletter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getNewsletters = async (req, res) => {
  try {
    let newsletters;
    try {
      newsletters = await Newsletter.find().sort({ createdAt: -1 });
    } catch (dbError) {
      console.log('DB Error, using in-memory store:', dbError.message);
      newsletters = mockNewsletters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({ success: true, count: newsletters.length, data: newsletters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendNewsletterNow = async (req, res) => {
  try {
    const { id } = req.params;
    let newsletter;

    try {
      newsletter = await Newsletter.findById(id);
    } catch (dbError) {
      newsletter = mockNewsletters.find(n => n._id === id);
    }

    if (!newsletter) {
      return res.status(404).json({ success: false, error: 'Newsletter not found' });
    }

    // Fetch real subscribers (Subscribers owned by user)
    let subscribers = [];
    try {
        const Subscriber = require('../models/Subscriber');
        const subList = await Subscriber.find({ 
            user: req.user.id, 
            status: 'subscribed' 
        }).select('email');
        
        subscribers = subList.map(s => s.email);

        // Fallback: If no subscribers, maybe they are testing with their own email
        if (subscribers.length === 0) {
            console.log('No subscribers found for user, checking system users as fallback (Legacy Mode)');
             // Optional: Keep legacy behavior for now or just return empty
             // const users = await User.find().select('email');
             // subscribers = users.map(u => u.email);
        }
    } catch (e) {
        console.log('Error fetching subscribers for newsletter:', e.message);
    }

    // Fallback to mock if no users found
    // if (subscribers.length === 0) {
    //     console.log('No users found in DB, using mock subscribers.');
    //     subscribers = mockSubscribers;
    // }
    
    if (subscribers.length === 0) {
         return res.status(400).json({ success: false, error: 'No subscribers found. Please add subscribers first.' });
    }

    // Get sender
    let sender = {};
    try {
        if (req.user && req.user.id) {
             sender = await User.findById(req.user.id);
        }
    } catch (e) {
        console.log('Error fetching sender:', e.message);
    }

    const result = await emailService.sendNewsletter(newsletter, subscribers, sender);
    
    // Check if total failure
    if (result.sentCount === 0 && result.failedCount > 0) {
        // Return first error message
        const firstError = result.errors[0]?.error || 'Failed to send emails';
        return res.status(400).json({ success: false, error: firstError, details: result.errors });
    }
    
    newsletter.status = 'sent';
    newsletter.sentAt = new Date();
    newsletter.recipientCount = result.sentCount;
    
    // Save back to DB or mock store
    if (newsletter.save) {
        await newsletter.save();
    } else {
        const index = mockNewsletters.findIndex(n => n._id === id);
        if (index !== -1) mockNewsletters[index] = newsletter;
    }

    res.status(200).json({ 
        success: true, 
        data: newsletter,
        summary: {
            sent: result.sentCount,
            failed: result.failedCount,
            errors: result.errors
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
