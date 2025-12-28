import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from 'react-leaflet';
import { Filter, Download, Search, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useData } from '../context/DataContext';
import { MapControls, MapLegend } from '../components/MapComponent';
import 'leaflet/dist/leaflet.css';

const MapPage = () => {
  const { readings } = useData(); // Only use readings from context
  const [mapCenter, setMapCenter] = useState([30.1892, -0.6417]); // Centered on your data
  const [zoom, setZoom] = useState(10);
  const [qualityFilter, setQualityFilter] = useState(['good', 'warning', 'danger']);
  const mapRef = useRef(null);
  
  // Function to determine water quality based on parameters
  const determineQualityClass = (reading) => {
    if (!reading) return 'unknown';
    
    const { temperature, ph, tds, turbidity } = reading;
    let issues = 0;
    
    // Water quality thresholds (adjust as needed)
    if (temperature < 15 || temperature > 25) issues++;
    if (ph < 6.5 || ph > 8.5) issues++; // pH should be 6.5-8.5 for drinking water
    if (tds > 500) issues++; // TDS should be < 500 mg/L
    if (turbidity > 5) issues++; // Turbidity should be < 5 NTU
    
    if (issues === 0) return 'good';
    if (issues === 1) return 'warning';
    return 'danger';
  };

  // Function to get quality color
  const getQualityColor = (quality) => {
    switch(quality) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Function to get quality icon
  const getQualityIcon = (quality) => {
    switch(quality) {
      case 'good': return <CheckCircle size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      case 'danger': return <XCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  // Process all readings to create markers
  const getQualityMarkers = () => {
    // Group readings by location and keep only the latest reading for each location
    const locationMap = new Map();
    
    readings.forEach(reading => {
      // Check if reading has coordinates
      if (!reading.latitude || !reading.longitude) {
        console.warn('Reading missing coordinates:', reading);
        return;
      }
      
      const lat = parseFloat(reading.latitude);
      const lng = parseFloat(reading.longitude);
      
      // Skip invalid coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates in reading:', reading);
        return;
      }
      
      const locationKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      
      // Determine quality
      const qualityClass = determineQualityClass(reading);
      
      // Keep only the latest reading for each location
      const existing = locationMap.get(locationKey);
      const readingTime = reading.timestamp ? new Date(reading.timestamp).getTime() : 0;
      const existingTime = existing ? new Date(existing.timestamp).getTime() : 0;
      
      if (!existing || readingTime > existingTime) {
        locationMap.set(locationKey, {
          id: reading.id || `reading-${Date.now()}-${Math.random()}`,
          device_id: reading.device_id,
          location: { lat, lng },
          quality_class: qualityClass,
          temperature: reading.temperature,
          ph: reading.ph,
          tds: reading.tds,
          turbidity: reading.turbidity,
          timestamp: reading.timestamp || new Date().toISOString(),
          latitude: lat,
          longitude: lng
        });
      }
    });
    
    return Array.from(locationMap.values())
      .filter(marker => qualityFilter.includes(marker.quality_class));
  };

  const qualityMarkers = getQualityMarkers();

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleResetView = () => {
    if (qualityMarkers.length > 0) {
      // Center on first marker if available
      const firstMarker = qualityMarkers[0];
      setMapCenter([firstMarker.location.lat, firstMarker.location.lng]);
    } else {
      setMapCenter([30.1892, -0.6417]);
    }
    setZoom(10);
  };

  const handleQualityFilterChange = (quality) => {
    setQualityFilter(prev => 
      prev.includes(quality) 
        ? prev.filter(q => q !== quality)
        : [...prev, quality]
    );
  };

  return (
    <div className="map-page">
      <div className="map-header">
        <div className="header-left">
          <h1>Water Quality Monitoring Map</h1>
          <p>Showing {qualityMarkers.length} water quality readings</p>
        </div>
        
        <div className="map-controls-panel">
          <div className="search-container">
            <Search size={18} />
            <input 
              type="search" 
              placeholder="Search locations..." 
              className="search-input"
            />
          </div>
          
          <button 
            className="btn primary"
            onClick={() => {
              const dataStr = JSON.stringify(readings, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `water-quality-data-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="map-container-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '600px', width: '100%', borderRadius: '12px' }}
          whenCreated={map => mapRef.current = map}
          scrollWheelZoom={true}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Water Quality Reading Markers */}
          {qualityMarkers.map((marker) => (
            <CircleMarker
              key={marker.id}
              center={[marker.location.lat, marker.location.lng]}
              radius={15}
              pathOptions={{
                fillColor: getQualityColor(marker.quality_class),
                color: '#ffffff',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.7
              }}
            >
              <Popup>
                <div className="quality-popup">
                  <div className="popup-header">
                    <div className={`quality-badge ${marker.quality_class}`}>
                      {getQualityIcon(marker.quality_class)}
                      <span>{marker.quality_class.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="popup-content">
                    <div className="quality-info">
                      <h4>Device: {marker.device_id}</h4>
                      <p className="timestamp">
                        {new Date(marker.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="reading-metrics">
                      <div className="metric">
                        <span>Temperature</span>
                        <span className="value">{marker.temperature?.toFixed(1)}°C</span>
                      </div>
                      <div className="metric">
                        <span>pH Level</span>
                        <span className="value">{marker.ph?.toFixed(1)}</span>
                      </div>
                      <div className="metric">
                        <span>TDS</span>
                        <span className="value">{marker.tds?.toFixed(0)} mg/L</span>
                      </div>
                      <div className="metric">
                        <span>Turbidity</span>
                        <span className="value">{marker.turbidity?.toFixed(1)} NTU</span>
                      </div>
                      <div className="metric">
                        <span>Coordinates</span>
                        <span className="value">
                          {marker.latitude?.toFixed(4)}, {marker.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="quality-summary">
                      <p>
                        Water quality is <strong>{marker.quality_class}</strong> at this location.
                        {marker.quality_class === 'danger' && ' Immediate attention required.'}
                        {marker.quality_class === 'warning' && ' Monitor closely.'}
                        {marker.quality_class === 'good' && ' All parameters within safe limits.'}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onToggleLayers={() => {}}
        />

        <MapLegend />
        
        {/* Quality Filter Controls */}
        <div className="quality-filter-controls">
          <h4>Filter Quality Levels</h4>
          <div className="filter-options">
            <label className="filter-option">
              <input 
                type="checkbox" 
                checked={qualityFilter.includes('good')}
                onChange={() => handleQualityFilterChange('good')}
              />
              <span className="filter-color good"></span>
              Good
            </label>
            <label className="filter-option">
              <input 
                type="checkbox" 
                checked={qualityFilter.includes('warning')}
                onChange={() => handleQualityFilterChange('warning')}
              />
              <span className="filter-color warning"></span>
              Warning
            </label>
            <label className="filter-option">
              <input 
                type="checkbox" 
                checked={qualityFilter.includes('danger')}
                onChange={() => handleQualityFilterChange('danger')}
              />
              <span className="filter-color danger"></span>
              Critical
            </label>
          </div>
        </div>
      </div>

      <div className="map-sidebar">
        <div className="sidebar-card">
          <div className="card-header">
            <h3><Filter size={18} /> Data Filters</h3>
          </div>
          <div className="filter-options">
            <div className="filter-group">
              <label>Quality Levels</label>
              <div className="quality-filter">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={qualityFilter.includes('good')}
                    onChange={() => handleQualityFilterChange('good')}
                  />
                  <span className="quality-dot good"></span>
                  Good ({qualityMarkers.filter(m => m.quality_class === 'good').length})
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={qualityFilter.includes('warning')}
                    onChange={() => handleQualityFilterChange('warning')}
                  />
                  <span className="quality-dot warning"></span>
                  Warning ({qualityMarkers.filter(m => m.quality_class === 'warning').length})
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={qualityFilter.includes('danger')}
                    onChange={() => handleQualityFilterChange('danger')}
                  />
                  <span className="quality-dot danger"></span>
                  Critical ({qualityMarkers.filter(m => m.quality_class === 'danger').length})
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="card-header">
            <h3>Quality Summary</h3>
            <span className="last-update">Real-time</span>
          </div>
          <div className="quality-summary-stats">
            <div className="summary-item good">
              <div className="summary-icon">
                <CheckCircle size={20} />
              </div>
              <div className="summary-details">
                <span className="summary-value">
                  {qualityMarkers.filter(m => m.quality_class === 'good').length}
                </span>
                <span className="summary-label">Good Readings</span>
              </div>
            </div>
            <div className="summary-item warning">
              <div className="summary-icon">
                <AlertCircle size={20} />
              </div>
              <div className="summary-details">
                <span className="summary-value">
                  {qualityMarkers.filter(m => m.quality_class === 'warning').length}
                </span>
                <span className="summary-label">Warnings</span>
              </div>
            </div>
            <div className="summary-item danger">
              <div className="summary-icon">
                <XCircle size={20} />
              </div>
              <div className="summary-details">
                <span className="summary-value">
                  {qualityMarkers.filter(m => m.quality_class === 'danger').length}
                </span>
                <span className="summary-label">Critical</span>
              </div>
            </div>
          </div>
          <div className="total-readings">
            <span>Total Readings: {readings.length}</span>
            <span>Showing: {qualityMarkers.length}</span>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="card-header">
            <h3>Latest Reading</h3>
          </div>
          {readings.length > 0 ? (
            <div className="latest-reading">
              <div className="reading-header">
                <h4>Device: {readings[readings.length - 1].device_id}</h4>
                <span className="timestamp">
                  {new Date(readings[readings.length - 1].timestamp || readings[readings.length - 1].createdAt).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="reading-metrics">
                <div className="metric-row">
                  <span>Temperature:</span>
                  <span className="value">{readings[readings.length - 1].temperature}°C</span>
                </div>
                <div className="metric-row">
                  <span>pH:</span>
                  <span className="value">{readings[readings.length - 1].ph}</span>
                </div>
                <div className="metric-row">
                  <span>TDS:</span>
                  <span className="value">{readings[readings.length - 1].tds} mg/L</span>
                </div>
                <div className="metric-row">
                  <span>Turbidity:</span>
                  <span className="value">{readings[readings.length - 1].turbidity} NTU</span>
                </div>
              </div>
              
              <div className="reading-quality">
                <span>Quality: </span>
                <span className={`quality-indicator ${determineQualityClass(readings[readings.length - 1])}`}>
                  {determineQualityClass(readings[readings.length - 1]).toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <Info size={48} />
              <h4>No readings yet</h4>
              <p>Send data via Postman to see it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;