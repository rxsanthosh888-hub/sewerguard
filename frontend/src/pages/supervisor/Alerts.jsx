import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import AlertBadge from '../../components/AlertBadge';
import { alertsAPI } from '../../api/index';

const SupervisorAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, statusFilter]);

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

  if (loading) {
    return <Layout><div className="text-center py-8">Loading alerts...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
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
                <h3 className="font-semibold text-lg text-gray-800">Details</h3>

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
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="mt-1">{selectedAlert.message}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  {selectedAlert.status === 'active' && (
                    <button
                      onClick={() => handleResolve(selectedAlert)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Mark as Resolved
                    </button>
                  )}
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

export default SupervisorAlerts;
