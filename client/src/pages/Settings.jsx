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
  const [formData, setFormData] = useState({ identifier: '', name: '', apiKey: '' });

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
    setFormData({ identifier: '', name: '', apiKey: '' });
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
        name: formData.name,
        apiKey: formData.apiKey
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

      <EmailDomainSettings />

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Messaging Apps</h2>
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
          {/* X */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black rounded-lg text-white">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">X</h3>
                <p className="text-sm text-gray-500">Connect your X account.</p>
              </div>
            </div>
            {isConnected('Twitter') ? (
                <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete('Twitter', isConnected('Twitter').identifier)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        const token = localStorage.getItem('authToken');
                        window.location.href = `/api/oauth/twitter/login?token=${token}`;
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                    Connect
                </button>
            )}
          </div>

          {/* Facebook Pages */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Facebook className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Facebook Pages</h3>
                <p className="text-sm text-gray-500">Connect your Facebook Pages.</p>
              </div>
            </div>
            {isConnected('Facebook') ? (
                <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete('Facebook', isConnected('Facebook').identifier)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        const token = localStorage.getItem('authToken');
                        window.location.href = `/api/oauth/facebook/login?token=${token}`;
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                    Connect
                </button>
            )}
          </div>

          {/* Instagram Business */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-50 rounded-lg text-pink-600">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Instagram Business</h3>
                <p className="text-sm text-gray-500">Connect your Instagram Business account.</p>
              </div>
            </div>
            {isConnected('Instagram') ? (
                <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete('Instagram', isConnected('Instagram').identifier)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        const token = localStorage.getItem('authToken');
                        window.location.href = `/api/oauth/instagram/login?token=${token}`;
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                    Connect
                </button>
            )}
          </div>

          {/* LinkedIn */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-700">
                <Linkedin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">LinkedIn</h3>
                <p className="text-sm text-gray-500">Connect your LinkedIn profile or page.</p>
              </div>
            </div>
            {isConnected('LinkedIn') ? (
                <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Connected</span>
                    <button 
                        onClick={() => handleDelete('LinkedIn', isConnected('LinkedIn').identifier)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        const token = localStorage.getItem('authToken');
                        window.location.href = `/api/oauth/linkedin/login?token=${token}`;
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                    Connect
                </button>
            )}
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
            
            {(modalPlatform === 'Facebook' || modalPlatform === 'Instagram' || modalPlatform === 'Twitter' || modalPlatform === 'LinkedIn' || modalPlatform === 'Spotify' || modalPlatform === 'YouTube') ? (
               <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
                    <p className="font-medium">Connect your {modalPlatform} account securely.</p>
                    <p className="mt-1">You will be redirected to {modalPlatform} to authorize this app.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                        const token = localStorage.getItem('authToken');
                        window.location.href = `/api/oauth/${modalPlatform.toLowerCase()}/login?token=${token}`;
                    }}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    Connect with {modalPlatform}
                  </button>
                  
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
               </div>
            ) : (
             <>
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
                        <li><strong>Step 1:</strong> Go to <a href="https://developers.facebook.com/apps" target="_blank" className="underline font-bold text-blue-600">Meta Developers</a>.</li>
                        <li>Select your App &gt; WhatsApp &gt; API Setup.</li>
                        <li>Copy the <strong>Phone Number ID</strong> and paste it in the "Phone Number ID" field below.</li>
                        <li>Copy the <strong>Temporary/Permanent Access Token</strong> and paste it in the "Access Token" field below.</li>
                        <li><strong>Step 2 (For Group Sending):</strong></li>
                        <li>Open WhatsApp Web, right-click the Group Name, select Inspect.</li>
                        <li>Search for <code>@g.us</code> to find the Group ID (e.g. <code>123...@g.us</code>).</li>
                        <li>Use this Group ID when creating a post in the "Target Audience" field.</li>
                    </ol>
                ) : (modalPlatform === 'Facebook' || modalPlatform === 'Instagram') ? (
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Meta Developers</a>.</li>
                        <li>Create a Business App and add <strong>{modalPlatform} Graph API</strong>.</li>
                        <li>Generate a <strong>Page Access Token</strong> via Graph Explorer.</li>
                        <li>Paste the Token below.</li>
                    </ol>
                ) : modalPlatform === 'Twitter' ? (
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">X Developer Portal</a>.</li>
                        <li>Create a Project & App with <strong>Read & Write</strong> permissions.</li>
                        <li>Generate <strong>Access Token & Secret</strong>.</li>
                        <li>Paste the Access Token below.</li>
                    </ol>
                ) : (
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Log in to your {modalPlatform} Developer Portal.</li>
                        <li>Generate a new <strong>API Key</strong> or <strong>Access Token</strong>.</li>
                        <li>Ensure the key has 'Write' permissions.</li>
                        <li>Paste the Key below.</li>
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
                  {modalPlatform === 'WhatsApp' ? 'Phone Number ID' : 
                   modalPlatform === 'Telegram' ? 'Chat ID / Username' : 
                   'Username / Page ID'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={
                      modalPlatform === 'WhatsApp' ? 'e.g. 100561234567890' : 
                      modalPlatform === 'Telegram' ? 'e.g. @mychannel' : 
                      'e.g. mypage_123'
                  }
                  value={formData.identifier}
                  onChange={e => setFormData({...formData, identifier: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modalPlatform === 'WhatsApp' ? 'Verify Token (Optional)' : 
                   modalPlatform === 'Telegram' ? 'Bot Token (Optional if Global)' : 
                   'Access Token / API Key'}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Paste your secret key/token here"
                  value={formData.apiKey}
                  onChange={e => setFormData({...formData, apiKey: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                   Your keys are encrypted and stored securely.
                </p>
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
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}