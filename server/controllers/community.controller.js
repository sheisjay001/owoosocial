// const Conversation = require('../models/Conversation'); // We might need a model later, but for now we'll mock or use a simple schema

// Mock Data
let mockConversations = [
  {
    id: '1',
    platform: 'facebook',
    user: 'John Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    lastMessage: 'Hey, I love your latest product!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    unread: true,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hey, I love your latest product!', timestamp: new Date(Date.now() - 1000 * 60 * 30) }
    ]
  },
  {
    id: '2',
    platform: 'instagram',
    user: 'Jane Smith',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    lastMessage: 'When is the next sale?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread: false,
    messages: [
      { id: 'm1', sender: 'user', text: 'When is the next sale?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 'm2', sender: 'me', text: 'Hi Jane! Our next sale starts on Friday.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1) }
    ]
  },
  {
    id: '3',
    platform: 'linkedin',
    user: 'Business Corp',
    avatar: 'https://ui-avatars.com/api/?name=Business+Corp',
    lastMessage: 'We would like to collaborate.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread: true,
    messages: [
        { id: 'm1', sender: 'user', text: 'We would like to collaborate.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    ]
  }
];

exports.getConversations = async (req, res) => {
    try {
        // In a real app, fetch from DB or External APIs
        res.status(200).json({ success: true, data: mockConversations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getConversationById = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = mockConversations.find(c => c.id === id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.replyToConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        
        const conversationIndex = mockConversations.findIndex(c => c.id === id);
        if (conversationIndex === -1) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const newMessage = {
            id: `m${Date.now()}`,
            sender: 'me',
            text,
            timestamp: new Date()
        };

        mockConversations[conversationIndex].messages.push(newMessage);
        mockConversations[conversationIndex].lastMessage = `You: ${text}`;
        mockConversations[conversationIndex].unread = false; // Mark as read on reply

        // In a real app, here we would call the Social Media API (FB/Insta/LinkedIn) to send the reply

        res.status(200).json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.generateAIReply = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = mockConversations.find(c => c.id === id);
        
        if (!conversation) {
             return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const lastUserMessage = conversation.messages.filter(m => m.sender === 'user').pop();
        
        // Mock AI generation
        let replySuggestion = "Thanks for reaching out!";
        if (lastUserMessage) {
            if (lastUserMessage.text.toLowerCase().includes('sale')) {
                replySuggestion = "Hi! Our next sale is coming up very soon. Stay tuned!";
            } else if (lastUserMessage.text.toLowerCase().includes('collaborate')) {
                replySuggestion = "Hello! We'd love to hear more about your collaboration proposal. Please email us at partnerships@owoo.com.";
            } else if (lastUserMessage.text.toLowerCase().includes('love')) {
                replySuggestion = "Thank you so much for the kind words! We're glad you like it.";
            }
        }

        // Simulate AI delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.status(200).json({ success: true, suggestion: replySuggestion });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
