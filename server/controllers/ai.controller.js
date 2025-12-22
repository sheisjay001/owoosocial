const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'mock-key',
});

exports.generateContent = async (req, res) => {
  try {
    const { topic, platform, tone, brandDescription } = req.body;

    if (!topic) {
        return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const getMockResponse = () => {
        const cleanTopic = topic.replace(/\s+/g, '');
        return {
          content: `🚀 Exciting news about ${topic}! We at ${brandDescription || 'our company'} are thrilled to share this.\n\n#${cleanTopic} #Innovation #Tech`,
          hashtags: ["#Innovation", `#${cleanTopic}`, "#Tech", "#Growth"],
          imagePrompt: `A futuristic and professional image representing ${topic} in a ${tone} style.`
        };
    };

    // Check if API key is missing or is a placeholder/invalid
    const apiKey = process.env.GROQ_API_KEY;
    const isInvalidKey = !apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE' || apiKey === 'mock-key' || !apiKey.startsWith('gsk_');

    if (isInvalidKey) {
      console.log('Using Mock AI Response (Invalid or missing GROQ API Key)');
      return res.status(200).json({
        success: true,
        data: getMockResponse()
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

    try {
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
    } catch (apiError) {
        console.error('Groq API Error (Falling back to mock):', apiError.message);
        return res.status(200).json({
            success: true,
            data: getMockResponse()
        });
    }

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message
    });
  }
};
