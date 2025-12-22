import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Upload, Trash2, Plus, Download, Send, MessageSquare, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function WhatsApp() {
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' or 'broadcasts'
  const [contacts, setContacts] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [showContactForm, setShowContactForm] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [newContact, setNewContact] = useState({ phoneNumber: '', name: '' });
  const [newBroadcast, setNewBroadcast] = useState({ message: '', scheduledTime: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeTab === 'contacts') fetchContacts();
    else fetchBroadcasts();
  }, [activeTab]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/whatsapp/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/whatsapp/broadcasts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBroadcasts(response.data.data);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/whatsapp/contacts', newContact, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewContact({ phoneNumber: '', name: '' });
      setShowContactForm(false);
      fetchContacts();
      alert('Contact added successfully');
    } catch (error) {
      console.error('Error adding contact:', error);
      alert(error.response?.data?.error || 'Failed to add contact');
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/whatsapp/broadcasts', newBroadcast, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewBroadcast({ message: '', scheduledTime: '' });
      setShowBroadcastForm(false);
      fetchBroadcasts();
      alert('Broadcast created successfully');
    } catch (error) {
      console.error('Error creating broadcast:', error);
      alert(error.response?.data?.error || 'Failed to create broadcast');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/whatsapp/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
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
      const response = await axios.post('/api/whatsapp/contacts/import', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message);
      fetchContacts();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert(error.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const downloadTemplate = () => {
      const csvContent = "data:text/csv;charset=utf-8,phoneNumber,name\n15551234567,John Doe";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "whatsapp_contacts_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'scheduled': return 'bg-yellow-100 text-yellow-800';
        case 'failed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Marketing</h1>
          <p className="text-gray-500">Manage contacts and send broadcasts.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => setActiveTab('contacts')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'contacts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Contacts
            </button>
            <button
                onClick={() => setActiveTab('broadcasts')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'broadcasts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Broadcasts
            </button>
        </div>
      </div>

      {activeTab === 'contacts' ? (
          <>
            <div className="flex justify-end gap-2">
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
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Add Contact
                </button>
            </div>

            {showContactForm && (
                <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Contact</h2>
                <form onSubmit={handleAddContact} className="flex gap-4 items-end">
                    <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (with country code)</label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. 15551234567"
                        className="w-full px-3 py-2 border rounded-md"
                        value={newContact.phoneNumber}
                        onChange={(e) => setNewContact({...newContact, phoneNumber: e.target.value})}
                    />
                    </div>
                    <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                        type="text" 
                        className="w-full px-3 py-2 border rounded-md"
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                    ) : contacts.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No contacts yet.</td></tr>
                    ) : (
                        contacts.map((contact) => (
                        <tr key={contact._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.phoneNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {contact.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                                onClick={() => handleDeleteContact(contact._id)}
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
          </>
      ) : (
          <>
            <div className="flex justify-end gap-2">
                <button 
                    onClick={() => fetchBroadcasts()}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
                <button 
                    onClick={() => setShowBroadcastForm(!showBroadcastForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Send className="w-4 h-4" />
                    New Broadcast
                </button>
            </div>

            {showBroadcastForm && (
                <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Create Broadcast</h2>
                <form onSubmit={handleCreateBroadcast} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                        <textarea 
                            required
                            rows="4"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newBroadcast.message}
                            onChange={(e) => setNewBroadcast({...newBroadcast, message: e.target.value})}
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">This message will be sent to all active contacts.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                        <input 
                            type="datetime-local" 
                            className="w-full px-3 py-2 border rounded-md"
                            value={newBroadcast.scheduledTime}
                            onChange={(e) => setNewBroadcast({...newBroadcast, scheduledTime: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to send immediately.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowBroadcastForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Create & Send
                        </button>
                    </div>
                </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading broadcasts...</div>
                ) : broadcasts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No broadcasts found. Create one to get started.</div>
                ) : (
                    broadcasts.map((broadcast) => (
                        <div key={broadcast._id} className="bg-white p-6 rounded-lg border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(broadcast.status)} uppercase`}>
                                            {broadcast.status}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(broadcast.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-md font-medium text-gray-900 line-clamp-1">{broadcast.message}</h3>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <div>{broadcast.processedCount} / {broadcast.totalRecipients} Sent</div>
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${broadcast.totalRecipients > 0 ? (broadcast.processedCount / broadcast.totalRecipients) * 100 : 0}%` }}
                                ></div>
                            </div>

                            <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>{broadcast.successCount} Success</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <span>{broadcast.failCount} Failed</span>
                                </div>
                                {broadcast.nextBatchTime && broadcast.status !== 'completed' && (
                                    <div className="flex items-center gap-1 text-blue-600">
                                        <Clock className="w-4 h-4" />
                                        <span>Next Batch: {new Date(broadcast.nextBatchTime).toLocaleTimeString()}</span>
                                    </div>
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
