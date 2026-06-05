import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { workersAPI, devicesAPI } from '../../api/index';
import { Plus, Edit2, Trash2, User } from 'lucide-react';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zone: '',
    assignedDevices: []
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await workersAPI.update(editingId, formData);
        toast.success('Worker updated successfully');
      } else {
        await workersAPI.create(formData);
        toast.success('Worker created successfully');
      }
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', zone: '', assignedDevices: [] });
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save worker');
      console.error('Error:', error);
    }
  };

  const handleEdit = (worker) => {
    setFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      zone: worker.zone,
      assignedDevices: worker.assignedDevices
    });
    setEditingId(worker.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await workersAPI.delete(id);
        toast.success('Worker deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete worker');
      }
    }
  };

  const getDeviceNames = (deviceIds) => {
    return deviceIds
      .map(id => devices.find(d => d.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return <Layout><div className="text-center py-8">Loading workers...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Worker Management</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', email: '', phone: '', zone: '', assignedDevices: [] });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> Add Worker
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Worker' : 'Add New Worker'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Zone"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Devices</label>
                <select
                  multiple
                  value={formData.assignedDevices}
                  onChange={(e) => setFormData({
                    ...formData,
                    assignedDevices: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {devices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

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

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(worker)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(worker.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Workers;
