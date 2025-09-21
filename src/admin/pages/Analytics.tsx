import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  // ...existing code...
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsData {
  riskDistribution: Array<{ _id: string; count: number }>;
  departmentBreakdown: Array<{ _id: string; count: number }>;
  monthlyTrends: Array<{ _id: { year: number; month: number }; count: number }>;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    riskDistribution: [],
    departmentBreakdown: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up polling for real-time updates (every 60 seconds for analytics)
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 60000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Color schemes for charts
  const riskLevelColors = {
    low: '#FCD34D',
    moderate: '#FB923C',
    high: '#F87171',
    critical: '#DC2626'
  };

  const departmentColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

  // Transform data for charts
  const riskChartData = analyticsData.riskDistribution.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    color: riskLevelColors[item._id as keyof typeof riskLevelColors] || '#6B7280'
  }));

  const departmentChartData = analyticsData.departmentBreakdown.map((item, index) => ({
    name: item._id,
    cases: item.count,
    fill: departmentColors[index % departmentColors.length]
  }));

  const trendChartData = analyticsData.monthlyTrends.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    cases: item.count
  })).sort((a, b) => a.month.localeCompare(b.month));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Trends</h1>
          <p className="text-gray-600">Mental health patterns and insights</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Risk Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Risk Level Distribution</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          {riskChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Department Breakdown</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          {departmentChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Trends</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        {trendChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cases" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No trend data available
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Response Time</p>
              <p className="text-2xl font-bold text-gray-900">2.3 days</p>
              <p className="text-sm text-green-600">↓ 15% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Case Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
              <p className="text-sm text-green-600">↑ 5% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Counsellor Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
              <p className="text-sm text-green-600">↑ 3% from last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-yellow-400 pl-4">
            <h3 className="font-medium text-gray-900">Peak Stress Periods</h3>
            <p className="text-sm text-gray-600">
              Highest flagged cases occur during exam periods (February, May, November). Consider increasing counsellor availability during these months.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-400 pl-4">
            <h3 className="font-medium text-gray-900">Department Patterns</h3>
            <p className="text-sm text-gray-600">
              Engineering and Computer Science departments show higher stress levels. Targeted workshops on technical stress management recommended.
            </p>
          </div>
          
          <div className="border-l-4 border-green-400 pl-4">
            <h3 className="font-medium text-gray-900">Early Intervention Success</h3>
            <p className="text-sm text-gray-600">
              Cases identified at 'low' risk level have 95% resolution rate when addressed within 48 hours. Focus on rapid response protocols.
            </p>
          </div>
          
          <div className="border-l-4 border-red-400 pl-4">
            <h3 className="font-medium text-gray-900">Critical Case Trends</h3>
            <p className="text-sm text-gray-600">
              Critical cases increased by 12% this month. Consider implementing proactive screening programs and mental health awareness campaigns.
            </p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Resource Allocation</h3>
            <p className="text-sm text-blue-700">
              Increase counsellor staff by 20% during peak periods to maintain response time targets.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Prevention Programs</h3>
            <p className="text-sm text-green-700">
              Launch stress management workshops in high-risk departments before exam seasons.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Technology Enhancement</h3>
            <p className="text-sm text-yellow-700">
              Implement AI-powered early warning system to flag at-risk students proactively.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Training Initiative</h3>
            <p className="text-sm text-purple-700">
              Provide specialized training for counsellors in high-impact intervention techniques.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
