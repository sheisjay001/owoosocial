const TelegramBot = require('node-telegram-bot-api');

// Initialize Telegram Bot if token exists
// Get this from @BotFather on Telegram
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;
if (telegramToken) {
  bot = new TelegramBot(telegramToken, { polling: false });
}

const socialService = {
  publishToInstagram: async (post) => {
    console.log(`[Instagram API] Uploading image: ${post.imagePrompt || 'No Image'}`);
    console.log(`[Instagram API] Setting caption: ${post.content}`);
    return { platformId: `ig_${Date.now()}`, url: `https://instagram.com/p/mock${Date.now()}` };
  },

  publishToTwitter: async (post) => {
    console.log(`[Twitter API] Tweeting: ${post.content.substring(0, 280)}`);
    return { platformId: `tw_${Date.now()}`, url: `https://twitter.com/user/status/${Date.now()}` };
  },

  publishToLinkedIn: async (post) => {
    console.log(`[LinkedIn API] Posting: ${post.content}`);
    return { platformId: `li_${Date.now()}`, url: `https://linkedin.com/feed/update/${Date.now()}` };
  },

  publishToFacebook: async (post) => {
    console.log(`[Facebook API] Posting to Page: ${post.content}`);
    return { platformId: `fb_${Date.now()}`, url: `https://facebook.com/posts/${Date.now()}` };
  },
  
  publishToTikTok: async (post) => {
    console.log(`[TikTok API] Uploading video for: ${post.topic}`);
    return { platformId: `tt_${Date.now()}`, url: `https://tiktok.com/@user/video/${Date.now()}` };
  },

  publishToSnapchat: async (post) => {
    console.log(`[Snapchat API] Posting to Story: ${post.content}`);
    return { platformId: `sc_${Date.now()}`, url: `https://snapchat.com/add/user/story/${Date.now()}` };
  },

  publishToTelegram: async (post) => {
    const chatId = post.targetAudience; // e.g., '@mychannel' or '-100123456789'
    console.log(`[Telegram API] Sending message to ${chatId}: ${post.content}`);
    
    if (bot && chatId) {
      try {
        const sentMessage = await bot.sendMessage(chatId, post.content);
        return { platformId: sentMessage.message_id, url: `https://t.me/${chatId.replace('@', '')}/${sentMessage.message_id}` };
      } catch (error) {
        console.error('[Telegram API] Error:', error.message);
        throw new Error(`Telegram Error: ${error.message}`);
      }
    } else {
      console.log('[Telegram API] Bot token or Chat ID missing. Mocking success.');
      return { platformId: `tg_${Date.now()}`, url: `https://t.me/mock/${Date.now()}` };
    }
  },

  publishToWhatsApp: async (post) => {
    const groupId = post.targetAudience; // e.g., '120363025@g.us'
    console.log(`[WhatsApp API] Sending message to Group ${groupId}: ${post.content}`);
    
    // NOTE: Real WhatsApp integration requires WhatsApp Business API or Twilio.
    // Example with Twilio (commented out):
    /*
    const client = require('twilio')(accountSid, authToken);
    await client.messages.create({
      body: post.content,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${groupId}`
    });
    */

    return { platformId: `wa_${Date.now()}`, url: `https://wa.me/mock/${Date.now()}` };
  }
};

module.exports = socialService;
