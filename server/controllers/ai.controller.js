const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'mock-key',
});

exports.generateContent = async (req, res) => {
  try {
    const { topic, platform, tone, brandDescription } = req.body;

    // Check if API key is missing or is a placeholder/invalid
    const apiKey = process.env.GROQ_API_KEY;
    const isInvalidKey = !apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE' || apiKey === 'mock-key' || !apiKey.startsWith('gsk_');

    if (isInvalidKey) {
      console.log('Using Mock AI Response (Invalid or missing GROQ API Key)');
      // Mock response if no valid API key is provided
      return res.status(200).json({
        success: true,
        data: {
          content: `[MOCK AI RESPONSE - GROQ]\n\nHere is a ${tone} post for ${platform} about "${topic}":\n\n🚀 exciting news about ${topic}! We at ${brandDescription || 'our company'} are thrilled to share this.\n\n#${topic.replace(/\s+/g, '')} #Innovation #Tech`,
          hashtags: ["#Innovation", `#${topic.replace(/\s+/g, '')}`, "#Tech", "#Growth"],
          imagePrompt: `A futuristic and professional image representing ${topic} in a ${tone} style.`
        }
      });
    }

    const prompt = `
      Act as an expert social media manager.
      Create a ${tone} post for ${platform} about "${topic}".
      Context/Brand Description: ${brandDescription}
      
      Output format JSON:
      {
        "content": "The post caption/text with emojis",
        "hashtags": ["#tag1", "#tag2"],
        "imagePrompt": "A detailed description for an AI image generator"
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message
    });
  }
};
