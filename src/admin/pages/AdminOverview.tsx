import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  UserCheck, 
  BookOpen, 
  Activity
} from 'lucide-react';

interface OverviewStats {
  totalScreenings: number;
  flaggedCases: number;
  activeCounsellors: number;
  totalResources: number;
}

interface RecentCase {
  _id: string;
  anonymizedId: string;
  department: string;
  riskLevel: string;
  flaggedFor: string[];
  status: string;
  createdAt: string;
  assignedCounsellor?: {
    firstName: string;
    lastName: string;
  };
}

interface CommonIssue {
  _id: string;
  count: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalScreenings: 0,
    flaggedCases: 0,
    activeCounsellors: 0,
    totalResources: 0
  });
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [commonIssues, setCommonIssues] = useState<CommonIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<string>('');

  useEffect(() => {
    // Get admin role from localStorage
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      const admin = JSON.parse(adminData);
      setAdminRole(admin.role);
    }
    
    fetchOverviewData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchOverviewData();
    }, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchOverviewData = async () => {
    try {
      console.log('🔍 Fetching admin overview data...');
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3000/api/admin/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Received admin data:', data);
        setStats(data.overview);
        setRecentCases(data.recentCases);
        setCommonIssues(data.commonIssues);
      } else {
        console.error('❌ Failed to fetch overview data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Mental health monitoring and support dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Screenings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalScreenings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Flagged Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.flaggedCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Counsellors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCounsellors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resources</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResources}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Flagged Cases */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Flagged Cases</h2>
            <p className="text-sm text-gray-600">Students requiring immediate attention</p>
          </div>
          <div className="p-6">
            {recentCases.length > 0 ? (
              <div className="space-y-4">
                {recentCases.map((case_) => (
                  <div key={case_._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{case_.anonymizedId}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(case_.riskLevel)}`}>
                          {case_.riskLevel.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(case_.status)}`}>
                          {case_.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {case_.department} • {case_.flaggedFor.join(', ')}
                      </div>
                      {case_.assignedCounsellor && (
                        <div className="mt-1 text-xs text-gray-500">
                          Assigned to: {case_.assignedCounsellor.firstName} {case_.assignedCounsellor.lastName}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(case_.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent flagged cases</p>
              </div>
            )}
          </div>
        </div>

        {/* Most Common Issues */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Common Issues</h2>
            <p className="text-sm text-gray-600">Top mental health concerns</p>
          </div>
          <div className="p-6">
            {commonIssues.length > 0 ? (
              <div className="space-y-3">
                {commonIssues.map((issue) => (
                  <div key={issue._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {issue._id.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{issue.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Only show for non-counsellor roles */}
      {adminRole !== 'counsellor' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Review Flagged Cases</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Manage Counsellors</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Upload Resources</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
