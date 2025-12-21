import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, RefreshCw, CheckCircle, AlertTriangle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

export default function Domains() {
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
      setDomains(response.data.data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/domains', { domain: newDomain }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDomain('');
      fetchDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
      alert('Failed to add domain');
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
    // Could add toast here
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
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
        <p className="text-gray-500 mt-2">Verify your domains to send branded emails and newsletters.</p>
      </div>

      {/* Add Domain Form */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Domain</h2>
        <form onSubmit={handleAddDomain} className="flex gap-4">
          <input
            type="text"
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={adding || !newDomain}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Domain
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Domain List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading domains...</p>
        ) : domains.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No domains added yet.</p>
          </div>
        ) : (
          domains.map((domain) => (
            <div key={domain._id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">{domain.domain}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(domain.status)}`}>
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
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      {verifying === domain._id ? 'Checking...' : 'Verify Status'}
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
                    className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* DNS Records */}
              {expandedDomain === domain._id && (
                <div className="p-6 border-t">
                  {domain.status === 'verified' ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-md">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">This domain is verified and ready to send emails.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-md">
                        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">Verification Required</p>
                          <p>Add the following DNS records to your domain provider (GoDaddy, Namecheap, etc.) to verify ownership.</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                              <th className="px-4 py-2">Type</th>
                              <th className="px-4 py-2">Name</th>
                              <th className="px-4 py-2">Value</th>
                              <th className="px-4 py-2 w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y border">
                            {domain.dnsRecords && domain.dnsRecords.map((record, idx) => (
                              <tr key={idx} className="bg-white">
                                <td className="px-4 py-3 font-mono">{record.recordType}</td>
                                <td className="px-4 py-3 font-mono text-gray-600">{record.name}</td>
                                <td className="px-4 py-3 font-mono text-gray-600 break-all max-w-md">{record.value}</td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => copyToClipboard(record.value)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                    title="Copy Value"
                                  >
                                    <Copy className="w-4 h-4" />
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