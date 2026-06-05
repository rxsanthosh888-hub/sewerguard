import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard';
import Layout from '../../components/Layout';
import { dashboardAPI, devicesAPI, sensorsAPI } from '../../api/index';
import SensorCard from '../../components/SensorCard';

const WorkerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, devicesRes] = await Promise.all([
        dashboardAPI.getStats(),
        devicesAPI.getAll()
      ]);

      setStats(statsRes.data.stats);
      setDevices(devicesRes.data.devices.slice(0, 3));

      // Fetch sensors for those devices
      const allSensors = [];
      for (const device of devicesRes.data.devices.slice(0, 3)) {
        const sensorsRes = await sensorsAPI.getAll({ deviceId: device.id });
        allSensors.push(...sensorsRes.data.sensors);
      }
      setSensors(allSensors);
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats && (
            <>
              <StatCard
                title="Assigned Zone"
                value={stats.zone}
                icon="🗺️"
                color="blue"
              />
              <StatCard
                title="Devices"
                value={stats.assignedDevices}
                icon="📡"
                color="green"
              />
              <StatCard
                title="Tasks Completed"
                value={stats.tasksCompleted}
                icon="✅"
                color="purple"
              />
              <StatCard
                title="Active Tasks"
                value={stats.activeTasks}
                icon="⏳"
                color="yellow"
              />
            </>
          )}
        </div>

        {/* Quick Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-3">Your Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Assigned Zone</p>
              <p className="text-2xl font-bold">{stats?.zone}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Devices to Monitor</p>
              <p className="text-2xl font-bold">{stats?.assignedDevices}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold">{stats?.avgResponseTime}</p>
            </div>
          </div>
        </div>

        {/* Assigned Devices */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Assigned Devices</h3>
          {devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <div key={device.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800">{device.name}</h4>
                      <p className="text-sm text-gray-600">{device.location}</p>
                    </div>
                    <span className="text-2xl">{device.status === 'active' ? '✅' : '⚠️'}</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 border-y py-3 mb-4">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold capitalize">{device.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery:</span>
                      <span className="font-semibold">{device.batteryLevel}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal:</span>
                      <span className="font-semibold">{device.signalStrength}/5</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p>No devices assigned yet</p>
            </div>
          )}
        </div>

        {/* Sensors */}
        {sensors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Active Sensors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sensors.map((sensor) => {
                const device = devices.find(d => d.id === sensor.deviceId);
                return <SensorCard key={sensor.id} sensor={sensor} device={device} />;
              })}
            </div>
          </div>
        )}

        {/* Performance Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats?.tasksCompleted}</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats?.activeTasks}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.avgResponseTime}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkerDashboard;
