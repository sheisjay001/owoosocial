import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, Plus, Calendar, Play, FileText, CheckCircle, BarChart2 } from 'lucide-react';

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});
  const [expandedAnalytics, setExpandedAnalytics] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    scheduledTime: '',
    platforms: ['spotify']
  });

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/podcasts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPodcasts(response.data.data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        topic: formData.topic,
        scheduledTime: formData.scheduledTime ? new Date(formData.scheduledTime) : null,
        status: formData.scheduledTime ? 'scheduled' : 'draft',
        platforms: formData.platforms
      };
      
      const token = localStorage.getItem('authToken');
      await axios.post('/api/podcasts', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Podcast episode created successfully!');
      setShowForm(false);
      setFormData({ title: '', topic: '', scheduledTime: '', platforms: ['spotify'] });
      fetchPodcasts();
    } catch (error) {
      console.error('Error creating podcast:', error);
      alert('Failed to create podcast');
    }
  };

  const generateScript = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/podcasts/${id}/script`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Script generated successfully!');
      fetchPodcasts();
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (id) => {
    if (expandedAnalytics === id) {
        setExpandedAnalytics(null);
        return;
    }

    try {
      if (!analyticsData[id]) {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`/api/podcasts/${id}/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAnalyticsData(prev => ({ ...prev, [id]: response.data.data }));
      }
      setExpandedAnalytics(id);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to load analytics');
    }
  };

  const handlePlatformChange = (platform) => {
    setFormData(prev => {
      const platforms = prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform];
      return { ...prev, platforms };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Podcast Management</h1>
          <p className="text-gray-500">Plan, script, and distribute your podcast episodes.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Episode
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Plan New Episode</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Episode Title</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Theme</label>
              <input 
                type="text" 
                required
                placeholder="e.g. The Future of AI Marketing"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Platforms</label>
              <div className="flex gap-4">
                {['spotify', 'apple', 'youtube'].map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.platforms.includes(p)}
                      onChange={() => handlePlatformChange(p)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize text-sm text-gray-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Recording/Publishing</label>
              <input 
                type="datetime-local" 
                className="w-full px-3 py-2 border rounded-md"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
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
                Create Plan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div>Loading episodes...</div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No episodes yet</h3>
            <p className="text-gray-500 mt-1">Start by planning your first episode.</p>
          </div>
        ) : (
          podcasts.map((podcast) => (
            <div key={podcast._id} className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                      podcast.status === 'published' ? 'bg-green-100 text-green-800' :
                      podcast.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {podcast.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Platforms: {podcast.platforms.join(', ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{podcast.title}</h3>
                  <p className="text-gray-600 mt-1 text-sm">Topic: {podcast.topic}</p>
                  
                  {podcast.script && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto border">
                      {podcast.script}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {!podcast.script && (
                    <button 
                      onClick={() => generateScript(podcast._id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md border border-purple-200 w-full justify-center"
                    >
                      <FileText className="w-4 h-4" />
                      Generate Script
                    </button>
                  )}
                  {podcast.status === 'published' && (
                    <>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md border border-green-200 w-full justify-center cursor-default">
                      <CheckCircle className="w-4 h-4" />
                      Published
                    </button>
                    <button 
                      onClick={() => fetchAnalytics(podcast._id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200 w-full justify-center"
                    >
                      <BarChart2 className="w-4 h-4" />
                      {expandedAnalytics === podcast._id ? 'Hide Analytics' : 'View Analytics'}
                    </button>
                    </>
                  )}
                </div>
              </div>

              {expandedAnalytics === podcast._id && analyticsData[podcast._id] && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <BarChart2 className="w-5 h-5 text-blue-600" /> Episode Analytics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-sm text-gray-500 font-medium">Total Downloads</div>
                      <div className="text-2xl font-bold text-gray-900">{analyticsData[podcast._id].totalDownloads.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-sm text-gray-500 font-medium">Unique Listeners</div>
                      <div className="text-2xl font-bold text-gray-900">{analyticsData[podcast._id].uniqueListeners.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-sm text-gray-500 font-medium">Avg. Listen Time</div>
                      <div className="text-2xl font-bold text-gray-900">{analyticsData[podcast._id].averageListenTime}%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-700">Platform Distribution</div>
                    {Object.entries(analyticsData[podcast._id].platformStats).map(([platform, stats]) => {
                      const count = stats.downloads || stats.views || 0;
                      const total = analyticsData[podcast._id].totalDownloads;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={platform} className="flex items-center gap-3 text-sm">
                          <div className="w-24 capitalize text-gray-600 font-medium">{platform}</div>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                platform === 'spotify' ? 'bg-green-500' :
                                platform === 'youtube' ? 'bg-red-500' :
                                platform === 'apple' ? 'bg-purple-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-16 text-right text-gray-600 font-mono">{Math.round(percentage)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
