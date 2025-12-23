import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Plus, Send, Clock, CheckCircle } from 'lucide-react';
import Subscribers from './Subscribers';

export default function Newsletters() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    scheduleTime: '',
    newRecipients: ''
  });
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    fetchNewsletters();
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/subscribers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriberCount(response.data.count || response.data.data.length || 0);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

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

      // 1. Add new recipients if any
      if (formData.newRecipients && formData.newRecipients.trim()) {
        const emails = formData.newRecipients.split(/[\n,]+/).map(e => e.trim()).filter(e => e);
        if (emails.length > 0) {
           await axios.post('/api/subscribers/bulk', { emails }, {
             headers: { Authorization: `Bearer ${token}` }
           });
           // Refresh count
           fetchSubscriberCount();
        }
      }

      // 2. Create Newsletter
      await axios.post('/api/newsletters', {
        subject: formData.subject,
        content: formData.content,
        scheduledTime: formData.scheduleTime ? new Date(formData.scheduleTime) : null,
        status: formData.scheduleTime ? 'scheduled' : 'draft',
        audience: formData.audience
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setFormData({ subject: '', content: '', scheduleTime: '', newRecipients: '', audience: 'all' });
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
      const response = await axios.post(`/api/newsletters/${id}/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const summary = response.data.summary;
      if (summary && summary.failed > 0) {
          alert(`Newsletter sent to ${summary.sent} subscribers. Failed for ${summary.failed}.`);
      } else {
          alert('Newsletter sent successfully!');
      }
      fetchNewsletters();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      const msg = error.response?.data?.error || 'Failed to send newsletter';
      alert(msg);
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
          onClick={() => {
            setShowForm(true);
            setActiveTab('campaigns');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Newsletter
        </button>
      </div>

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'campaigns' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'subscribers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('subscribers')}
        >
          Subscribers
        </button>
      </div>

      {activeTab === 'subscribers' ? (
        <Subscribers />
      ) : (
        <>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
              
              {/* Option to select All or Specific Subscribers */}
              <div className="mb-3 space-y-2">
                 <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input 
                      type="radio" 
                      name="audience" 
                      value="all"
                      checked={formData.audience !== 'list'}
                      onChange={() => setFormData({...formData, audience: 'all'})}
                    />
                    <span>All Subscribers ({subscriberCount})</span>
                 </label>
                 
                 <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input 
                      type="radio" 
                      name="audience" 
                      value="list"
                      checked={formData.audience === 'list'}
                      onChange={() => setFormData({...formData, audience: 'list'})}
                    />
                    <span>Paste Email List</span>
                 </label>
              </div>

              {formData.audience === 'list' && (
                <div className="mb-4">
                  <textarea 
                    rows="4"
                    placeholder="Paste email addresses here (comma or new line separated)..."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.newRecipients}
                    onChange={(e) => setFormData({...formData, newRecipients: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">These emails will be added to your subscriber list automatically.</p>
                </div>
              )}
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
            <div className="flex justify-end gap-3 mt-4">
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
                Create & Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Newsletter List */}
      <div className="grid gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No newsletters yet</h3>
            <p className="text-gray-500 mt-1">Create your first email campaign to get started.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Newsletter
            </button>
          </div>
        ) : (
          newsletters.map(newsletter => (
            <div key={newsletter._id} className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{newsletter.subject}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{newsletter.content}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${newsletter.status === 'sent' ? 'bg-green-100 text-green-700' : 
                      newsletter.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'}`}>
                    {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                  </span>
                  {newsletter.scheduledTime && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(newsletter.scheduledTime).toLocaleString()}
                    </span>
                  )}
                  {newsletter.sentAt && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Sent {new Date(newsletter.sentAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {newsletter.status === 'draft' && (
                  <button 
                    onClick={() => handleSendNow(newsletter._id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium"
                  >
                    <Send className="w-3 h-3" />
                    Send Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
    )}
    </div>
  );
}
