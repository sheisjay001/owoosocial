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

  useEffect(() => {
    fetchProfile();
  }, []);

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
        quietHoursEnd: user.quietHoursEnd || '07:00'
      });
      setEmailVerified(user.emailVerified || false);
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
      alert('Verification email sent! Please check your inbox.');
    } catch (err) {
      alert('Failed to send verification email');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
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
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifying}
                    className="text-blue-600 text-xs font-medium hover:text-blue-800 flex items-center"
                  >
                    {verifying ? 'Sending...' : 'Verify Now'}
                  </button>
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
