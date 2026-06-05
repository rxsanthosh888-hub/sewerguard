import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const roleNavs = {
      admin: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/devices', label: 'Devices', icon: '📡' },
        { path: '/admin/alerts', label: 'Alerts', icon: '🚨' },
        { path: '/admin/workers', label: 'Workers', icon: '👷' },
        { path: '/admin/supervisors', label: 'Supervisors', icon: '👔' },
        { path: '/admin/reports', label: 'Reports', icon: '📋' },
        { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
      ],
      supervisor: [
        { path: '/supervisor/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/supervisor/workers', label: 'Workers', icon: '👷' },
        { path: '/supervisor/alerts', label: 'Alerts', icon: '🚨' }
      ],
      worker: [
        { path: '/worker/dashboard', label: 'Dashboard', icon: '📊' }
      ]
    };

    return roleNavs[user?.role] || [];
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 shadow-lg`}
      >
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-bold">SewerGuard</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
          </h2>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-4 border-l pl-6">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications Panel */}
      {notificationsOpen && (
        <div className="fixed top-16 right-6 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b font-semibold">Notifications</div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-semibold text-red-800">Critical Alert</p>
              <p className="text-red-700">Device offline in Zone C</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="font-semibold text-yellow-800">Medium Alert</p>
              <p className="text-yellow-700">High pressure in Zone A</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
