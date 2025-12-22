const WhatsAppContact = require('../models/WhatsAppContact');
const Broadcast = require('../models/Broadcast');
const csv = require('csv-parser');
const { Readable } = require('stream');

// --- Contacts ---

exports.getContacts = async (req, res) => {
    try {
        const contacts = await WhatsAppContact.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.addContact = async (req, res) => {
    try {
        const { phoneNumber, name } = req.body;
        if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

        const contact = await WhatsAppContact.create({
            user: req.user.id,
            phoneNumber,
            name
        });

        res.status(201).json({ success: true, data: contact });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Phone number already exists for this user' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const contact = await WhatsAppContact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!contact) return res.status(404).json({ error: 'Contact not found' });
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.importContacts = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());
    
    stream
        .pipe(csv())
        .on('data', (data) => {
            // Flexible column matching
            const phoneKey = Object.keys(data).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('number'));
            const nameKey = Object.keys(data).find(k => k.toLowerCase().includes('name'));
            
            if (phoneKey && data[phoneKey]) {
                results.push({
                    phoneNumber: data[phoneKey],
                    name: nameKey ? data[nameKey] : ''
                });
            }
        })
        .on('end', async () => {
            let addedCount = 0;
            let errorCount = 0;

            for (const item of results) {
                try {
                    await WhatsAppContact.findOneAndUpdate(
                        { user: req.user.id, phoneNumber: item.phoneNumber },
                        { name: item.name },
                        { upsert: true, new: true }
                    );
                    addedCount++;
                } catch (err) {
                    errorCount++;
                }
            }
            
            res.json({ success: true, message: `Processed ${results.length} rows. Added/Updated: ${addedCount}. Errors: ${errorCount}` });
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Failed to process CSV' });
        });
};

// --- Broadcasts ---

exports.getBroadcasts = async (req, res) => {
    try {
        const broadcasts = await Broadcast.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: broadcasts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createBroadcast = async (req, res) => {
    try {
        const { message, scheduledTime } = req.body;
        
        if (!message) return res.status(400).json({ error: 'Message content is required' });

        // Fetch all active contacts
        const contacts = await WhatsAppContact.find({ user: req.user.id, status: 'active' });
        
        if (contacts.length === 0) {
            return res.status(400).json({ error: 'No active WhatsApp contacts found. Please add contacts first.' });
        }

        const recipients = contacts.map(c => ({
            contact: c._id,
            status: 'pending'
        }));

        const broadcast = await Broadcast.create({
            user: req.user.id,
            message,
            scheduledTime: scheduledTime || new Date(),
            status: 'scheduled',
            recipients,
            totalRecipients: recipients.length,
            nextBatchTime: scheduledTime || new Date() // Start immediately if no time provided
        });

        res.status(201).json({ success: true, data: broadcast });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getBroadcastStats = async (req, res) => {
    try {
        const broadcast = await Broadcast.findOne({ _id: req.params.id, user: req.user.id });
        if (!broadcast) return res.status(404).json({ error: 'Broadcast not found' });
        res.json({ success: true, data: broadcast });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
