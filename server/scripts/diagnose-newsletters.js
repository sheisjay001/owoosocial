const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to DB
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-scheduler';
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('DB Connection Error:', err));

const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const Newsletter = require('../models/Newsletter');

async function diagnose() {
    try {
        console.log('\n--- DIAGNOSTIC REPORT ---\n');

        // 1. Check Users
        const users = await User.find();
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(` - User: ${u.email} (ID: ${u._id})`));

        // 2. Check Subscribers
        const subscribers = await Subscriber.find().populate('user', 'email');
        console.log(`\nTotal Subscribers: ${subscribers.length}`);
        
        // Group subscribers by user
        const subsByUser = {};
        subscribers.forEach(s => {
            const userEmail = s.user ? s.user.email : 'Unlinked';
            if (!subsByUser[userEmail]) subsByUser[userEmail] = 0;
            subsByUser[userEmail]++;
        });

        for (const [email, count] of Object.entries(subsByUser)) {
            console.log(` - Owner: ${email} has ${count} subscribers`);
        }

        // 3. Check Newsletters
        const newsletters = await Newsletter.find().populate('user', 'email');
        console.log(`\nTotal Newsletters: ${newsletters.length}`);
        
        for (const n of newsletters) {
            console.log(`\nNewsletter: "${n.subject}"`);
            console.log(` - ID: ${n._id}`);
            console.log(` - Status: ${n.status}`);
            console.log(` - Owner: ${n.user ? n.user.email : 'Unlinked'}`);
            console.log(` - Scheduled: ${n.scheduledTime}`);
            
            // Check if this owner has subscribers
            if (n.user) {
                const count = await Subscriber.countDocuments({ user: n.user._id, status: 'subscribed' });
                console.log(` - Owner has ${count} active subscribers.`);
                if (count === 0) console.warn(`   WARNING: This newsletter cannot be sent by Scheduler (No Subscribers).`);
            } else {
                console.warn(`   WARNING: Newsletter has no owner.`);
            }
        }

    } catch (err) {
        console.error('Diagnostic Error:', err);
    } finally {
        mongoose.disconnect();
    }
}

// Wait for connection then run
setTimeout(diagnose, 2000);
