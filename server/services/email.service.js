const { Resend } = require('resend');
const { MailService } = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Ensure env is loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const getProvider = () => {
    // Reload env vars dynamically to catch updates without restart
    const systemResendKey = process.env.RESEND_API_KEY;
    const systemSendGridKey = process.env.SENDGRID_API_KEY;
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Priority: SMTP (best for "no domain" users) > Resend > SendGrid
    if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        return { type: 'smtp', client: transporter };
    }

    if (systemResendKey && systemResendKey.startsWith('re_')) {
        return { type: 'resend', client: new Resend(systemResendKey) };
    }
    if (systemSendGridKey && systemSendGridKey.startsWith('SG.')) {
        const sg = new MailService();
        sg.setApiKey(systemSendGridKey);
        return { type: 'sendgrid', client: sg };
    }
    
    return { type: 'mock', client: null };
};

const emailService = {
  sendEmail: async (to, subject, htmlContent, sender = {}) => {
    const { type, client } = getProvider();
    const allowedTestEmail = process.env.RESEND_TEST_EMAIL || 'autajoy2003@gmail.com';

    if (type === 'mock') {
      console.log(`[Mock Email Service] Sending to: ${to}`);
      console.log(`[Mock Email Service] Subject: ${subject}`);
      console.log(`[Mock Email Service] From: ${sender.name || 'System'} <${sender.email || 'noreply@system'}>`);
      return { messageId: `mock_email_${Date.now()}` };
    }

    const fromName = sender.name || 'OWOO';
    // If sender provides a specific fromEmail (e.g. verified domain), use it. 
    // For SMTP, default to the authenticated user if not specified.
    let defaultFrom = process.env.EMAIL_FROM_ADDRESS || 'test@example.com';
    if (type === 'smtp') {
        // If EMAIL_FROM_ADDRESS is not set, fallback to SMTP_USER
        if (!process.env.EMAIL_FROM_ADDRESS) {
             defaultFrom = process.env.SMTP_USER; 
        }
    } else if (type === 'resend') {
        defaultFrom = 'onboarding@resend.dev';
    }
    
    const fromEmail = sender.fromEmail || defaultFrom;
    const replyTo = sender.email; 

    try {
      if (type === 'smtp') {
        const info = await client.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: to,
            subject: subject,
            html: htmlContent,
            replyTo: replyTo
        });
        console.log(`[Email Service] Sent email to ${to} via SMTP: ${info.messageId}`);
        return info;

      } else if (type === 'resend') {
        const fromDomain = (fromEmail || '').split('@')[1];
        // Sandbox restriction: if not using verified domain, only allow test email
        if (!fromDomain || fromEmail === 'onboarding@resend.dev') {
          if (to !== allowedTestEmail) {
            throw new Error(`You can only send testing emails to your own email address (${allowedTestEmail}). To send emails to other recipients, please verify a domain at resend.com/domains, and change the from address to an email using this domain.`);
          }
        }
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
      // If it's a configuration error (like domain verification), throw it
      if (err.message && (err.message.includes('verify a domain') || err.message.includes('own email address'))) {
          throw err;
      }
      // Fallback to mock if API fails (optional, good for dev)
      return { messageId: `fallback_mock_${Date.now()}` };
    }
  },

  sendNewsletter: async (newsletter, subscribers, sender = {}) => {
    const { type, client } = getProvider();
    const allowedTestEmail = process.env.RESEND_TEST_EMAIL || 'autajoy2003@gmail.com';

    console.log(`[Newsletter Service] Starting broadcast for "${newsletter.subject}"`);
    console.log(`[Newsletter Service] Sender: ${sender.name} (${sender.email})`);
    console.log(`[Newsletter Service] Provider: ${type.toUpperCase()}`);

    if (type === 'mock') {
        // Mock Send
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[Mock Newsletter] Broadcast Complete. Sent ${subscribers.length} emails.`);
        return { campaignId: `mock_camp_${Date.now()}`, sentCount: subscribers.length, failedCount: 0, errors: [] };
    }

    let sentCount = 0;
    let failedCount = 0;
    let errors = [];
    
    const fromName = sender.name || 'OWOO';
    let defaultFrom = process.env.EMAIL_FROM_ADDRESS || 'test@example.com';
    if (type === 'smtp') {
        if (!process.env.EMAIL_FROM_ADDRESS) {
            defaultFrom = process.env.SMTP_USER;
        }
    } else if (type === 'resend') {
        defaultFrom = 'onboarding@resend.dev';
    }
    const fromEmail = sender.fromEmail || defaultFrom;
    const replyTo = sender.email;

    // Send loop
    for (const subscriber of subscribers) {
        try {
            if (type === 'smtp') {
                await client.sendMail({
                    from: `"${fromName}" <${fromEmail}>`,
                    to: subscriber,
                    subject: newsletter.subject,
                    html: newsletter.content,
                    replyTo: replyTo
                });
            } else if (type === 'resend') {
                const fromDomain = (fromEmail || '').split('@')[1];
                if (!fromDomain || fromEmail === 'onboarding@resend.dev') {
                    if (subscriber !== allowedTestEmail) {
                        throw new Error(`You can only send testing emails to your own email address (${allowedTestEmail}). To send emails to other recipients, please verify a domain at resend.com/domains, and change the from address to an email using this domain.`);
                    }
                }
                const { error } = await client.emails.send({
                    from: `${fromName} <${fromEmail}>`,
                    to: [subscriber],
                    subject: newsletter.subject,
                    html: newsletter.content, 
                    reply_to: replyTo
                });
                if (error) throw new Error(error.message);
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
            failedCount++;
            errors.push({ email: subscriber, error: e.message });
        }
    }
    
    console.log(`[Newsletter Service] Broadcast Complete. Sent ${sentCount}/${subscribers.length} emails.`);
    return { campaignId: `camp_${Date.now()}`, sentCount, failedCount, errors };
  },

  addDomain: async (domainName) => {
    const { type, client } = getProvider();

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

  getDomain: async (domainId) => {
    const { type, client } = getProvider();

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

  verifyDomain: async (domainId) => {
    const { type, client } = getProvider();
    
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
