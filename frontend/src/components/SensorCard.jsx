import React from 'react';

const SensorCard = ({ sensor, device }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getIcon = (type) => {
    const icons = {
      pressure: '⚡',
      temperature: '🌡️',
      flow: '💧',
      ph: '🧪',
      oxygen: '💨'
    };
    return icons[type] || '📊';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{device?.name}</p>
          <h3 className="text-lg font-semibold mt-1">{sensor.name}</h3>
        </div>
        <span className="text-2xl">{getIcon(sensor.type)}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-800">
            {sensor.value.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">{sensor.unit}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sensor.status)}`}>
          {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(sensor.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default SensorCard;
