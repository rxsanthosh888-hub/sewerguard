import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard';
import Layout from '../../components/Layout';
import { dashboardAPI, alertsAPI } from '../../api/index';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SupervisorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, alertsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentAlerts()
      ]);

      setStats(statsRes.data.stats);
      setAlerts(alertsRes.data.alerts);
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

  const timeSeriesData = [
    { time: '00:00', tasks: 2 },
    { time: '04:00', tasks: 3 },
    { time: '08:00', tasks: 5 },
    { time: '12:00', tasks: 4 },
    { time: '16:00', tasks: 6 },
    { time: '20:00', tasks: 3 }
  ];

  const taskStatusData = [
    { name: 'Completed', value: stats?.tasksCompleted || 0 },
    { name: 'Pending', value: stats?.pendingTasks || 0 }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats && (
            <>
              <StatCard
                title="Team Size"
                value={stats.teamSize}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Active Alerts"
                value={stats.activeAlerts}
                icon="🚨"
                color="red"
              />
              <StatCard
                title="Tasks Completed"
                value={stats.tasksCompleted}
                icon="✅"
                color="green"
              />
              <StatCard
                title="Pending Tasks"
                value={stats.pendingTasks}
                icon="⏳"
                color="yellow"
              />
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Task Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Task Status Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Team Overview</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">Assigned Workers</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.assignedWorkers}</p>
              <p className="text-xs text-blue-600 mt-2">Active and ready</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600">Resolved Alerts</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats?.resolvedAlerts}</p>
              <p className="text-xs text-green-600 mt-2">This month</p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats?.avgResponseTime}</p>
              <p className="text-xs text-yellow-600 mt-2">Per assignment</p>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Alerts</h3>
            <a href="/supervisor/alerts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </a>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{alert.type.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded capitalize ${
                      alert.status === 'active'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent alerts</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SupervisorDashboard;
