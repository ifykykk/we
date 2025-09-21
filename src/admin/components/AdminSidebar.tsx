import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  BookOpen, 
  MessageSquare, 
  // ...existing code...
  Settings,
  Calendar,
  Heart,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  adminRole?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, currentPath, adminRole }) => {
  // Get navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Overview',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
        exact: true,
        roles: ['super_admin', 'dept_admin', 'counsellor']
      }
    ];

    // Counsellor-specific items
    if (adminRole === 'counsellor') {
      return [
        ...baseItems,
        {
          title: 'Pending Bookings',
          path: '/admin/dashboard/pending-bookings',
          icon: Calendar,
          roles: ['counsellor']
        },
        {
          title: 'My Appointments',
          path: '/admin/dashboard/my-appointments',
          icon: MessageSquare,
          roles: ['counsellor']
        },
        {
          title: 'Profile Setup',
          path: '/admin/dashboard/counsellor-profile',
          icon: Users,
          roles: ['counsellor']
        }
      ];
    }

    // Super Admin and Dept Admin items
    return [
      ...baseItems,
      {
        title: 'Flagged Reports',
        path: '/admin/dashboard/flagged-cases',
        icon: AlertTriangle,
        roles: ['super_admin', 'dept_admin']
      },
      {
        title: 'All Bookings',
        path: '/admin/dashboard/all-bookings',
        icon: Calendar,
        roles: ['super_admin', 'dept_admin']
      },
      {
        title: 'Analytics',
        path: '/admin/dashboard/analytics',
        icon: BarChart3,
        roles: ['super_admin', 'dept_admin']
      },
      {
        title: 'Counsellors',
        path: '/admin/dashboard/counsellors',
        icon: Users,
        roles: ['super_admin']
      },
      {
        title: 'Resources',
        path: '/admin/dashboard/resources',
        icon: BookOpen,
        roles: ['super_admin', 'dept_admin']
      },
      {
        title: 'Peer Support',
        path: '/admin/dashboard/peer-support',
        icon: MessageSquare,
        roles: ['super_admin', 'dept_admin']
      },
      {
        title: 'Settings',
        path: '/admin/dashboard/settings',
        icon: Settings,
        roles: ['super_admin']
      }
    ];
  };

  const navigationItems = getNavigationItems().filter(
    item => !item.roles || item.roles.includes(adminRole || 'dept_admin')
  );

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Soul Sync</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? currentPath === item.path
                : currentPath.startsWith(item.path);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.title}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-medium text-green-800">Mental Health Support</p>
            <p className="text-xs text-green-600 mt-1">
              Confidential • Secure • Professional
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;