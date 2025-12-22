const { Resend } = require('resend');
const { MailService } = require('@sendgrid/mail');

// System Defaults
const systemResendKey = process.env.RESEND_API_KEY;
const systemSendGridKey = process.env.SENDGRID_API_KEY;
let systemProvider = 'mock';

if (systemResendKey && systemResendKey.startsWith('re_')) systemProvider = 'resend';
else if (systemSendGridKey && systemSendGridKey.startsWith('SG.')) systemProvider = 'sendgrid';

const getProvider = (userKeys) => {
    // 1. User Keys
    if (userKeys?.resend && userKeys.resend.startsWith('re_')) {
        return { type: 'resend', client: new Resend(userKeys.resend) };
    }
    if (userKeys?.sendgrid && userKeys.sendgrid.startsWith('SG.')) {
        const sg = new MailService();
        sg.setApiKey(userKeys.sendgrid);
        return { type: 'sendgrid', client: sg };
    }
    
    // 2. System Fallback
    if (systemProvider === 'resend') return { type: 'resend', client: new Resend(systemResendKey) };
    if (systemProvider === 'sendgrid') {
        const sg = new MailService();
        sg.setApiKey(systemSendGridKey);
        return { type: 'sendgrid', client: sg };
    }
    
    return { type: 'mock', client: null };
};

const emailService = {
  sendEmail: async (to, subject, htmlContent, sender = {}) => {
    const { type, client } = getProvider(sender.apiKeys);

    if (type === 'mock') {
      console.log(`[Mock Email Service] Sending to: ${to}`);
      console.log(`[Mock Email Service] Subject: ${subject}`);
      console.log(`[Mock Email Service] From: ${sender.name || 'System'} <${sender.email || 'noreply@system'}>`);
      return { messageId: `mock_email_${Date.now()}` };
    }

    const fromName = sender.name || 'OWOO';
    // If sender provides a specific fromEmail (e.g. verified domain), use it. Otherwise use system default.
    const fromEmail = sender.fromEmail || process.env.EMAIL_FROM_ADDRESS || (type === 'resend' ? 'onboarding@resend.dev' : 'test@example.com'); 
    const replyTo = sender.email; 

    try {
      if (type === 'resend') {
        const { data, error } = await client.emails.send({
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

      } else if (type === 'sendgrid') {
        const msg = {
          to: to,
          from: { email: fromEmail, name: fromName },
          replyTo: replyTo,
          subject: subject,
          html: htmlContent,
        };

        const response = await client.send(msg);
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
    const { type, client } = getProvider(sender.apiKeys);

    console.log(`[Newsletter Service] Starting broadcast for "${newsletter.subject}"`);
    console.log(`[Newsletter Service] Sender: ${sender.name} (${sender.email})`);
    console.log(`[Newsletter Service] Provider: ${type.toUpperCase()}`);

    if (type === 'mock') {
        // Mock Send
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[Mock Newsletter] Broadcast Complete. Sent ${subscribers.length} emails.`);
        return { campaignId: `mock_camp_${Date.now()}`, sentCount: subscribers.length };
    }

    let sentCount = 0;
    
    const fromName = sender.name || 'OWOO';
    const fromEmail = sender.fromEmail || process.env.EMAIL_FROM_ADDRESS || (type === 'resend' ? 'onboarding@resend.dev' : 'test@example.com');
    const replyTo = sender.email;

    // Send loop
    for (const subscriber of subscribers) {
        try {
            if (type === 'resend') {
                await client.emails.send({
                    from: `${fromName} <${fromEmail}>`,
                    to: [subscriber],
                    subject: newsletter.subject,
                    html: newsletter.content, 
                    reply_to: replyTo
                });
            } else if (type === 'sendgrid') {
                const msg = {
                    to: subscriber,
                    from: { email: fromEmail, name: fromName },
                    replyTo: replyTo,
                    subject: newsletter.subject,
                    html: newsletter.content,
                };
                await client.send(msg);
            }
            sentCount++;
        } catch (e) {
            console.error(`Failed to send to ${subscriber}:`, e.message);
        }
    }
    
    console.log(`[Newsletter Service] Broadcast Complete. Sent ${sentCount}/${subscribers.length} emails.`);
    return { campaignId: `camp_${Date.now()}`, sentCount };
  },

  addDomain: async (domainName, sender = {}) => {
    const { type, client } = getProvider(sender.apiKeys);

    if (type !== 'resend') {
      console.log(`[Email Service] Domain management is currently optimized for Resend. Mocking for ${type}.`);
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
      const { data, error } = await client.domains.create({ name: domainName });
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Resend Add Domain Error:', error);
      throw error;
    }
  },

  getDomain: async (domainId, sender = {}) => {
    const { type, client } = getProvider(sender.apiKeys);

    if (type !== 'resend') {
      return { id: domainId, status: 'verified', records: [] };
    }
    try {
      const { data, error } = await client.domains.get(domainId);
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Resend Get Domain Error:', error);
      throw error;
    }
  },

  verifyDomain: async (domainId, sender = {}) => {
    const { type, client } = getProvider(sender.apiKeys);
    
    if (type !== 'resend') {
      return { id: domainId, status: 'verified' };
    }
    try {
      const { data, error } = await client.domains.verify(domainId);
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Resend Verify Domain Error:', error);
      throw error;
    }
  }
};

module.exports = emailService;
