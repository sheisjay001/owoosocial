import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Calendar() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData("postId");
    const post = posts.find(p => p._id === postId);
    
    if (post) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.put(`/api/posts/${postId}`, {
          scheduledTime: date
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPosts();
      } catch (error) {
        console.error('Error updating post:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-500">Manage your scheduled and published posts.</p>
        </div>
        <button 
          onClick={() => window.location.href='/create'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Schedule New Post
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading calendar...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No posts scheduled</h3>
          <p className="text-gray-500 mt-1">Start by creating your first AI-generated post.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div 
              key={post._id} 
              draggable
              onDragStart={(e) => e.dataTransfer.setData("postId", post._id)}
              className="bg-white p-6 rounded-lg border shadow-sm flex flex-col md:flex-row gap-6 cursor-move"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize", getStatusColor(post.status))}>
                    {post.status}
                  </span>
                  <span className="text-sm text-gray-500 font-medium px-2 py-0.5 bg-gray-50 rounded border">
                    {post.platform}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.topic}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                
                {post.scheduledTime && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Scheduled for: {new Date(post.scheduledTime).toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md border">
                  Edit
                </button>
                {post.status === 'draft' && (
                  <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                    Schedule
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
