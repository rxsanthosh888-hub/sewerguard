import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend,
  onClick 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const borderColor = {
    blue: 'border-l-blue-600',
    red: 'border-l-red-600',
    green: 'border-l-green-600',
    yellow: 'border-l-yellow-600',
    purple: 'border-l-purple-600'
  };

  return (
    <div
      onClick={onClick}
      className={`${colorClasses[color]} border-l-4 ${borderColor[color]} p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition ${
        onClick ? 'hover:scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
