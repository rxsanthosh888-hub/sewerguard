import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { workersAPI, devicesAPI } from '../../api/index';
import { User } from 'lucide-react';

const SupervisorWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersRes, devicesRes] = await Promise.all([
        workersAPI.getAll(),
        devicesAPI.getAll()
      ]);
      setWorkers(workersRes.data.workers);
      setDevices(devicesRes.data.devices);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="text-center py-8">Loading workers...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div key={worker.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{worker.name}</h3>
                  <p className="text-sm text-gray-600">{worker.zone}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 border-y py-3">
                <div>
                  <p className="text-xs text-gray-500">Email:</p>
                  <p className="font-semibold">{worker.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone:</p>
                  <p className="font-semibold">{worker.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status:</p>
                  <p className="font-semibold capitalize">{worker.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tasks Completed:</p>
                  <p className="font-semibold">{worker.tasksCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Response Time:</p>
                  <p className="font-semibold">{worker.averageResponseTime}</p>
                </div>
              </div>

              {worker.assignedDevices.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Assigned Devices:</p>
                  <div className="flex flex-wrap gap-1">
                    {worker.assignedDevices.slice(0, 3).map(deviceId => {
                      const device = devices.find(d => d.id === deviceId);
                      return (
                        <span key={deviceId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {device?.name}
                        </span>
                      );
                    })}
                    {worker.assignedDevices.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        +{worker.assignedDevices.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">Last Assignment:</p>
                <p className="text-sm text-gray-800">
                  {new Date(worker.lastAssignment).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {workers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p className="text-lg">No workers assigned to your team</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SupervisorWorkers;
