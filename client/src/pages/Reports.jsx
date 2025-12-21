import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, TrendingUp, Users, Mail, Mic } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/reports', config);
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('authToken');
      await axios.post('/api/reports/generate', {
        type: 'monthly'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-500">Track your growth across all channels.</p>
        </div>
        <button 
          onClick={generateReport}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate New Report'}
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No reports generated</h3>
            <p className="text-gray-500 mt-1">Generate your first monthly performance report.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500">Generated on {new Date(report.generatedAt).toLocaleDateString()}</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md border">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Social Stats */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="flex items-center gap-2 font-medium text-blue-900 mb-3">
                    <Users className="w-4 h-4" /> Social Media
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Posts</span>
                      <span className="font-semibold">{report.metrics.social.totalPosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Impressions</span>
                      <span className="font-semibold">{report.metrics.social.totalImpressions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Engagement</span>
                      <span className="font-semibold">{report.metrics.social.engagementRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Newsletter Stats */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="flex items-center gap-2 font-medium text-purple-900 mb-3">
                    <Mail className="w-4 h-4" /> Newsletter
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Sent Campaigns</span>
                      <span className="font-semibold">{report.metrics.newsletter.totalSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Subscribers</span>
                      <span className="font-semibold">{report.metrics.newsletter.totalSubscribers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Open Rate</span>
                      <span className="font-semibold">{report.metrics.newsletter.avgOpenRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Podcast Stats */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="flex items-center gap-2 font-medium text-green-900 mb-3">
                    <Mic className="w-4 h-4" /> Podcast
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Episodes</span>
                      <span className="font-semibold">{report.metrics.podcast.totalEpisodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Downloads</span>
                      <span className="font-semibold">{report.metrics.podcast.totalDownloads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Avg. Listen Time</span>
                      <span className="font-semibold">{report.metrics.podcast.avgListenTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
