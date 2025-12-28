import React, { useState } from 'react';
import { Calendar, Filter, Download, Search, TrendingUp, FileDown, ChevronDown, Eye, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { format, subDays } from 'date-fns';

const History = () => {
  const { readings, devices } = useData();
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);

  // Calculate date ranges
  const getDateRange = () => {
    const now = new Date();
    switch(dateRange) {
      case '24h': return subDays(now, 1);
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      default: return subDays(now, 7);
    }
  };

  // Filter readings based on criteria
  const filteredReadings = readings.filter(reading => {
    // Date filter
    const cutoffDate = getDateRange();
    const readingDate = new Date(reading.timestamp);
    if (readingDate < cutoffDate) return false;

    // Quality filter
    if (filter !== 'all' && reading.quality_class !== filter) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const deviceName = devices.find(d => d.id === reading.device_id)?.name || reading.device_id;
      return (
        deviceName.toLowerCase().includes(query) ||
        reading.quality_class.toLowerCase().includes(query) ||
        reading.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Toggle row selection
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // Toggle all rows
  const toggleAllRows = () => {
    if (selectedRows.length === filteredReadings.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredReadings.map(r => r.id));
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    setExportLoading(true);
    
    try {
      // Determine which readings to export
      const exportReadings = selectedRows.length > 0 
        ? filteredReadings.filter(r => selectedRows.includes(r.id))
        : filteredReadings;

      if (exportReadings.length === 0) {
        alert('No data to export. Please select some readings or adjust your filters.');
        setExportLoading(false);
        return;
      }

      // Prepare CSV headers
      const headers = [
        'Timestamp',
        'Device ID', 
        'Device Name',
        'Temperature (°C)',
        'pH Level',
        'TDS (mg/L)',
        'Turbidity (NTU)',
        'Quality Class',
        'Quality Score',
        'Battery Level',
        'Signal Strength'
      ];

      // Prepare CSV rows
      const rows = exportReadings.map(reading => {
        const device = devices.find(d => d.id === reading.device_id);
        return [
          new Date(reading.timestamp).toISOString(),
          reading.device_id,
          device?.name || 'Unknown',
          reading.temperature?.toFixed(2) || '',
          reading.ph?.toFixed(2) || '',
          reading.tds?.toFixed(0) || '',
          reading.turbidity?.toFixed(2) || '',
          reading.quality_class || 'unknown',
          reading.quality_score || '',
          device?.batteryLevel || '',
          device?.signalStrength || ''
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename
      const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const count = exportReadings.length;
      const filename = `aquasense_history_${dateStr}_${count}_readings.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert(`Exported ${exportReadings.length} readings to ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    setExportLoading(true);
    
    try {
      const exportReadings = selectedRows.length > 0 
        ? filteredReadings.filter(r => selectedRows.includes(r.id))
        : filteredReadings;

      if (exportReadings.length === 0) {
        alert('No data to export. Please select some readings or adjust your filters.');
        setExportLoading(false);
        return;
      }

      // Prepare data with metadata
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalReadings: exportReadings.length,
          filters: {
            quality: filter,
            dateRange: dateRange,
            searchQuery: searchQuery
          }
        },
        devices: devices,
        readings: exportReadings
      };

      // Create JSON string
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename
      const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const count = exportReadings.length;
      const filename = `aquasense_history_${dateStr}_${count}_readings.json`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported ${exportReadings.length} readings to ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle export based on format
  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedRows([]);
  };

  // Get device name by ID
  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.name || deviceId;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Calendar size={28} />
            Historical Data
          </h1>
          <p>Analyze past water quality readings and trends</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Total Readings</span>
            <span className="stat-value">{readings.length.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Filtered</span>
            <span className="stat-value">{filteredReadings.length.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Selected</span>
            <span className="stat-value">{selectedRows.length.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="history-controls">
        <div className="controls-left">
          <div className="control-group">
            <Filter size={18} />
            <select 
              className="control-select"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Quality Levels</option>
              <option value="good">Good Only</option>
              <option value="warning">Warnings</option>
              <option value="danger">Critical</option>
            </select>
          </div>

          <div className="control-group">
            <Calendar size={18} />
            <select 
              className="control-select"
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="control-group search-group">
            <Search size={18} />
            <input 
              type="search" 
              className="search-input"
              placeholder="Search by device or quality..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="controls-right">
          {selectedRows.length > 0 && (
            <button 
              className="btn secondary"
              onClick={clearSelections}
            >
              Clear Selection ({selectedRows.length})
            </button>
          )}
          
          <div className="export-controls">
            <select 
              className="format-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV Format</option>
              <option value="json">JSON Format</option>
            </select>
            
            <button 
              className={`btn primary export-btn ${exportLoading ? 'loading' : ''}`}
              onClick={handleExport}
              disabled={exportLoading || filteredReadings.length === 0}
            >
              {exportLoading ? (
                <>
                  <div className="spinner"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export Data
                  {selectedRows.length > 0 && ` (${selectedRows.length})`}
                </>
              )}
            </button>
            
            <div className="export-dropdown">
              <button className="export-options-btn">
                <ChevronDown size={16} />
              </button>
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={exportToCSV}
                >
                  <FileDown size={16} />
                  Export as CSV
                </button>
                <button 
                  className="dropdown-item"
                  onClick={exportToJSON}
                >
                  <FileDown size={16} />
                  Export as JSON
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <TrendingUp size={16} />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="history-content">
        <div className="history-table-container">
          <div className="table-header">
            <div className="table-controls">
              <div className="select-all">
                <input 
                  type="checkbox"
                  id="select-all"
                  checked={selectedRows.length === filteredReadings.length && filteredReadings.length > 0}
                  onChange={toggleAllRows}
                />
                <label htmlFor="select-all">Select All</label>
              </div>
              <span className="table-info">
                Showing {filteredReadings.length} of {readings.length} readings
              </span>
            </div>
            <div className="table-actions">
              <button 
                className="btn-sm"
                onClick={() => window.print()}
              >
                <FileDown size={16} />
                Print View
              </button>
            </div>
          </div>

          <div className="table-scroll">
            <table className="history-table">
              <thead>
                <tr>
                  <th className="select-column">
                    <input 
                      type="checkbox"
                      checked={selectedRows.length === filteredReadings.length && filteredReadings.length > 0}
                      onChange={toggleAllRows}
                    />
                  </th>
                  <th>Timestamp</th>
                  <th>Device</th>
                  <th>Temperature</th>
                  <th>pH</th>
                  <th>TDS</th>
                  <th>Turbidity</th>
                  <th>Quality</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadings.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="9">
                      <div className="empty-state">
                        <Search size={48} />
                        <h4>No readings found</h4>
                        <p>Try adjusting your filters or search query</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReadings.map((reading) => (
                    <tr 
                      key={reading.id}
                      className={selectedRows.includes(reading.id) ? 'selected' : ''}
                    >
                      <td className="select-column">
                        <input 
                          type="checkbox"
                          checked={selectedRows.includes(reading.id)}
                          onChange={() => toggleRowSelection(reading.id)}
                        />
                      </td>
                      <td className="timestamp">
                        <div className="time-primary">
                          {formatTimestamp(reading.timestamp)}
                        </div>
                        <div className="time-secondary">
                          {new Date(reading.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="device-cell">
                        <div className="device-icon">
                          {getDeviceName(reading.device_id).charAt(0)}
                        </div>
                        <div className="device-info">
                          <span className="device-name">{getDeviceName(reading.device_id)}</span>
                          <span className="device-id">{reading.device_id}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`value ${reading.temperature > 25 ? 'warning' : ''}`}>
                          {reading.temperature?.toFixed(1)}°C
                        </span>
                      </td>
                      <td>
                        <span className={`value ${reading.ph < 6.5 || reading.ph > 8.5 ? 'warning' : ''}`}>
                          {reading.ph?.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`value ${reading.tds > 250 ? 'warning' : ''}`}>
                          {reading.tds?.toFixed(0)} mg/L
                        </span>
                      </td>
                      <td>
                        <span className={`value ${reading.turbidity > 5 ? 'warning' : ''}`}>
                          {reading.turbidity?.toFixed(1)} NTU
                        </span>
                      </td>
                      <td>
                        <span className={`quality-badge ${reading.quality_class}`}>
                          {reading.quality_class?.toUpperCase()}
                        </span>
                      </td>
                      <td className="action-cell">
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => console.log('View details:', reading.id)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this reading?')) {
                                console.log('Delete reading:', reading.id);
                              }
                            }}
                            title="Delete Reading"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="pagination">
              <button className="pagination-btn" disabled>
                Previous
              </button>
              <div className="page-numbers">
                <span className="page-number active">1</span>
                <span className="page-number">2</span>
                <span className="page-number">3</span>
                <span className="page-dots">...</span>
                <span className="page-number">10</span>
              </div>
              <button className="pagination-btn">
                Next
              </button>
            </div>
            <div className="results-info">
              Showing 1-{Math.min(filteredReadings.length, 20)} of {filteredReadings.length} results
            </div>
          </div>
        </div>

        <div className="history-sidebar">
          <div className="sidebar-card">
            <h3>
              <TrendingUp size={20} />
              Export Options
            </h3>
            <div className="export-settings">
              <div className="setting-group">
                <label>Export Format</label>
                <div className="format-options">
                  <button 
                    className={`format-option ${exportFormat === 'csv' ? 'active' : ''}`}
                    onClick={() => setExportFormat('csv')}
                  >
                    CSV
                  </button>
                  <button 
                    className={`format-option ${exportFormat === 'json' ? 'active' : ''}`}
                    onClick={() => setExportFormat('json')}
                  >
                    JSON
                  </button>
                </div>
              </div>
              
              <div className="setting-group">
                <label>Date Range</label>
                <div className="date-display">
                  {format(getDateRange(), 'MMM dd, yyyy')} - {format(new Date(), 'MMM dd, yyyy')}
                </div>
              </div>
              
              <div className="setting-group">
                <label>Selected Readings</label>
                <div className="selected-count">
                  {selectedRows.length} of {filteredReadings.length} selected
                </div>
                {selectedRows.length > 0 && (
                  <button 
                    className="btn-sm secondary"
                    onClick={clearSelections}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              
              <div className="setting-group">
                <label>Export Preview</label>
                <div className="export-preview">
                  <div className="preview-item">
                    <span>Total Records:</span>
                    <span>{selectedRows.length || filteredReadings.length}</span>
                  </div>
                  <div className="preview-item">
                    <span>File Size:</span>
                    <span>~{(selectedRows.length || filteredReadings.length) * 0.5} KB</span>
                  </div>
                  <div className="preview-item">
                    <span>Includes:</span>
                    <span>Reading data, timestamps, device info</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className={`btn primary export-sidebar-btn ${exportLoading ? 'loading' : ''}`}
              onClick={handleExport}
              disabled={exportLoading || filteredReadings.length === 0}
            >
              {exportLoading ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Export
                </>
              )}
            </button>
            
            <p className="export-note">
              Exported files include all reading data with timestamps and device information.
              CSV format is recommended for spreadsheet applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;