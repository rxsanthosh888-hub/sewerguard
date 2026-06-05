import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import AlertBadge from '../../components/AlertBadge';
import { alertsAPI } from '../../api/index';
import { Filter, X } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, statusFilter, severityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAll();
      setAlerts(response.data.alerts);
    } catch (error) {
      toast.error('Failed to load alerts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    if (severityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === severityFilter);
    }

    setFilteredAlerts(filtered);
  };

  const handleResolve = async (alert) => {
    try {
      await alertsAPI.updateStatus(alert.id, 'resolved');
      toast.success('Alert resolved');
      fetchAlerts();
      setSelectedAlert(null);
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const handleDelete = async (alert) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await alertsAPI.delete(alert.id);
        toast.success('Alert deleted');
        fetchAlerts();
        setSelectedAlert(null);
      } catch (error) {
        toast.error('Failed to delete alert');
      }
    }
  };

  if (loading) {
    return <Layout><div className="text-center py-8">Loading alerts...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-lg">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Found</label>
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900">{filteredAlerts.length}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setStatusFilter('all');
                setSeverityFilter('all');
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 self-end"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="cursor-pointer"
                >
                  <AlertBadge alert={alert} />
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p className="text-lg">No alerts match your filters</p>
              </div>
            )}
          </div>

          {/* Alert Details */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-6">
            {selectedAlert ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-800">Alert Details</h3>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold">{selectedAlert.type.replace(/_/g, ' ').toUpperCase()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Severity</p>
                    <p className="font-semibold capitalize">{selectedAlert.severity}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold capitalize">{selectedAlert.status}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Device</p>
                    <p className="font-semibold">{selectedAlert.device?.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Sensor</p>
                    <p className="font-semibold">{selectedAlert.sensor?.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="mt-1">{selectedAlert.message}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                  </div>

                  {selectedAlert.resolvedAt && (
                    <div>
                      <p className="text-sm text-gray-600">Resolved</p>
                      <p className="font-semibold">{new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  {selectedAlert.status === 'active' && (
                    <button
                      onClick={() => handleResolve(selectedAlert)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedAlert)}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete Alert
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Select an alert to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;
