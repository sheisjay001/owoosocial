const { Resend } = require('resend');
const sgMail = require('@sendgrid/mail');

// Initialize Provider based on available keys
// Priority: Resend > SendGrid > Mock
const resendApiKey = process.env.RESEND_API_KEY;
const sendgridApiKey = process.env.SENDGRID_API_KEY;

let activeProvider = 'mock';
let resend = null;

if (resendApiKey && resendApiKey.startsWith('re_')) {
  activeProvider = 'resend';
  resend = new Resend(resendApiKey);
  console.log('[Email Service] Using Provider: Resend');
} else if (sendgridApiKey && sendgridApiKey.startsWith('SG.')) {
  activeProvider = 'sendgrid';
  sgMail.setApiKey(sendgridApiKey);
  console.log('[Email Service] Using Provider: SendGrid');
} else {
  console.log('[Email Service] Using Provider: Mock (No API Keys found)');
}

const emailService = {
  sendEmail: async (to, subject, htmlContent, sender = {}) => {
    if (activeProvider === 'mock') {
      console.log(`[Mock Email Service] Sending to: ${to}`);
      console.log(`[Mock Email Service] Subject: ${subject}`);
      console.log(`[Mock Email Service] From: ${sender.name || 'System'} <${sender.email || 'noreply@system'}>`);
      return { messageId: `mock_email_${Date.now()}` };
    }

    const fromName = sender.name || 'OWOO';
    // If sender provides a specific fromEmail (e.g. verified domain), use it. Otherwise use system default.
    const fromEmail = sender.fromEmail || process.env.EMAIL_FROM_ADDRESS || (activeProvider === 'resend' ? 'onboarding@resend.dev' : 'test@example.com'); 
    const replyTo = sender.email; // The user's actual email

    try {
      if (activeProvider === 'resend') {
        const { data, error } = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject: subject,
          html: htmlContent,
          reply_to: replyTo, 
        });

        if (error) {
          console.error('Resend API Error:', error);
          throw new Error(error.message);
        }
        console.log(`[Email Service] Sent email to ${to}: ${data.id}`);
        return data;

      } else if (activeProvider === 'sendgrid') {
        const msg = {
          to: to,
          from: {
            email: fromEmail,
            name: fromName
          },
          replyTo: replyTo,
          subject: subject,
          html: htmlContent,
        };

        const response = await sgMail.send(msg);
        console.log(`[Email Service] Sent email to ${to} via SendGrid`);
        return { id: response[0].headers['x-message-id'] || 'sent' };
      }

    } catch (err) {
      console.error('Email Service Error:', err);
      // Fallback to mock if API fails (optional, good for dev)
      return { messageId: `fallback_mock_${Date.now()}` };
    }
  },

  sendNewsletter: async (newsletter, subscribers, sender = {}) => {
    console.log(`[Newsletter Service] Starting broadcast for "${newsletter.subject}"`);
    console.log(`[Newsletter Service] Sender: ${sender.name} (${sender.email})`);
    console.log(`[Newsletter Service] Target Audience Size: ${subscribers.length}`);

    if (activeProvider === 'mock') {
        // Mock Send
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[Mock Newsletter] Broadcast Complete. Sent ${subscribers.length} emails.`);
        return { campaignId: `mock_camp_${Date.now()}`, sentCount: subscribers.length };
    }

    let sentCount = 0;
    
    const fromName = sender.name || 'OWOO';
    const fromEmail = sender.fromEmail || process.env.EMAIL_FROM_ADDRESS || (activeProvider === 'resend' ? 'onboarding@resend.dev' : 'test@example.com');
    const replyTo = sender.email;

    // NOTE: For Systeme.io integration, this is where you would trigger a campaign via their API
    // instead of sending individual emails.
    // e.g., await axios.post('https://systeme.io/api/campaigns/trigger', { email: subscriber });

    // Send loop
    for (const subscriber of subscribers) {
        try {
            if (activeProvider === 'resend') {
                await resend.emails.send({
                    from: `${fromName} <${fromEmail}>`,
                    to: [subscriber],
                    subject: newsletter.subject,
                    html: newsletter.content, 
                    reply_to: replyTo
                });
            } else if (activeProvider === 'sendgrid') {
                const msg = {
                    to: subscriber,
                    from: { email: fromEmail, name: fromName },
                    replyTo: replyTo,
                    subject: newsletter.subject,
                    html: newsletter.content,
                };
                await sgMail.send(msg);
            }
            sentCount++;
        } catch (e) {
            console.error(`Failed to send to ${subscriber}:`, e.message);
        }
    }
    
    console.log(`[Newsletter Service] Broadcast Complete. Sent ${sentCount}/${subscribers.length} emails.`);
    return { campaignId: `camp_${Date.now()}`, sentCount };
  },

  addDomain: async (domainName) => {
    if (activeProvider !== 'resend') {
      console.log(`[Email Service] Domain management is currently optimized for Resend. Mocking for ${activeProvider}.`);
      return {
        id: `mock_domain_${Date.now()}`,
        name: domainName,
        status: 'pending',
        records: [
          { record: 'CNAME', name: `s1._domainkey.${domainName}`, value: 's1.domainkey.u123456.wl.sendgrid.net', type: 'CNAME', ttl: 'Auto' },
          { record: 'CNAME', name: `em1234.${domainName}`, value: 'u123456.wl.sendgrid.net', type: 'CNAME', ttl: 'Auto' },
        ],
        region: 'global'
      };
    }
    try {
      const { data, error } = await resend.domains.create({ name: domainName });
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Resend Add Domain Error:', error);
      throw error;
    }
  },

  getDomain: async (domainId) => {
    if (activeProvider !== 'resend') {
      return { id: domainId, status: 'verified', records: [] };
    }
    try {
      const { data, error } = await resend.domains.get(domainId);
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Resend Get Domain Error:', error);
      throw error;
    }
  },

  verifyDomain: async (domainId) => {
    if (activeProvider !== 'resend') {
      return { id: domainId, status: 'verified' };
    }
    try {
      const { data, error } = await resend.domains.verify(domainId);
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Resend Verify Domain Error:', error);
      throw error;
    }
  }
};

module.exports = emailService;
