const axios = require('axios');

// --- Low Level API Helpers ---

exports.postToFacebook = async (content, accessToken, pageId) => {
    try {
        const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
        const response = await axios.post(url, {
            message: content,
            access_token: accessToken
        });
        return { success: true, id: response.data.id, platform: 'Facebook' };
    } catch (error) {
        console.error('Facebook Post Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || 'Failed to post to Facebook');
    }
};

exports.postToInstagram = async (content, imageUrl, accessToken, accountId) => {
    try {
        if (!imageUrl) throw new Error('Image URL is required for Instagram');

        const containerUrl = `https://graph.facebook.com/v19.0/${accountId}/media`;
        const containerRes = await axios.post(containerUrl, {
            image_url: imageUrl,
            caption: content,
            access_token: accessToken
        });
        const containerId = containerRes.data.id;

        const publishUrl = `https://graph.facebook.com/v19.0/${accountId}/media_publish`;
        const publishRes = await axios.post(publishUrl, {
            creation_id: containerId,
            access_token: accessToken
        });

        return { success: true, id: publishRes.data.id, platform: 'Instagram' };
    } catch (error) {
        console.error('Instagram Post Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || 'Failed to post to Instagram');
    }
};

exports.postToWhatsApp = async (content, accessToken, phoneNumberId, to) => {
    try {
        console.log(`[WhatsApp] Posting to ${to} via ${phoneNumberId}`);
        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        
        const payload = {
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: content }
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        return { success: true, id: response.data.messages[0].id, platform: 'WhatsApp' };
    } catch (error) {
        console.error('WhatsApp Post Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || 'Failed to post to WhatsApp');
    }
};

// --- Scheduler Wrappers (High Level) ---
// These are called by scheduler.service.js with the full Post object
// Note: Currently these are MOCKS because the Post object doesn't have the User ID to fetch tokens.
// UPDATE: Post now has User ID, we should populate and use it.

exports.publishToFacebook = async (post) => {
    console.log('[Facebook] Simulating publish:', post.topic);
    return { success: true, id: 'mock_fb_id', platform: 'Facebook' };
};

exports.publishToInstagram = async (post) => {
    console.log('[Instagram] Simulating publish:', post.topic);
    return { success: true, id: 'mock_ig_id', platform: 'Instagram' };
};

exports.publishToTwitter = async (post) => {
    console.log('[Twitter] Simulating publish:', post.topic);
    return { success: true, id: 'mock_tw_id', platform: 'Twitter' };
};

exports.publishToLinkedIn = async (post) => {
    console.log('[LinkedIn] Simulating publish:', post.topic);
    return { success: true, id: 'mock_li_id', platform: 'LinkedIn' };
};

exports.publishToWhatsApp = async (post) => {
    try {
        // Attempt to fetch user credentials if available
        let accessToken = null;
        let phoneNumberId = null;

        if (post.user) {
            const User = require('../models/User');
            // If post.user is just an ID, fetch the user. If populated, use it.
            const user = post.user.connections ? post.user : await User.findById(post.user);
            
            if (user && user.connections) {
                const connection = user.connections.find(c => c.platform.toLowerCase() === 'whatsapp');
                if (connection) {
                    accessToken = connection.apiKey; // Assuming apiKey holds the Token
                    phoneNumberId = connection.identifier; // Assuming identifier holds the Phone Number ID
                }
            }
        }

        if (accessToken && phoneNumberId) {
             return await exports.postToWhatsApp(post.content, accessToken, phoneNumberId, post.targetAudience);
        }

        console.log('[WhatsApp] No credentials found. Simulating publish to Group:', post.targetAudience);
        return { success: true, id: 'mock_wa_id', platform: 'WhatsApp', note: 'Simulated (No Credentials)' };
    } catch (error) {
        console.error('Publish to WhatsApp Wrapper Error:', error.message);
        throw error;
    }
};

exports.publishToTelegram = async (post) => {
    console.log('[Telegram] Simulating publish to Channel:', post.targetAudience);
    // Real implementation would use node-telegram-bot-api here
    return { success: true, id: 'mock_tg_id', platform: 'Telegram' };
};

exports.publishToTikTok = async (post) => {
    console.log('[TikTok] Simulating publish:', post.topic);
    return { success: true, id: 'mock_tt_id', platform: 'TikTok' };
};

exports.publishToSnapchat = async (post) => {
    console.log('[Snapchat] Simulating publish:', post.topic);
    return { success: true, id: 'mock_sc_id', platform: 'Snapchat' };
};
