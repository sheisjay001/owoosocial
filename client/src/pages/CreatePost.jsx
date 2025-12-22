import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Send, Copy, Image as ImageIcon, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [connections, setConnections] = useState([]);
  const [formData, setFormData] = useState({
    topic: '',
    platform: 'Instagram',
    tone: 'Professional',
    brandDescription: 'A leading tech company providing AI solutions.',
    targetAudience: ''
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const { data } = await axios.get('/api/auth/connections', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setConnections(data.data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleConnectionSelect = (e) => {
    const value = e.target.value;
    if (value !== 'manual') {
        setFormData({ ...formData, targetAudience: value });
    } else {
        setFormData({ ...formData, targetAudience: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/ai/generate', formData);
      setResult(response.data.data);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (statusOverride = null) => {
    if (!result) return;
    setSaving(true);

    // Determine status: override -> scheduled (if time set) -> draft
    const finalStatus = statusOverride || (scheduleTime ? 'scheduled' : 'draft');

    try {
      const payload = {
        topic: formData.topic,
        platform: formData.platform,
        content: result.content,
        hashtags: result.hashtags,
        imagePrompt: result.imagePrompt,
        scheduledTime: scheduleTime ? new Date(scheduleTime) : null,
        status: finalStatus,
        targetAudience: formData.targetAudience
      };

      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post('/api/posts', payload, config);
      alert(finalStatus === 'published' ? 'Post published successfully!' : 'Post saved successfully!');
      navigate('/calendar');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Content Generator</h1>
        <p className="text-gray-500 mt-2">Generate engaging social media posts in seconds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Post Details
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Idea</label>
              <textarea
                name="topic"
                rows="3"
                required
                placeholder="e.g. Launching our new AI feature for automation..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.topic}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  name="platform"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.platform}
                  onChange={handleChange}
                >
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>Facebook</option>
                  <option>TikTok Script</option>
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                <select
                  name="tone"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tone}
                  onChange={handleChange}
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Witty</option>
                  <option>Excited</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>

            {(formData.platform === 'WhatsApp' || formData.platform === 'Telegram') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.platform === 'WhatsApp' ? 'Select WhatsApp Group' : 'Select Telegram Channel'}
                </label>
                
                {/* Connection Dropdown */}
                <select 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  onChange={handleConnectionSelect}
                  defaultValue=""
                >
                    <option value="" disabled>-- Select Saved Connection --</option>
                    {connections
                        .filter(c => c.platform.toLowerCase() === formData.platform.toLowerCase())
                        .map((conn, idx) => (
                        <option key={idx} value={conn.identifier}>
                            {conn.name} ({conn.identifier})
                        </option>
                    ))}
                    <option value="manual">Enter Manually...</option>
                </select>

                <input
                  type="text"
                  name="targetAudience"
                  placeholder={formData.platform === 'WhatsApp' ? 'Or type Group ID e.g. 120363025@g.us' : 'Or type Chat ID e.g. @mychannel'}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.targetAudience || ''}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.platform === 'WhatsApp' 
                    ? 'Enter the Group ID where the message should be sent.' 
                    : 'Ensure the bot is an admin in the channel/group.'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Context (Optional)</label>
              <textarea
                name="brandDescription"
                rows="2"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.brandDescription}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                'Generate Content'
              )}
            </button>
          </form>
        </div>

        {/* Output Display */}
        <div className="space-y-6">
          {result ? (
            <>
              <div className="bg-white p-6 rounded-lg border shadow-sm relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Copy Text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Generated Caption</h3>
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                  {result.content}
                </div>
                
                {result.hashtags && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.hashtags.map((tag, index) => (
                      <span key={index} className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {result.imagePrompt && (
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    AI Image Prompt
                  </h3>
                  <p className="text-purple-900 text-sm italic mb-4">
                    "{result.imagePrompt}"
                  </p>
                  <div className="rounded-lg overflow-hidden shadow-sm bg-gray-200 min-h-[200px] flex items-center justify-center group/image relative">
                      <img 
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(result.imagePrompt)}`} 
                        alt="AI Generated Visualization" 
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.querySelector('.error-msg').style.display = 'block'; }}
                      />
                      <div className="error-msg hidden text-gray-500 text-sm p-4 text-center">
                          Image preview unavailable
                      </div>
                      <a 
                        href={`https://image.pollinations.ai/prompt/${encodeURIComponent(result.imagePrompt)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/image:opacity-100 transition-opacity"
                      >
                        Download / View Full
                      </a>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule for Later (Optional)</label>
                    <input 
                        type="datetime-local" 
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>

                  {!scheduleTime && (
                      <button 
                        onClick={() => handleSavePost('published')}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 h-[42px]"
                      >
                        Post Now
                      </button>
                  )}

                  <button 
                    onClick={() => handleSavePost()}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 h-[42px]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                    {scheduleTime ? 'Schedule Post' : 'Save as Draft'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg p-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-300" />
              </div>
              <p>Ready to create? Enter your topic on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
