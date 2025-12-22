import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Upload, Trash2, Plus, Download } from 'lucide-react';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ email: '', name: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/subscribers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribers(response.data.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/subscribers', newSubscriber, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewSubscriber({ email: '', name: '' });
      setShowForm(false);
      fetchSubscribers();
      alert('Subscriber added successfully');
    } catch (error) {
      console.error('Error adding subscriber:', error);
      alert(error.response?.data?.error || 'Failed to add subscriber');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/subscribers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Failed to delete subscriber');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please upload a valid CSV file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('/api/subscribers/upload-csv', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message);
      fetchSubscribers();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert(error.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = null;
    }
  };

  const downloadTemplate = () => {
      const csvContent = "data:text/csv;charset=utf-8,email,name\nexample@domain.com,John Doe";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "subscribers_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-500">Manage your email audience.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
                <Download className="w-4 h-4" />
                Template
            </button>
            <label className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Import CSV'}
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                <Plus className="w-4 h-4" />
                Add Manually
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Subscriber</h2>
          <form onSubmit={handleAddSubscriber} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-3 py-2 border rounded-md"
                value={newSubscriber.email}
                onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md"
                value={newSubscriber.name}
                onChange={(e) => setNewSubscriber({...newSubscriber, name: e.target.value})}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
            ) : subscribers.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No subscribers yet. Import a CSV or add one manually.</td>
                </tr>
            ) : (
                subscribers.map((sub) => (
                <tr key={sub._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                        onClick={() => handleDelete(sub._id)}
                        className="text-red-600 hover:text-red-900"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
