import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { supervisorsAPI, workersAPI } from '../../api/index';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

const Supervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zone: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [supervisorsRes, workersRes] = await Promise.all([
        supervisorsAPI.getAll(),
        workersAPI.getAll()
      ]);
      setSupervisors(supervisorsRes.data.supervisors);
      setWorkers(workersRes.data.workers);
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
        await supervisorsAPI.update(editingId, formData);
        toast.success('Supervisor updated successfully');
      } else {
        await supervisorsAPI.create(formData);
        toast.success('Supervisor created successfully');
      }
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', zone: '' });
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save supervisor');
      console.error('Error:', error);
    }
  };

  const handleEdit = (supervisor) => {
    setFormData({
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone,
      zone: supervisor.zone
    });
    setEditingId(supervisor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supervisor?')) {
      try {
        await supervisorsAPI.delete(id);
        toast.success('Supervisor deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete supervisor');
      }
    }
  };

  if (loading) {
    return <Layout><div className="text-center py-8">Loading supervisors...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Supervisor Management</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', email: '', phone: '', zone: '' });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> Add Supervisor
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Supervisor' : 'Add New Supervisor'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supervisors.map((supervisor) => (
            <div key={supervisor.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{supervisor.name}</h3>
                  <p className="text-sm text-gray-600">{supervisor.zone}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 border-y py-3">
                <div>
                  <p className="text-xs text-gray-500">Email:</p>
                  <p className="font-semibold">{supervisor.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone:</p>
                  <p className="font-semibold">{supervisor.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status:</p>
                  <p className="font-semibold capitalize">{supervisor.status}</p>
                </div>
              </div>

              <div className="mb-4 bg-blue-50 p-3 rounded">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Team Size:</span>
                  <span className="font-semibold text-blue-900">{supervisor.teamSize} workers</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-700">Active Alerts:</span>
                  <span className="font-semibold text-blue-900">{supervisor.activeAlerts}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-700">Resolved Alerts:</span>
                  <span className="font-semibold text-blue-900">{supervisor.resolvedAlerts}</span>
                </div>
              </div>

              {supervisor.supervisedWorkers && supervisor.supervisedWorkers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Supervised Workers:</p>
                  <div className="flex flex-wrap gap-1">
                    {supervisor.supervisedWorkers.map(workerId => {
                      const worker = workers.find(w => w.id === workerId);
                      return (
                        <span key={workerId} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {worker?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(supervisor)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(supervisor.id)}
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

export default Supervisors;
