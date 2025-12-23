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
        console.log(`[WhatsApp] Posting to ${to} via PhoneID: ${phoneNumberId}`);
        // Log first few chars of token for debug
        console.log(`[WhatsApp] Token Start: ${accessToken ? accessToken.substring(0, 10) + '...' : 'MISSING'}`);

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
        
        console.log('[WhatsApp] API Success:', response.data);
        return { success: true, id: response.data.messages[0].id, platform: 'WhatsApp' };
    } catch (error) {
        console.error('WhatsApp Post Error Full:', JSON.stringify(error.response?.data || error.message, null, 2));
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
            
            if (user) {
                console.log('[WhatsApp Wrapper] User found:', user._id);
                if (user.connections) {
                    const connection = user.connections.find(c => c.platform.toLowerCase() === 'whatsapp');
                    if (connection) {
                        console.log('[WhatsApp Wrapper] Connection found for WhatsApp');
                        accessToken = connection.apiKey;
                        phoneNumberId = connection.identifier;
                        
                        if (!accessToken || !phoneNumberId) {
                            throw new Error('WhatsApp configuration incomplete. Missing Access Token or Phone Number ID in Settings.');
                        }
                    } else {
                        console.log('[WhatsApp Wrapper] User has no WhatsApp connection');
                    }
                }
            } else {
                console.log('[WhatsApp Wrapper] User not found in DB');
            }
        } else {
            console.log('[WhatsApp Wrapper] Post has no user linked');
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

const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');

exports.publishToTelegram = async (post) => {
    try {
        console.log('[Telegram] Publishing post:', post._id);

        // 1. Get the User and Connection
        const user = await User.findById(post.user);
        if (!user) throw new Error('User not found for this post');

        const connection = user.connections.find(c => c.platform.toLowerCase() === 'telegram');
        if (!connection) throw new Error('User does not have a connected Telegram account');

        // 2. Determine Chat ID (Target)
        // Prefer post-specific target, fallback to connection default
        const chatId = post.targetAudience || connection.identifier;
        if (!chatId) throw new Error('No Chat ID (Channel/Group) specified');

        // 3. Determine Bot Token
        // User MUST provide their own bot token
        const token = connection.apiKey;
        if (!token) throw new Error('No Telegram Bot Token provided. Please add your Bot Token in Settings.');

        // 4. Send Message
        const bot = new TelegramBot(token, { polling: false });
        
        let sentMessage;
        
        // Handle Image/Media if present (Assuming post.imagePrompt stores URL or we have an imageUrl field - checking Post model, it has imagePrompt but maybe not final URL. 
        // Usually 'content' is text. If there's media, we might need a different field. 
        // For now, we'll send text. If there's an image URL in content or separate, we'd handle it.)
        
        // Simple text message
        sentMessage = await bot.sendMessage(chatId, post.content, { parse_mode: 'Markdown' });

        console.log('[Telegram] Published successfully:', sentMessage.message_id);
        
        return { 
            success: true, 
            id: sentMessage.message_id.toString(), 
            platform: 'Telegram',
            url: `https://t.me/${chatId.replace('@', '')}/${sentMessage.message_id}` // Construct link if public channel
        };

    } catch (error) {
        console.error('[Telegram] Publish Error:', error.message);
        // Return object instead of throw to avoid crashing scheduler loop, or let scheduler handle it?
        // Scheduler catch block handles it.
        throw error;
    }
};

exports.publishToTikTok = async (post) => {
    console.log('[TikTok] Simulating publish:', post.topic);
    return { success: true, id: 'mock_tt_id', platform: 'TikTok' };
};

exports.publishToSnapchat = async (post) => {
    console.log('[Snapchat] Simulating publish:', post.topic);
    return { success: true, id: 'mock_sc_id', platform: 'Snapchat' };
};
