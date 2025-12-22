const axios = require('axios');
const User = require('../models/User');

// --- Helper: Get Provider Config ---
const getProviderConfig = (platform) => {
  const redirectUri = `${process.env.APP_URL || 'http://localhost:5000'}/api/oauth/${platform}/callback`;
  
  switch (platform) {
    case 'facebook':
      return {
        authUrl: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`,
        tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        redirectUri
      };
    case 'instagram':
        return {
            authUrl: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`,
            tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
            clientId: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            redirectUri
        };
    case 'linkedin':
        return {
            authUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=r_liteprofile%20w_member_social`,
            tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            redirectUri
        };
    case 'twitter':
      // Basic structure for Twitter OAuth 2.0
      return {
        authUrl: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`,
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        redirectUri
      };
    default:
      throw new Error('Unsupported platform');
  }
};

// @desc    Initiate OAuth Flow
// @route   GET /api/oauth/:platform/login
exports.initAuth = (req, res) => {
  try {
    const { platform } = req.params;
    const config = getProviderConfig(platform);
    
    // Store user ID in session or state param if needed. 
    // For simplicity, we assume the frontend handles the redirect, 
    // but the callback needs to know WHO the user is.
    // Ideally, we pass a JWT in the 'state' parameter to verify on callback.
    const state = req.query.token || 'no_token'; // Frontend should pass the auth token here to persist session
    
    const finalUrl = `${config.authUrl}&state=${state}`;
    
    res.redirect(finalUrl);
  } catch (error) {
    console.error('OAuth Init Error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Handle OAuth Callback
// @route   GET /api/oauth/:platform/callback
exports.handleCallback = async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state } = req.query;
    const config = getProviderConfig(platform);

    if (!code) {
      return res.status(400).send('Authorization failed: No code received');
    }

    // 1. Exchange Code for Access Token
    let tokenResponse;
    if (platform === 'facebook' || platform === 'instagram') {
        tokenResponse = await axios.get(config.tokenUrl, {
            params: {
                client_id: config.clientId,
                client_secret: config.clientSecret,
                redirect_uri: config.redirectUri,
                code
            }
        });
    } else if (platform === 'linkedin') {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', config.redirectUri);
        params.append('client_id', config.clientId);
        params.append('client_secret', config.clientSecret);
        
        tokenResponse = await axios.post(config.tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    } else if (platform === 'twitter') {
        // Twitter requires POST with Basic Auth header usually or body
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
        params.append('client_id', config.clientId);
        params.append('redirect_uri', config.redirectUri);
        params.append('code_verifier', 'challenge'); // Must match init

        tokenResponse = await axios.post(config.tokenUrl, params, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(config.clientId + ':' + config.clientSecret).toString('base64')
            }
        });
    }

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // 2. Identify the User (Decode 'state' param which contains the JWT)
    // NOTE: In production, verify the JWT signature!
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
        decoded = jwt.verify(state, process.env.JWT_SECRET || 'secret_key_123');
    } catch (e) {
        // Fallback for testing if state isn't a valid JWT or if using mock
        console.log('JWT Verify failed on callback, using mock/fallback or failing');
        // If we can't identify the user, we can't save the connection.
        // For this demo, let's assume we can fail hard or redirect to login.
        return res.redirect('http://localhost:5173/settings?error=auth_failed');
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('User not found');

    // 3. Get Platform User Details (to get Page Name / ID)
    let connectionData = {
        platform,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        connectedAt: new Date()
    };

    if (platform === 'facebook') {
        // Get Pages
        const pagesRes = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${access_token}`);
        const page = pagesRes.data.data[0]; // Just take the first page for now
        if (page) {
            connectionData.platformId = page.id;
            connectionData.name = page.name;
            connectionData.accessToken = page.access_token; // Use Page Access Token, not User Token
            connectionData.identifier = page.id; 
            connectionData.apiKey = page.access_token; 
        }
    } else if (platform === 'instagram') {
        // Fetch Pages -> Then Instagram Business Account
        const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account,name,access_token&access_token=${access_token}`);
        // Find a page with an instagram_business_account
        const pageWithInsta = pagesRes.data.data.find(p => p.instagram_business_account);
        
        if (pageWithInsta) {
            connectionData.platformId = pageWithInsta.instagram_business_account.id;
            connectionData.name = `${pageWithInsta.name} (IG)`;
            connectionData.identifier = pageWithInsta.instagram_business_account.id;
            // Use Page Access Token for IG posting
            connectionData.accessToken = pageWithInsta.access_token; 
            connectionData.apiKey = pageWithInsta.access_token;
        } else {
             throw new Error('No Instagram Business Account connected to your Facebook Pages.');
        }
    } else if (platform === 'linkedin') {
        // Fetch Profile
        const profileRes = await axios.get('https://api.linkedin.com/v2/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        connectionData.platformId = profileRes.data.id;
        connectionData.name = `${profileRes.data.localizedFirstName} ${profileRes.data.localizedLastName}`;
        connectionData.identifier = profileRes.data.id;
    } else if (platform === 'twitter') {
         const userRes = await axios.get('https://api.twitter.com/2/users/me', {
             headers: { Authorization: `Bearer ${access_token}` }
         });
         connectionData.platformId = userRes.data.data.id;
         connectionData.name = userRes.data.data.name;
         connectionData.identifier = userRes.data.data.username;
    }

    // 4. Update User Connections
    // Remove existing connection for this platform
    user.connections = user.connections.filter(c => c.platform !== platform);
    user.connections.push(connectionData);
    await user.save();

    // 5. Redirect back to Frontend
    res.redirect('http://localhost:5173/settings?success=connected');

  } catch (error) {
    console.error('OAuth Callback Error:', error.response?.data || error.message);
    res.redirect(`http://localhost:5173/settings?error=${encodeURIComponent(error.message)}`);
  }
};
