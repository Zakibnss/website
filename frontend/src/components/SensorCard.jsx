import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';

const SensorCard = ({ sensor }) => {
  const {
    name,
    value,
    unit,
    icon,
    color,
    min,
    max,
    optimal,
    trend = 'stable',
    status = 'normal'
  } = sensor;

  const percentage = ((value - min) / (max - min)) * 100;
  const isOptimal = value >= optimal[0] && value <= optimal[1];

  const getStatusConfig = () => {
    switch(status) {
      case 'critical':
        return {
          icon: <AlertCircle size={16} />,
          text: 'Critical',
          className: 'status-critical'
        };
      case 'warning':
        return {
          icon: <AlertCircle size={16} />,
          text: 'Warning',
          className: 'status-warning'
        };
      default:
        return {
          icon: <Info size={16} />,
          text: 'Normal',
          className: 'status-normal'
        };
    }
  };

  const getTrendIcon = () => {
    switch(trend) {
      case 'up':
        return <TrendingUp size={16} className="trend-up" />;
      case 'down':
        return <TrendingDown size={16} className="trend-down" />;
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="sensor-card">
      <div className="sensor-header">
        <div className="sensor-icon" style={{ backgroundColor: `${color}20` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="sensor-info">
          <h4 className="sensor-name">{name}</h4>
          <div className={`sensor-status ${statusConfig.className}`}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </div>
        </div>
        {getTrendIcon()}
      </div>

      <div className="sensor-value">
        <span className="value">{value}</span>
        <span className="unit">{unit}</span>
      </div>

      <div className="sensor-progress">
        <div className="progress-labels">
          <span>{min}{unit}</span>
          <span>Optimal: {optimal[0]}-{optimal[1]}{unit}</span>
          <span>{max}{unit}</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-track"
            style={{
              width: `${percentage}%`,
              backgroundColor: isOptimal ? color : 'var(--danger)'
            }}
          >
            <div className="progress-thumb"></div>
          </div>
          <div 
            className="optimal-range"
            style={{
              left: `${((optimal[0] - min) / (max - min)) * 100}%`,
              width: `${((optimal[1] - optimal[0]) / (max - min)) * 100}%`
            }}
          ></div>
        </div>
      </div>

      <div className="sensor-footer">
        <div className="sensor-stats">
          <div className="stat">
            <span className="stat-label">Current</span>
            <span className="stat-value">{value}{unit}</span>
          </div>
          <div className="stat">
            <span className="stat-label">24h Avg</span>
            <span className="stat-value">{(value * 0.95).toFixed(1)}{unit}</span>
          </div>
          <div className="stat">
            <span className="stat-label">7d Min</span>
            <span className="stat-value">{(value * 0.85).toFixed(1)}{unit}</span>
          </div>
        </div>
        
        <button className="sensor-details-btn">
          Details
        </button>
      </div>
    </div>
  );
};

export default SensorCard;