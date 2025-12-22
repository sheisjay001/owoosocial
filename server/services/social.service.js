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

exports.postToTwitter = async (content, accessToken) => {
    console.log('Posting to Twitter (Mock):', content);
    return { success: true, id: 'mock_twitter_id', platform: 'Twitter' };
};

// --- Scheduler Wrappers (High Level) ---
// These are called by scheduler.service.js with the full Post object
// Note: Currently these are MOCKS because the Post object doesn't have the User ID to fetch tokens.

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
    console.log('[WhatsApp] Simulating publish to Group:', post.targetAudience);
    console.log('Content:', post.content);
    // Real implementation would use Twilio Client here
    return { success: true, id: 'mock_wa_id', platform: 'WhatsApp' };
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
