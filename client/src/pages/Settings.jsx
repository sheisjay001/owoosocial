import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Instagram, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Mail, 
  CheckCircle, 
  X,
  Music,
  Ghost,
  Globe,
  MessageCircle,
  Send,
  Loader2,
  Trash2,
  Mic,
  Video
} from 'lucide-react';

export default function Settings() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalPlatform, setModalPlatform] = useState('');
  const [formData, setFormData] = useState({ identifier: '', name: '' });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/auth/connections', config);
      setConnections(data.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform) => {
    setModalPlatform(platform);
    setFormData({ identifier: '', name: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post('/api/auth/connections', {
        platform: modalPlatform,
        identifier: formData.identifier,
        name: formData.name
      }, config);

      setShowModal(false);
      fetchConnections();
    } catch (error) {
      alert('Failed to connect account');
    }
  };

  const handleDelete = async (platform, identifier) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    try {
        const token = localStorage.getItem('authToken');
        const config = { 
            headers: { Authorization: `Bearer ${token}` },
            data: { platform, identifier }
        };
        
        await axios.delete('/api/auth/connections', config);
        fetchConnections();
    } catch (error) {
        console.error('Error removing connection:', error);
        alert('Failed to remove connection');
    }
  };

  const isConnected = (platform) => {
    return connections.find(c => c.platform.toLowerCase() === platform.toLowerCase());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings & Integrations</h1>
        <p className="text-gray-500 mt-2">Manage your connected social accounts and API keys.</p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Messaging Platforms</h2>
          <p className="text-sm text-gray-500">Connect messaging apps to broadcast to groups and channels.</p>
        </div>
        
        <div className="divide-y">
          {/* WhatsApp */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">WhatsApp</h3>
                  <p className="text-sm text-gray-500">Send messages to WhatsApp Groups.</p>
                </div>
              </div>
              <button
                onClick={() => handleConnect('WhatsApp')}
                className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
              >
                + Add Group
              </button>
            </div>
            
            {/* List Connected WhatsApp Groups */}
            <div className="space-y-2 pl-16">
              {connections.filter(c => c.platform === 'WhatsApp').map((conn, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-md text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{conn.name}</span>
                    <span className="text-gray-500 ml-2">({conn.identifier})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete(conn.platform, conn.identifier)}
                        className="text-gray-400 hover:text-red-600"
                        title="Remove Connection"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telegram */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Telegram</h3>
                  <p className="text-sm text-gray-500">Broadcast to Channels and Groups.</p>
                </div>
              </div>
              <button
                onClick={() => handleConnect('Telegram')}
                className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
              >
                + Add Channel
              </button>
            </div>

             {/* List Connected Telegram Channels */}
             <div className="space-y-2 pl-16">
              {connections.filter(c => c.platform === 'Telegram').map((conn, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-md text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{conn.name}</span>
                    <span className="text-gray-500 ml-2">({conn.identifier})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 text-xs font-medium px-2 py-1 bg-blue-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete(conn.platform, conn.identifier)}
                        className="text-gray-400 hover:text-red-600"
                        title="Remove Connection"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Social Media Connections</h2>
          <p className="text-sm text-gray-500">Connect your profiles to enable auto-posting.</p>
        </div>
        
        <div className="divide-y">
          {/* Instagram */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-50 rounded-lg text-pink-600">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Instagram</h3>
                <p className="text-sm text-gray-500">Post photos, reels, and stories.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium">
              Coming Soon
            </button>
          </div>

          {/* Facebook */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Facebook className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Facebook</h3>
                <p className="text-sm text-gray-500">Share posts to Pages and Groups.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium">
              Coming Soon
            </button>
          </div>

          {/* Twitter / X */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">X (Twitter)</h3>
                <p className="text-sm text-gray-500">Post tweets and threads.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium">
              Coming Soon
            </button>
          </div>

          {/* LinkedIn */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-700">
                <Linkedin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">LinkedIn</h3>
                <p className="text-sm text-gray-500">Share professional updates and articles.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium">
              Coming Soon
            </button>
          </div>

          {/* TikTok */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-black">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">TikTok</h3>
                <p className="text-sm text-gray-500">Upload short-form videos.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium">
              Coming Soon
            </button>
          </div>

          {/* Snapchat */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-500">
                <Ghost className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Snapchat</h3>
                <p className="text-sm text-gray-500">Share stories and snaps.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium">
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Podcast Distribution</h2>
          <p className="text-sm text-gray-500">Connect platforms to auto-distribute your episodes.</p>
        </div>
        
        <div className="divide-y">
          {/* Spotify */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Spotify for Podcasters</h3>
                  <p className="text-sm text-gray-500">Distribute to Spotify.</p>
                </div>
              </div>
              {isConnected('Spotify') ? (
                <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete('Spotify', isConnected('Spotify').identifier)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                <button
                    onClick={() => handleConnect('Spotify')}
                    className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                    Connect
                </button>
              )}
            </div>
          </div>

          {/* Apple Podcasts */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Apple Podcasts</h3>
                  <p className="text-sm text-gray-500">Distribute to Apple Podcasts Connect.</p>
                </div>
              </div>
              {isConnected('Apple') ? (
                <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete('Apple', isConnected('Apple').identifier)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                <button
                    onClick={() => handleConnect('Apple')}
                    className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                    Connect
                </button>
              )}
            </div>
          </div>

          {/* YouTube */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">YouTube</h3>
                  <p className="text-sm text-gray-500">Upload video podcasts to YouTube.</p>
                </div>
              </div>
              {isConnected('YouTube') ? (
                <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete('YouTube', isConnected('YouTube').identifier)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                <button
                    onClick={() => handleConnect('YouTube')}
                    className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                    Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Connect {modalPlatform}</h3>
            
            <div className="bg-blue-50 p-4 rounded-md mb-4 text-sm text-blue-800">
                <h4 className="font-semibold mb-1">How to Connect:</h4>
                {modalPlatform === 'Telegram' ? (
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Open Telegram and search for our bot (e.g. <strong>@OwooSchedulerBot</strong>).</li>
                        <li>Add the bot to your Channel/Group as an <strong>Administrator</strong>.</li>
                        <li>Enter your Channel Username (e.g. @mychannel) or Chat ID below.</li>
                    </ol>
                ) : modalPlatform === 'WhatsApp' ? (
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Create a WhatsApp Group.</li>
                        <li>Add our verified business number to the group.</li>
                        <li>Use a tool or bot command to find the unique <strong>Group ID</strong> (ending in @g.us).</li>
                        <li>Paste the Group ID below.</li>
                    </ol>
                ) : (
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Log in to your {modalPlatform} Developer/Creator Portal.</li>
                        <li>Generate a new <strong>API Key</strong> or <strong>Client Secret</strong>.</li>
                        <li>Ensure the key has 'Write' permissions.</li>
                        <li>Paste the API Key below.</li>
                    </ol>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modalPlatform === 'WhatsApp' ? 'Group Name (Friendly Name)' : 
                   modalPlatform === 'Telegram' ? 'Channel Name (Friendly Name)' : 
                   'Account Name'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g. Official Account"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modalPlatform === 'WhatsApp' ? 'Group ID' : 
                   modalPlatform === 'Telegram' ? 'Chat ID / Username' : 
                   'API Key / Token'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={
                      modalPlatform === 'WhatsApp' ? 'e.g. 120363025@g.us' : 
                      modalPlatform === 'Telegram' ? 'e.g. @mychannel' :
                      'e.g. sk_live_...'
                  }
                  value={formData.identifier}
                  onChange={e => setFormData({...formData, identifier: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}