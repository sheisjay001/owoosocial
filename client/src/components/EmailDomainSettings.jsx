import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, RefreshCw, CheckCircle, AlertTriangle, Copy, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import axios from 'axios';

export default function EmailDomainSettings() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/domains', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDomains(response.data.data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      // Fallback to empty array to prevent map errors
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/domains', { domain: newDomain }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDomain('');
      fetchDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
      setError(error.response?.data?.error || 'Failed to add domain');
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifying(id);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`/api/domains/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDomains(domains.map(d => d._id === id ? response.data.domain : d));
      }
    } catch (err) {
      console.error('Verification failed', err);
      alert('Verification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setVerifying(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this domain?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/domains/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDomains(domains.filter(d => d._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Email Domains</h2>
        <p className="text-sm text-gray-500">Verify your domains to send branded emails and newsletters.</p>
      </div>
      
      {/* Info banner when no verified domains */}
      <div className="p-4">
        {domains.filter(d => d.status === 'verified').length === 0 && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-md text-sm">
            You can only send testing emails to your own email address (autajoy2003@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the from address to an email using this domain.
          </div>
        )}
      </div>

      <div className="p-6 border-b">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Domain</h3>
        <form onSubmit={handleAddDomain} className="flex gap-4">
          <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
             </div>
             <input
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
          <button
            type="submit"
            disabled={adding || !newDomain}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      
      <div className="divide-y">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading domains...</div>
        ) : domains.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No domains added yet.</p>
          </div>
        ) : (
          domains.map((domain) => (
            <div key={domain._id} className="bg-white">
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${domain.status === 'verified' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Globe className={`w-5 h-5 ${domain.status === 'verified' ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{domain.domain}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border mt-1 ${getStatusColor(domain.status)}`}>
                      {domain.status === 'verified' && <CheckCircle className="w-3 h-3" />}
                      {domain.status === 'pending' && <RefreshCw className="w-3 h-3" />}
                      {domain.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
                      {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {domain.status !== 'verified' && (
                    <button
                      onClick={() => handleVerify(domain._id)}
                      disabled={verifying === domain._id}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                    >
                      {verifying === domain._id ? 'Checking...' : 'Verify'}
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedDomain(expandedDomain === domain._id ? null : domain._id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    {expandedDomain === domain._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(domain._id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* DNS Records */}
              {expandedDomain === domain._id && (
                <div className="p-6 bg-gray-50 border-t border-inner">
                  {domain.status === 'verified' ? (
                    <div className="flex items-center gap-2 text-green-600 bg-white border border-green-200 p-4 rounded-md">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">This domain is verified and ready to send emails.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
                        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">Verification Required</p>
                          <p>Add the following DNS records to your domain provider to verify ownership.</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto border rounded-md bg-white">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-100 text-gray-700 font-medium">
                            <tr>
                              <th className="px-4 py-2 border-b">Type</th>
                              <th className="px-4 py-2 border-b">Name</th>
                              <th className="px-4 py-2 border-b">Value</th>
                              <th className="px-4 py-2 border-b w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {domain.dnsRecords && domain.dnsRecords.map((record, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 font-mono text-xs">{record.recordType}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{record.name}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-600 break-all max-w-xs">{record.value}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => copyToClipboard(record.value)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                    title="Copy Value"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
