const Subscriber = require('../models/Subscriber');

const csv = require('csv-parser');
const { Readable } = require('stream');

// @desc    Import subscribers from CSV
// @route   POST /api/subscribers/upload-csv
// @access  Private
exports.importSubscribers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a CSV file' });
        }

        const results = [];
        const errors = [];
        let addedCount = 0;

        // Convert buffer to stream
        const stream = Readable.from(req.file.buffer.toString());

        stream
            .pipe(csv())
            .on('data', (data) => {
                // Flexible column matching
                const keys = Object.keys(data);
                const emailKey = keys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));
                const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('first'));

                if (emailKey && data[emailKey]) {
                    results.push({
                        email: data[emailKey].trim(),
                        name: nameKey ? data[nameKey].trim() : ''
                    });
                }
            })
            .on('end', async () => {
                // No temp file to delete
                
                for (const item of results) {
                    try {
                        await Subscriber.updateOne(
                            { user: req.user.id, email: item.email },
                            { 
                                $set: { 
                                    name: item.name,
                                    status: 'subscribed' 
                                } 
                            },
                            { upsert: true }
                        );
                        addedCount++;
                    } catch (e) {
                        errors.push({ email: item.email, error: e.message });
                    }
                }

                res.status(200).json({
                    success: true,
                    message: `Successfully processed ${addedCount} subscribers from CSV.`,
                    count: addedCount,
                    errors: errors.length > 0 ? errors : undefined
                });
            })
            .on('error', (err) => {
                 res.status(500).json({ success: false, error: 'Failed to parse CSV: ' + err.message });
            });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all subscribers for the current user
// @route   GET /api/subscribers
// @access  Private
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: subscribers.length, data: subscribers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a single subscriber
// @route   POST /api/subscribers
// @access  Private
exports.addSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check if already exists for this user
    const existing = await Subscriber.findOne({ user: req.user.id, email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Subscriber already exists' });
    }

    const subscriber = await Subscriber.create({
      user: req.user.id,
      email,
      name
    });

    res.status(201).json({ success: true, data: subscriber });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Bulk add subscribers (comma separated or array)
// @route   POST /api/subscribers/bulk
// @access  Private
exports.bulkAddSubscribers = async (req, res) => {
    try {
        const { emails } = req.body; // Expects array of strings or objects {email, name}
        
        if (!emails || !Array.isArray(emails)) {
             return res.status(400).json({ success: false, error: 'Invalid format. Provide "emails" array.' });
        }

        let addedCount = 0;
        let errors = [];

        for (const item of emails) {
            let emailStr = typeof item === 'string' ? item : item.email;
            let nameStr = typeof item === 'string' ? '' : item.name;

            if (!emailStr) continue;

            try {
                // Upsert to avoid duplicates error stopping the loop
                await Subscriber.updateOne(
                    { user: req.user.id, email: emailStr },
                    { 
                        $set: { 
                            name: nameStr,
                            status: 'subscribed' 
                        } 
                    },
                    { upsert: true }
                );
                addedCount++;
            } catch (e) {
                errors.push({ email: emailStr, error: e.message });
            }
        }

        res.status(200).json({ 
            success: true, 
            message: `Successfully processed ${addedCount} subscribers.`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete a subscriber
// @route   DELETE /api/subscribers/:id
// @access  Private
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Subscriber not found' });
    }

    // Make sure user owns the subscriber
    if (subscriber.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await subscriber.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
