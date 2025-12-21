import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Plus, Send, Clock, CheckCircle } from 'lucide-react';

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    scheduleTime: ''
  });

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/newsletters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewsletters(response.data.data);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/newsletters', {
        subject: formData.subject,
        content: formData.content,
        scheduledTime: formData.scheduledTime ? new Date(formData.scheduledTime) : null,
        status: formData.scheduledTime ? 'scheduled' : 'draft',
        audience: formData.audience
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setFormData({ subject: '', content: '', scheduledTime: '', audience: 'all' });
      fetchNewsletters();
      alert('Newsletter created successfully!');
    } catch (error) {
      console.error('Error creating newsletter:', error);
      alert('Failed to create newsletter');
    }
  };

  const handleSendNow = async (id) => {
    if (!confirm('Are you sure you want to send this newsletter now?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/newsletters/${id}/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Newsletter sent!');
      fetchNewsletters();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('Failed to send newsletter');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Newsletters</h1>
          <p className="text-gray-500">Manage and schedule your email campaigns.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Newsletter
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">New Campaign</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea 
                rows="6"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
              <input 
                type="datetime-local" 
                className="w-full px-3 py-2 border rounded-md"
                value={formData.scheduleTime}
                onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Campaign
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No newsletters yet</h3>
            <p className="text-gray-500 mt-1">Create your first email campaign.</p>
          </div>
        ) : (
          newsletters.map((newsletter) => (
            <div key={newsletter._id} className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{newsletter.subject}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{newsletter.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                      newsletter.status === 'sent' ? 'bg-green-100 text-green-800' :
                      newsletter.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {newsletter.status}
                    </span>
                    {newsletter.scheduledTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(newsletter.scheduledTime).toLocaleString()}
                      </span>
                    )}
                    {newsletter.sentAt && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Sent on {new Date(newsletter.sentAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {newsletter.status === 'draft' && (
                  <button 
                    onClick={() => handleSendNow(newsletter._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
                  >
                    <Send className="w-4 h-4" />
                    Send Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
