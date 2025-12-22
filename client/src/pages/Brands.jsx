import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Loader2, Edit, Trash2, Globe, Briefcase } from 'lucide-react';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const res = await axios.get('/api/brands', config);
      setBrands(res.data.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.delete(`/api/brands/${id}`, config);
      setBrands(brands.filter(brand => brand._id !== id));
    } catch (err) {
      console.error('Error deleting brand:', err);
      alert('Failed to delete brand');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500">Manage your brand identities</p>
        </div>
        <Link 
          to="/brands/new" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4" />
          Add Brand
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      {brands.length === 0 && !error ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No brands yet</h3>
          <p className="text-gray-500 mb-4">Create your first brand identity to get started.</p>
          <Link 
            to="/brands/new" 
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-md font-medium hover:bg-blue-100"
          >
            Create Brand
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div key={brand._id} className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1">
                    {brand.industry || 'General'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(brand._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {brand.description}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500 border-t pt-4">
                {brand.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline truncate">
                      {brand.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{brand.tone} Tone</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
