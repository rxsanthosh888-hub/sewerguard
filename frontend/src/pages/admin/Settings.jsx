import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { Settings as SettingsIcon, Database, Lock, Bell } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    systemNotifications: true,
    emailAlerts: true,
    dailyReport: false,
    dataBackup: true,
    maintenanceMode: false,
    debugMode: false
  });

  const [adminPassword, setAdminPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSettingToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setAdminPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDatabaseBackup = () => {
    toast.success('Database backup started');
    setTimeout(() => toast.success('Backup completed successfully'), 2000);
  };

  const settingItems = [
    {
      id: 'systemNotifications',
      label: 'System Notifications',
      description: 'Receive system-wide notifications',
      icon: <Bell size={20} />
    },
    {
      id: 'emailAlerts',
      label: 'Email Alerts',
      description: 'Send critical alerts via email',
      icon: <Bell size={20} />
    },
    {
      id: 'dailyReport',
      label: 'Daily Report',
      description: 'Generate and send daily reports',
      icon: <SettingsIcon size={20} />
    },
    {
      id: 'dataBackup',
      label: 'Auto Data Backup',
      description: 'Automatic database backup',
      icon: <Database size={20} />
    },
    {
      id: 'maintenanceMode',
      label: 'Maintenance Mode',
      description: 'Put system in maintenance mode',
      icon: <SettingsIcon size={20} />
    },
    {
      id: 'debugMode',
      label: 'Debug Mode',
      description: 'Enable debug logging',
      icon: <SettingsIcon size={20} />
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <SettingsIcon size={20} /> System Settings
          </h3>

          <div className="space-y-4">
            {settingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.id]}
                    onChange={() => handleSettingToggle(item.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Database size={20} /> Database Management
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-4">
                Manage database backups and maintenance operations.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDatabaseBackup}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  🔄 Backup Database
                </button>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                  ⬇️ Export Data
                </button>
                <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
                  📊 View Backup History
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm text-gray-600">Last Backup: 2 hours ago</p>
              <p className="text-sm text-gray-600 mt-1">Database Size: 156 MB</p>
              <p className="text-sm text-gray-600 mt-1">Records: 15,420</p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Lock size={20} /> Change Admin Password
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">App Version</p>
              <p className="text-2xl font-bold text-gray-800">1.0.0</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">API Version</p>
              <p className="text-2xl font-bold text-gray-800">1.0.0</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Last Update</p>
              <p className="text-lg font-bold text-gray-800">Jan 15, 2024</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">System Uptime</p>
              <p className="text-2xl font-bold text-green-600">99.8%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Environment</p>
              <p className="text-lg font-bold text-gray-800">Production</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Node Version</p>
              <p className="text-lg font-bold text-gray-800">v18.x.x</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
