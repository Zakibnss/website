import React from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, Filter } from 'lucide-react';

export const MapControls = ({ onZoomIn, onZoomOut, onResetView, onToggleLayers }) => {
  return (
    <div className="map-controls">
      <button className="control-btn" onClick={onZoomIn}>
        <ZoomIn size={18} />
      </button>
      <button className="control-btn" onClick={onZoomOut}>
        <ZoomOut size={18} />
      </button>
      <button className="control-btn" onClick={onResetView}>
        <Navigation size={18} />
      </button>
      <button className="control-btn" onClick={onToggleLayers}>
        <Layers size={18} />
      </button>
    </div>
  );
};

export const MapLegend = () => {
  return (
    <div className="map-legend">
      <h4>Quality Legend</h4>
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-color good"></div>
          <span>Good</span>
        </div>
        <div className="legend-item">
          <div className="legend-color warning"></div>
          <span>Warning</span>
        </div>
        <div className="legend-item">
          <div className="legend-color danger"></div>
          <span>Critical</span>
        </div>
        <div className="legend-item">
          <div className="legend-color offline"></div>
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
};

export const LocationMarker = ({ device, isSelected, onClick }) => {
  const getMarkerColor = () => {
    if (device.status === 'offline') return 'offline';
    if (device.lastReading?.quality === 'danger') return 'danger';
    if (device.lastReading?.quality === 'warning') return 'warning';
    return 'good';
  };

  return (
    <div 
      className={`location-marker ${getMarkerColor()} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <MapPin size={isSelected ? 28 : 24} />
      {device.alerts > 0 && (
        <div className="marker-alert"></div>
      )}
    </div>
  );
};

export const HeatmapOverlay = ({ data }) => {
  return (
    <div className="heatmap-overlay">
      <div className="heatmap-gradient">
        <div className="gradient-bar">
          <span>Low</span>
          <div className="gradient"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export const DevicePopup = ({ device, onClose }) => {
  return (
    <div className="device-popup">
      <div className="popup-header">
        <h4>{device.name}</h4>
        <button className="popup-close" onClick={onClose}>×</button>
      </div>
      
      <div className="popup-content">
        <div className="device-status">
          <div className={`status-indicator ${device.status}`}></div>
          <span>{device.status === 'online' ? 'Online' : 'Offline'}</span>
        </div>
        
        <div className="device-metrics">
          <div className="metric">
            <span>Battery</span>
            <span className="value">{device.batteryLevel}%</span>
          </div>
          <div className="metric">
            <span>Last Update</span>
            <span className="value">
              {device.lastReading 
                ? new Date(device.lastReading).toLocaleTimeString()
                : 'Never'
              }
            </span>
          </div>
          <div className="metric">
            <span>Alerts</span>
            <span className="value">{device.alerts}</span>
          </div>
        </div>
        
        {device.lastReading && (
          <div className="reading-preview">
            <h5>Latest Reading</h5>
            <div className="reading-metrics">
              <span>Temp: {device.lastReading.temperature}°C</span>
              <span>pH: {device.lastReading.ph}</span>
              <span>TDS: {device.lastReading.tds} mg/L</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="popup-actions">
        <button className="btn-sm primary">View Details</button>
        <button className="btn-sm secondary">Send Command</button>
      </div>
    </div>
  );
};