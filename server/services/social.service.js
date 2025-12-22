const axios = require('axios');

exports.postToFacebook = async (content, accessToken, pageId) => {
    try {
        // Facebook Graph API to post feed
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
        // Instagram Graph API: 1. Create Media Container, 2. Publish Media
        if (!imageUrl) throw new Error('Image URL is required for Instagram');

        // Step 1: Create Container
        const containerUrl = `https://graph.facebook.com/v19.0/${accountId}/media`;
        const containerRes = await axios.post(containerUrl, {
            image_url: imageUrl,
            caption: content,
            access_token: accessToken
        });
        const containerId = containerRes.data.id;

        // Step 2: Publish Container
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

// Twitter/X posting requires OAuth 1.0a or OAuth 2.0 with signing
// For simplicity, we'll start with just the placeholder or basic structure
exports.postToTwitter = async (content, accessToken) => {
    // Note: Twitter API requires complex signing (HMAC-SHA1) if using OAuth 1.0a,
    // or Bearer Token for OAuth 2.0 (if simple).
    // This is a simplified placeholder.
    console.log('Posting to Twitter (Mock):', content);
    return { success: true, id: 'mock_twitter_id', platform: 'Twitter' };
};
