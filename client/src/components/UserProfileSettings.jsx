import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Save, Loader2, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export default function UserProfileSettings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    timezone: 'UTC',
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [polling, setPolling] = useState(false);
  const [suggestedFromEmail, setSuggestedFromEmail] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchDomainsAndSuggest = async (userEmail, currentFromEmail) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('/api/domains', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const domains = res.data.domains || res.data.data || [];
      const verified = domains.find(d => d.status === 'verified');
      if (verified) {
        const local = (userEmail || '').split('@')[0] || 'you';
        const suggestion = `${local}@${verified.domain}`;
        if (!currentFromEmail || !currentFromEmail.endsWith(`@${verified.domain}`)) {
          setSuggestedFromEmail(suggestion);
        } else {
          setSuggestedFromEmail('');
        }
      } else {
        setSuggestedFromEmail('');
      }
    } catch {
      setSuggestedFromEmail('');
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = response.data.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        timezone: user.timezone || 'UTC',
        quietHoursStart: user.quietHoursStart || '22:00',
        quietHoursEnd: user.quietHoursEnd || '07:00',
        fromEmail: user.fromEmail || ''
      });
      setEmailVerified(user.emailVerified || false);
      fetchDomainsAndSuggest(user.email, user.fromEmail);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put('/api/auth/updatedetails', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully');
      // If email changed, verification might be reset
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/auth/verifyemail', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: 'info', text: 'Verification email sent. Waiting for confirmation...' });
      setPolling(true);
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const user = response.data.data;
          if (user && user.emailVerified) {
            clearInterval(interval);
            setPolling(false);
            setEmailVerified(true);
            setToast({ type: 'success', text: 'Email verified!' });
          } else if (attempts >= 12) {
            clearInterval(interval);
            setPolling(false);
            setToast({ type: 'warning', text: 'Still not verified. Open the email link.' });
          }
        } catch (e) {
          if (attempts >= 12) {
            clearInterval(interval);
            setPolling(false);
            setToast({ type: 'warning', text: 'Verification pending. Try again later.' });
          }
        }
      }, 5000);
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to send verification email' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {toast && (
        <div className={`p-3 ${toast.type === 'success' ? 'bg-green-50 text-green-700' : toast.type === 'error' ? 'bg-red-50 text-red-700' : toast.type === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
          {toast.text}
        </div>
      )}
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">User Profile</h2>
        <p className="text-sm text-gray-500">Manage your personal information and contact details.</p>
      </div>

      <div className="p-6">
        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="john@example.com"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {emailVerified ? (
                  <span className="flex items-center text-green-600 text-xs font-medium" title="Verified">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={verifying}
                      className="text-blue-600 text-xs font-medium hover:text-blue-800 flex items-center"
                    >
                      {verifying ? 'Sending...' : 'Verify Now'}
                    </button>
                    <button
                      type="button"
                      onClick={fetchProfile}
                      className="text-gray-500 text-xs font-medium hover:text-gray-700"
                      title="Refresh status"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!emailVerified && (
              <p className="mt-1 text-xs text-amber-600 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Your email is not verified. You may be restricted from sending campaigns.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (WhatsApp)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+1234567890"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +1 for USA).</p>
          </div>

          {/* From Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Email (Newsletters)</label>
            <input
              type="email"
              value={formData.fromEmail || ''}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@verified-domain.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              To send to other recipients, verify a domain and use a from address from that domain.
            </p>
            {suggestedFromEmail && (
              <div className="mt-2 text-xs">
                <span className="text-gray-600">Suggested:</span>
                <span className="ml-1 font-mono">{suggestedFromEmail}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fromEmail: suggestedFromEmail })}
                  className="ml-2 px-2 py-1 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Use Suggestion
                </button>
              </div>
            )}
          </div>
          
          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="UTC">UTC</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Used to schedule newsletters and avoid quiet hours.</p>
          </div>

          {/* Quiet Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiet Hours Start</label>
              <input
                type="time"
                value={formData.quietHoursStart}
                onChange={(e) => setFormData({ ...formData, quietHoursStart: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiet Hours End</label>
              <input
                type="time"
                value={formData.quietHoursEnd}
                onChange={(e) => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
