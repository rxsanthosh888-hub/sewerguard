import React from 'react';

const AlertBadge = ({ alert, onClick }) => {
  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };
    return icons[severity] || '⭕';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? '⚠️' : '✅';
  };

  return (
    <div
      onClick={onClick}
      className={`${severityColors[alert.severity]} border rounded-lg p-4 cursor-pointer hover:shadow-lg transition`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
            <h4 className="font-semibold">{alert.type.replace(/_/g, ' ').toUpperCase()}</h4>
          </div>
          <p className="text-sm mb-2">{alert.message}</p>
          <div className="flex items-center gap-3 text-xs">
            <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
            <span>Device: {alert.device?.name}</span>
          </div>
        </div>
        <div className="text-lg ml-2">{getStatusIcon(alert.status)}</div>
      </div>

      {alert.status === 'resolved' && alert.resolvedAt && (
        <p className="text-xs mt-2 pt-2 border-t">
          Resolved: {new Date(alert.resolvedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default AlertBadge;
