import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { devicesAPI, sensorsAPI } from '../../api/index';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'pressure_monitor'
  });
  const [sensors, setSensors] = useState({});

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await devicesAPI.getAll();
      setDevices(response.data.devices);

      // Fetch sensors for each device
      const sensorsData = {};
      for (const device of response.data.devices) {
        const sensorsRes = await sensorsAPI.getAll({ deviceId: device.id });
        sensorsData[device.id] = sensorsRes.data.sensors;
      }
      setSensors(sensorsData);
    } catch (error) {
      toast.error('Failed to load devices');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await devicesAPI.update(editingId, formData);
        toast.success('Device updated successfully');
      } else {
        await devicesAPI.create(formData);
        toast.success('Device created successfully');
      }
      setShowForm(false);
      setFormData({ name: '', location: '', type: 'pressure_monitor' });
      setEditingId(null);
      fetchDevices();
    } catch (error) {
      toast.error('Failed to save device');
      console.error('Error:', error);
    }
  };

  const handleEdit = (device) => {
    setFormData({ name: device.name, location: device.location, type: device.type });
    setEditingId(device.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await devicesAPI.delete(id);
        toast.success('Device deleted successfully');
        fetchDevices();
      } catch (error) {
        toast.error('Failed to delete device');
      }
    }
  };

  const getStatusIcon = (status) => status === 'active' ? '🟢' : '🔴';
  const getTypeIcon = (type) => {
    const icons = { pressure_monitor: '⚡', flow_meter: '💧', quality_sensor: '🧪' };
    return icons[type] || '📡';
  };

  if (loading) {
    return <Layout><div className="text-center py-8">Loading devices...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Device Management</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', location: '', type: 'pressure_monitor' });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> Add Device
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Device' : 'Add New Device'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Device Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="pressure_monitor">Pressure Monitor</option>
                  <option value="flow_meter">Flow Meter</option>
                  <option value="quality_sensor">Quality Sensor</option>
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
          {devices.map((device) => (
            <div key={device.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(device.type)}</span>
                    <h3 className="font-semibold text-lg text-gray-800">{device.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin size={16} /> {device.location}
                  </p>
                </div>
                <span className="text-xl">{getStatusIcon(device.status)}</span>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 border-y py-3">
                <div className="flex justify-between">
                  <span>Battery Level:</span>
                  <span className="font-semibold">{device.batteryLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Signal Strength:</span>
                  <span className="font-semibold">{device.signalStrength}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-semibold capitalize">{device.type.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {sensors[device.id] && sensors[device.id].length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Sensors:</p>
                  <div className="flex flex-wrap gap-1">
                    {sensors[device.id].map(sensor => (
                      <span key={sensor.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {sensor.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(device)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(device.id)}
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

export default Devices;
