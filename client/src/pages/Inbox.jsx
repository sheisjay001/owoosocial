import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, MessageCircle, User, Star, MoreVertical, Sparkles } from 'lucide-react';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/community', config);
      setConversations(response.data.data);
      if (response.data.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `/api/community/${selectedConversation.id}/reply`,
        { text: replyText },
        config
      );
      
      // Update local state
      const updatedMessages = [...selectedConversation.messages, response.data.data];
      const updatedConversation = { ...selectedConversation, messages: updatedMessages, lastMessage: `You: ${replyText}` };
      
      setSelectedConversation(updatedConversation);
      
      setConversations(conversations.map(c => 
        c.id === selectedConversation.id ? updatedConversation : c
      ));

      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleAiReply = async () => {
    if (!selectedConversation) return;
    setAiLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `/api/community/${selectedConversation.id}/ai-reply`,
        {},
        config
      );
      setReplyText(response.data.suggestion);
    } catch (error) {
      console.error('Error generating AI reply:', error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading inbox...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Inbox</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex gap-3">
                <img 
                  src={conv.avatar} 
                  alt={conv.user} 
                  className="w-10 h-10 rounded-full bg-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm font-semibold truncate ${conv.unread ? 'text-black' : 'text-gray-700'}`}>
                      {conv.user}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(conv.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conv.unread ? 'font-medium text-black' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                      conv.platform === 'facebook' ? 'bg-blue-100 text-blue-700' :
                      conv.platform === 'instagram' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {conv.platform}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                 <img 
                  src={selectedConversation.avatar} 
                  alt={selectedConversation.user} 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-bold">{selectedConversation.user}</h3>
                  <span className="text-xs text-gray-500 capitalize">{selectedConversation.platform}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <Star className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedConversation.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === 'me' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border rounded-bl-none shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <div className="mb-2 flex justify-end">
                 <button 
                    onClick={handleAiReply}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors"
                 >
                    <Sparkles className="w-3 h-3" />
                    {aiLoading ? 'Generating...' : 'Generate AI Reply'}
                 </button>
              </div>
              <form onSubmit={handleReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
