import { BarChart, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, User</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50">
            Export Report
          </button>
          <button onClick={() => navigate('/create')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            Create Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Posts" 
          value="1,234" 
          change="+12%" 
          icon={Calendar} 
        />
        <StatsCard 
          title="Total Engagement" 
          value="45.2K" 
          change="+5.4%" 
          icon={BarChart} 
        />
        <StatsCard 
          title="Follower Growth" 
          value="8.5K" 
          change="+2.1%" 
          icon={Users} 
        />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="text-center py-10 text-gray-500">
          No recent activity to show.
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-green-600 flex items-center font-medium">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          {change}
        </span>
        <span className="text-gray-500 ml-2">vs last month</span>
      </div>
    </div>
  );
}
