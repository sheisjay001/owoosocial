const Groq = require('groq-sdk');
const OpenAI = require('openai');
const User = require('../models/User');

// System Default
const systemGroq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'mock-key',
});

// Helper: Get best available AI client
const getAIClient = async (userId) => {
    let client = { type: 'groq', instance: systemGroq, model: 'llama-3.3-70b-versatile' };
    
    // Check if system key is valid
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'mock-key' || !apiKey.startsWith('gsk_')) {
        return { type: 'mock', instance: null };
    }

    return client;
};

// 1. Core Content Generator (Enhanced)
exports.generateContent = async (req, res) => {
  const { topic, platform, tone, brandDescription } = req.body;
  try {
    const { type, instance, model } = await getAIClient(req.user?.id);

    if (type === 'mock') return res.json({ success: true, data: getMockResponse(topic, tone) });

    const prompt = `
      Act as an expert social media manager.
      Create a ${tone} post for ${platform} about "${topic}".
      Context/Brand: ${brandDescription || 'General'}
      
      Output format JSON:
      {
        "content": "The post caption/text with emojis",
        "hashtags": ["#tag1", "#tag2"],
        "imagePrompt": "A detailed description for an AI image generator"
      }
    `;

    try {
        const response = await generateText(type, instance, model, prompt);
        res.json({ success: true, data: response });
    } catch (apiError) {
        console.error('AI API Error (Falling back to mock):', apiError.message);
        res.json({ success: true, data: getMockResponse(topic, tone), note: "Mock data (API Error)" });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// 2. Caption Generator (Multiple Styles)
exports.generateCaptionVariations = async (req, res) => {
    const { topic, platform, brandDescription } = req.body;
    try {
        const { type, instance, model } = await getAIClient(req.user?.id);

        const mockData = { funny: "Mock Funny Caption for " + topic, professional: "Mock Pro Caption", trendy: "Mock Trendy Caption" };
        if (type === 'mock') return res.json({ success: true, data: mockData });

        const prompt = `
            Generate 3 distinct caption variations for a ${platform} post about "${topic}".
            Context: ${brandDescription || 'General'}
            
            1. Funny/Witty
            2. Professional/Corporate
            3. Trendy/Viral
            
            Output JSON:
            {
                "funny": "Caption...",
                "professional": "Caption...",
                "trendy": "Caption..."
            }
        `;

        try {
            const response = await generateText(type, instance, model, prompt);
            res.json({ success: true, data: response });
        } catch (apiError) {
            console.error('AI API Error (Falling back to mock):', apiError.message);
            res.json({ success: true, data: mockData, note: "Mock data (API Error)" });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// 3. Hashtag Recommender
exports.generateHashtags = async (req, res) => {
    const { topic, niche } = req.body;
    try {
        const { type, instance, model } = await getAIClient(req.user?.id);

        const mockData = { hashtags: ['#mock1', '#mock2', '#' + (topic || 'topic').replace(/\s+/g, '')] };
        if (type === 'mock') return res.json({ success: true, data: mockData });

        const prompt = `
            Suggest 30 relevant, high-reach hashtags for:
            Topic: ${topic}
            Niche: ${niche || 'General'}
            
            Output JSON:
            {
                "hashtags": ["#tag1", "#tag2", ...]
            }
        `;

        try {
            const response = await generateText(type, instance, model, prompt);
            res.json({ success: true, data: response });
        } catch (apiError) {
            console.error('AI API Error (Falling back to mock):', apiError.message);
            res.json({ success: true, data: mockData, note: "Mock data (API Error)" });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// 4. Content Calendar Assistant
exports.generateCalendar = async (req, res) => {
    const { timeframe, goals, brandDescription } = req.body; // timeframe: 'weekly' or 'monthly'
    try {
        const { type, instance, model } = await getAIClient(req.user?.id);

        const mockData = { 
            calendar: [
                { day: "Monday", topic: "Motivation", format: "Post", caption_idea: "Start the week right!" },
                { day: "Wednesday", topic: "Product", format: "Reel", caption_idea: "Check this out" },
                { day: "Friday", topic: "Fun", format: "Story", caption_idea: "Weekend vibes" }
            ] 
        };
        if (type === 'mock') return res.json({ success: true, data: mockData });

        const prompt = `
            Create a ${timeframe || 'weekly'} social media content calendar.
            Goal: ${goals || 'Engagement'}
            Brand: ${brandDescription || 'General'}
            
            Output JSON array of objects:
            {
                "calendar": [
                    { "day": "Monday", "topic": "...", "format": "Reel/Post", "caption_idea": "..." },
                    ...
                ]
            }
        `;

        try {
            const response = await generateText(type, instance, model, prompt);
            res.json({ success: true, data: response });
        } catch (apiError) {
             console.error('AI API Error (Falling back to mock):', apiError.message);
             res.json({ success: true, data: mockData, note: "Mock data (API Error)" });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// 5. Post Rewriter/Optimizer
exports.rewritePost = async (req, res) => {
    const { draft, goal } = req.body;
    try {
        const { type, instance, model } = await getAIClient(req.user?.id);

        const mockData = { 
            original: draft, 
            optimized: draft + " (Optimized by AI)", 
            improvements: ["Improved clarity", "Added keywords"] 
        };
        if (type === 'mock') return res.json({ success: true, data: mockData });

        const prompt = `
            Rewrite and optimize this social media draft for better ${goal || 'engagement'}:
            
            Draft: "${draft}"
            
            Output JSON:
            {
                "original": "${draft}",
                "optimized": "Rewritten version...",
                "improvements": ["Changed X to Y", "Added emojis"]
            }
        `;

        try {
            const response = await generateText(type, instance, model, prompt);
            res.json({ success: true, data: response });
        } catch (apiError) {
            console.error('AI API Error (Falling back to mock):', apiError.message);
            res.json({ success: true, data: mockData, note: "Mock data (API Error)" });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// 6. Carousel/Story Ideas
exports.generateCarouselIdeas = async (req, res) => {
    const { topic } = req.body;
    try {
        const { type, instance, model } = await getAIClient(req.user?.id);

        const mockData = {
            title: "5 Tips for " + topic,
            slides: [
                { slide: 1, content: "Intro to " + topic },
                { slide: 2, content: "Tip 1: Key insight" },
                { slide: 3, content: "Tip 2: Actionable advice" },
                { slide: 4, content: "Tip 3: Common mistake" },
                { slide: 5, content: "Conclusion & Call to Action" }
            ]
        };
        if (type === 'mock') return res.json({ success: true, data: mockData });

        const prompt = `
            Create a 5-7 slide educational carousel outline about "${topic}".
            
            Output JSON:
            {
                "title": "Hook Title",
                "slides": [
                    { "slide": 1, "content": "..." },
                    { "slide": 2, "content": "..." }
                ]
            }
        `;

        try {
            const response = await generateText(type, instance, model, prompt);
            res.json({ success: true, data: response });
        } catch (apiError) {
            console.error('AI API Error (Falling back to mock):', apiError.message);
            res.json({ success: true, data: mockData, note: "Mock data (API Error)" });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// 7. Multilingual Support
exports.translateCaption = async (req, res) => {
    const { caption, language } = req.body;
    console.log(`Translating to ${language}:`, caption.substring(0, 50) + '...');
    
    try {
        const { type, instance, model } = await getAIClient(req.user?.id);

        const mockData = { translated: `[Translated to ${language}] ` + caption };
        if (type === 'mock') return res.json({ success: true, data: mockData });

        const prompt = `
            Task: Translate the following social media caption into ${language}.
            
            Rules:
            1. ONLY translate to ${language}. Do not output English unless ${language} is English.
            2. Maintain the original tone and emojis.
            3. Return strictly valid JSON.
            
            Caption to translate: "${caption}"
            
            Output JSON format:
            {
                "translated": "THE_TRANSLATED_TEXT_HERE"
            }
        `;

        try {
            const response = await generateText(type, instance, model, prompt);
            res.json({ success: true, data: response });
        } catch (apiError) {
            console.error('AI API Error (Falling back to mock):', apiError.message);
            res.json({ success: true, data: mockData, note: "Mock data (API Error)" });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// 8. Image-to-Caption (Vision)
exports.imageToCaption = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const { type, instance, model } = await getAIClient(req.user?.id);

        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });

        if (type === 'openai') {
            const response = await instance.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Generate an engaging Instagram caption for this image. Include hashtags. Output JSON: { \"caption\": \"...\", \"hashtags\": [...] }" },
                            { type: "image_url", image_url: { url: imageUrl } },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
            });
            return res.json({ success: true, data: JSON.parse(response.choices[0].message.content) });
        } 
        
        // Fallback for Groq (Llama 3 is text only usually, Llama 3.2 Vision might work if configured)
        // For now, return mock or error if not supported
        if (type === 'groq') {
             // Try Llama 3.2 Vision if available, else mock
             try {
                 const completion = await instance.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Describe this image and write a caption. JSON format." },
                                { type: "image_url", image_url: { url: imageUrl } }
                            ]
                        }
                    ],
                    model: "llama-3.2-11b-vision-preview",
                    response_format: { type: "json_object" },
                 });
                 return res.json({ success: true, data: JSON.parse(completion.choices[0].message.content) });
             } catch (e) {
                 console.log('Groq Vision failed, likely not supported/enabled:', e.message);
                 return res.json({ 
                     success: true, 
                     data: { 
                         caption: "AI Vision analysis requires OpenAI Key or supported Groq model. (Mock Caption)", 
                         hashtags: ["#Mock", "#Vision"] 
                     } 
                 });
             }
        }

        return res.json({ success: true, data: { caption: "Mock Caption for Image", hashtags: [] } });

    } catch (error) {
        handleError(res, error);
    }
};

// --- Helpers ---

async function generateText(type, instance, model, prompt) {
    if (type === 'openai') {
        const completion = await instance.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: model,
            response_format: { type: "json_object" },
        });
        return JSON.parse(completion.choices[0].message.content);
    } else {
        const completion = await instance.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: model,
            response_format: { type: "json_object" },
        });
        return JSON.parse(completion.choices[0].message.content);
    }
}

function getMockResponse(topic, tone) {
    return {
        content: `[Mock] Post about ${topic} in ${tone} style.`,
        hashtags: ['#mock', '#demo'],
        imagePrompt: `A ${tone} image of ${topic}`
    };
}

function handleError(res, error) {
    console.error('AI Controller Error:', error.message);
    res.status(500).json({ 
        success: false, 
        error: error.message,
        hint: "Ensure API keys are set in Settings or .env" 
    });
}
