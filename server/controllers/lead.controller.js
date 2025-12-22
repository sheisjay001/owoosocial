const Lead = require('../models/Lead');
const Brand = require('../models/Brand');
const User = require('../models/User');
const emailService = require('../services/email.service');
const Groq = require('groq-sdk');
const OpenAI = require('openai');

// Initialize system default Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'mock-key',
});

exports.createLead = async (req, res) => {
    try {
        const { name, email, phone, company, source } = req.body;
        
        const lead = await Lead.create({
            user: req.user.id,
            name,
            email,
            phone,
            company,
            source
        });

        // Trigger auto-generation of follow-up (optional, but good for "follow them up")
        // We won't await this to keep response fast, or we can just return the lead and let user trigger generation
        // For this requirement "it saves... and follows them up", we'll generate it immediately but not send.

        // Retrieve brand context
        const brand = await Brand.findOne({ user: req.user.id });
        
        // Generate Follow Up Content
        const generatedContent = await generateAIResponse(lead, brand, req.user.id);
        lead.aiFollowUp = generatedContent;
        await lead.save();

        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.generateFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findById(id);

        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        if (lead.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const brand = await Brand.findOne({ user: req.user.id });
        const content = await generateAIResponse(lead, brand, req.user.id);

        lead.aiFollowUp = content;
        await lead.save();

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.sendFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findById(id);

        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        if (lead.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        if (!lead.aiFollowUp) {
            return res.status(400).json({ error: 'No AI content generated yet' });
        }

        // Get sender with API keys
        let sender = {};
        try {
            sender = await User.findById(req.user.id).select('+apiKeys');
        } catch (e) {
            console.log('Error fetching sender:', e.message);
        }

        // Send Email
        await emailService.sendEmail(
            lead.email,
            `Follow up from ${sender.name || 'Us'}`, // Subject
            lead.aiFollowUp.replace(/\n/g, '<br>'), // Simple HTML conversion
            sender
        );

        lead.status = 'Contacted';
        await lead.save();

        res.status(200).json({ success: true, message: 'Follow-up sent', data: lead });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Helper: AI Generation Logic
async function generateAIResponse(lead, brand, userId) {
    const brandName = brand?.name || 'Our Company';
    const brandDesc = brand?.description || 'a leading service provider';
    const tone = brand?.tone || 'Professional';

    const prompt = `
        You are a sales representative for ${brandName}.
        Brand Description: ${brandDesc}
        
        Write a ${tone} follow-up email to a new lead.
        
        Lead Name: ${lead.name}
        Lead Company: ${lead.company || 'their company'}
        Source: ${lead.source}
        
        The email should be engaging, thank them for their interest, and propose a next step (call or demo).
        Keep it concise and human-like.
    `;

    // 1. Try User's OpenAI Key
    try {
        const user = await User.findById(userId).select('+apiKeys');
        if (user?.apiKeys?.openai && user.apiKeys.openai.startsWith('sk-')) {
            const openai = new OpenAI({ apiKey: user.apiKeys.openai });
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
        }
    } catch (e) {
        console.log('OpenAI Generation failed, falling back to Groq/Mock', e.message);
    }

    // 2. Try System Groq
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (apiKey && apiKey.startsWith('gsk_')) {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama3-8b-8192",
            });
            return completion.choices[0].message.content;
        }
    } catch (e) {
        console.log('Groq Generation failed', e.message);
    }

    // 3. Fallback Mock
    return `Hi ${lead.name},\n\nThanks for your interest in ${brandName}. We'd love to help you with your needs.\n\nBest,\n${brandName} Team`;
}
