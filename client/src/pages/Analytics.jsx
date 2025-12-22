import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUp, ArrowDown, Users, Eye, MousePointer, Activity, Calendar } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
        params: { period }
      });
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  const { overview, charts, platformBreakdown } = data || {};
  
  const maxReach = charts?.reach?.length ? Math.max(...charts.reach) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-sm text-gray-500">Track your social media performance across all channels.</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Reach" 
          value={overview?.totalReach.toLocaleString()} 
          change={null} 
          icon={Eye} 
          trend="up" 
        />
        <KPICard 
          title="Engagement" 
          value={overview?.totalEngagement.toLocaleString()} 
          change={null} 
          icon={MousePointer} 
          trend="up" 
        />
        <KPICard 
          title="New Followers" 
          value={overview?.newFollowers.toLocaleString()} 
          change={null} 
          icon={Users} 
          trend="down" 
        />
        <KPICard 
          title="Impressions" 
          value={overview?.impressions.toLocaleString()} 
          change={null} 
          icon={Activity} 
          trend="up" 
        />
      </div>

      {/* Main Chart Area */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Engagement Trends</h3>
        <div className="h-64 flex items-end gap-2">
          {charts?.reach?.map((value, index) => {
            const height = maxReach > 0 ? (value / maxReach) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-blue-100 hover:bg-blue-500 transition-all rounded-t-sm relative group"
                  style={{ height: `${height}%` }}
                >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                        {value.toLocaleString()} Reach
                    </div>
                </div>
                {/* Only show label for every nth item to avoid clutter */}
                <span className="text-[10px] text-gray-400 mt-2 rotate-0 truncate w-full text-center">
                   {index % Math.ceil((charts.reach.length || 1) / 10) === 0 ? charts.labels[index] : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {Object.keys(platformBreakdown || {}).length === 0 ? (
                <p className="text-gray-500 text-sm">No platform data available.</p>
            ) : (
                Object.entries(platformBreakdown || {}).map(([platform, stats]) => (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                        platform === 'facebook' ? 'bg-blue-600' :
                        platform === 'instagram' ? 'bg-pink-600' :
                        platform === 'twitter' ? 'bg-black' : 'bg-blue-700'
                    }`} />
                    <span className="capitalize font-medium text-gray-700">{platform}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                    <span className="text-gray-500">Reach: <strong className="text-gray-900">{stats.reach}</strong></span>
                    <span className="text-gray-500">Eng: <strong className="text-gray-900">{stats.engagement}</strong></span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Schedule Report</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-xs">
                Get a detailed PDF report of your monthly performance sent to your email.
            </p>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-medium">
                Configure Reports
            </button>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, icon: Icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        {change && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change}
            </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
