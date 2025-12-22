const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const User = require('../models/User');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Error:', err.message);
        process.exit(1);
    }
};

const testWhatsApp = async () => {
    await connectDB();

    try {
        // Find a user with WhatsApp connection
        const user = await User.findOne({ 
            'connections.platform': { $regex: /whatsapp/i } 
        });

        if (!user) {
            console.error('❌ No user found with WhatsApp connection.');
            process.exit(1);
        }

        console.log(`✅ Found User: ${user.name} (${user.email})`);
        
        const connection = user.connections.find(c => c.platform.toLowerCase() === 'whatsapp');
        
        if (!connection) {
            console.error('❌ Connection object not found (unexpected).');
            process.exit(1);
        }

        const accessToken = connection.apiKey;
        const phoneNumberId = connection.identifier;

        console.log(`ℹ️  Phone Number ID: ${phoneNumberId}`);
        console.log(`ℹ️  Access Token: ${accessToken ? accessToken.substring(0, 10) + '...' : 'MISSING'}`);

        if (!accessToken || !phoneNumberId) {
            console.error('❌ Missing credentials in connection.');
            process.exit(1);
        }

        // Prompt for Target (Group ID) - or hardcode for test if passed as arg
        const target = process.argv[2];
        
        if (!target) {
            console.error('❌ Please provide a Target Group ID or Phone Number as an argument.');
            console.log('   Usage: node scripts/test-whatsapp.js <group_id_or_phone>');
            process.exit(1);
        }

        console.log(`🚀 Attempting to send test message to: ${target}`);

        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        const payload = {
            messaging_product: "whatsapp",
            to: target,
            type: "text",
            text: { body: "🔔 This is a test message from your AI Scheduler." }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ SUCCESS! Message sent.');
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (apiError) {
            console.error('❌ API FAILED');
            console.error('Status:', apiError.response?.status);
            console.error('Data:', JSON.stringify(apiError.response?.data, null, 2));
        }

    } catch (error) {
        console.error('Script Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

testWhatsApp();