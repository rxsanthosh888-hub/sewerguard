import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard';
import AlertBadge from '../../components/AlertBadge';
import Layout from '../../components/Layout';
import { dashboardAPI, alertsAPI } from '../../api/index';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, alertsRes, overviewRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentAlerts(),
        dashboardAPI.getOverview()
      ]);

      setStats(statsRes.data.stats);
      setAlerts(alertsRes.data.alerts);
      setOverview(overviewRes.data.overview);

      // Generate mock device health data
      const deviceData = overviewRes.data.overview.devices;
      setDevices([
        { name: 'Active', value: deviceData.active, fill: '#10b981' },
        { name: 'Inactive', value: deviceData.inactive, fill: '#ef4444' }
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  // Alert severity data for charts
  const alertSeverityData = overview ? [
    { name: 'Critical', value: overview.alerts.critical, fill: '#dc2626' },
    { name: 'High', value: overview.alerts.high, fill: '#f97316' },
    { name: 'Medium', value: overview.alerts.medium, fill: '#eab308' }
  ] : [];

  // Time series data for line chart
  const timeSeriesData = [
    { time: '00:00', alerts: 2 },
    { time: '04:00', alerts: 3 },
    { time: '08:00', alerts: 5 },
    { time: '12:00', alerts: 4 },
    { time: '16:00', alerts: 6 },
    { time: '20:00', alerts: 3 }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats && (
            <>
              <StatCard
                title="Total Devices"
                value={stats.totalDevices}
                icon="📡"
                color="blue"
              />
              <StatCard
                title="Active Devices"
                value={stats.activeDevices}
                icon="✅"
                color="green"
              />
              <StatCard
                title="Critical Alerts"
                value={stats.criticalAlerts}
                icon="🚨"
                color="red"
              />
              <StatCard
                title="Active Users"
                value={stats.totalUsers}
                icon="👥"
                color="purple"
              />
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Alert Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Device Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Device Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={devices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Alert Severity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Alert Severity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertSeverityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">System Status</h3>
            <div className="space-y-3">
              {overview && (
                <>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">System Status</span>
                    <span className="text-green-600 font-semibold">Operational ✅</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-semibold">{overview.system.uptime}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Total Alerts</span>
                    <span className="font-semibold">{overview.alerts.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Alerts</span>
                    <span className="font-semibold text-red-600">{overview.alerts.active}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Alerts</h3>
            <a href="/admin/alerts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </a>
          </div>

          {alerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.slice(0, 6).map((alert) => (
                <AlertBadge key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No alerts at the moment</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
