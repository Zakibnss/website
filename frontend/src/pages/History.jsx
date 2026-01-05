import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Search, TrendingUp, FileDown, ChevronDown, Eye, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { format, subDays } from 'date-fns';

const History = () => {
  const { readings, devices, isLoading } = useData();
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);

  // Get the actual timestamp field from your data
  const getReadingTimestamp = (reading) => {
    // Try different possible timestamp fields
    return reading.created_at || reading.timestamp || new Date().toISOString();
  };

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
    try {
      // Date filter
      const cutoffDate = getDateRange();
      const readingDate = new Date(getReadingTimestamp(reading));
      if (readingDate < cutoffDate) return false;

      // Quality filter
      if (filter !== 'all') {
        const quality = reading.quality_flag || reading.quality_class || 'unknown';
        if (quality.toLowerCase() !== filter.toLowerCase()) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const deviceName = devices.find(d => d.id === reading.device_id)?.name || reading.device_id;
        const quality = reading.quality_flag || reading.quality_class || 'unknown';
        
        return (
          deviceName.toLowerCase().includes(query) ||
          quality.toLowerCase().includes(query) ||
          reading.device_id.toLowerCase().includes(query) ||
          (reading.temperature && reading.temperature.toString().includes(query)) ||
          (reading.ph && reading.ph.toString().includes(query))
        );
      }

      return true;
    } catch (error) {
      console.error('Error filtering reading:', error, reading);
      return false;
    }
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
      setSelectedRows(filteredReadings.map(r => r.id || r.device_id + '_' + getReadingTimestamp(r)));
    }
  };

  // Get quality display
  const getQualityDisplay = (reading) => {
    const quality = reading.quality_flag || reading.quality_class;
    if (!quality) return { text: 'Unknown', class: 'unknown' };
    
    const qualityLower = quality.toLowerCase();
    if (qualityLower === 'ok' || qualityLower === 'good') {
      return { text: 'Good', class: 'good' };
    } else if (qualityLower === 'suspect' || qualityLower === 'warning') {
      return { text: 'Warning', class: 'warning' };
    } else if (qualityLower === 'fail' || qualityLower === 'danger' || qualityLower === 'critical') {
      return { text: 'Critical', class: 'critical' };
    }
    return { text: quality, class: 'unknown' };
  };

  // Get device name
  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.name || `Device ${deviceId}`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No date';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date error';
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    setExportLoading(true);
    
    try {
      // Determine which readings to export
      const exportReadings = selectedRows.length > 0 
        ? filteredReadings.filter(r => selectedRows.includes(r.id || r.device_id + '_' + getReadingTimestamp(r)))
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
        'Quality Status',
        'Latitude',
        'Longitude'
      ];

      // Prepare CSV rows
      const rows = exportReadings.map(reading => {
        const quality = getQualityDisplay(reading);
        return [
          getReadingTimestamp(reading),
          reading.device_id || 'N/A',
          getDeviceName(reading.device_id),
          reading.temperature?.toFixed(2) || 'N/A',
          reading.ph?.toFixed(2) || 'N/A',
          reading.tds?.toFixed(0) || 'N/A',
          reading.turbidity?.toFixed(2) || 'N/A',
          quality.text,
          reading.latitude?.toFixed(6) || 'N/A',
          reading.longitude?.toFixed(6) || 'N/A'
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
      const filename = `water_quality_history_${dateStr}_${count}_readings.csv`;
      
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
        ? filteredReadings.filter(r => selectedRows.includes(r.id || r.device_id + '_' + getReadingTimestamp(r)))
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
        readings: exportReadings.map(reading => ({
          ...reading,
          quality_display: getQualityDisplay(reading)
        }))
      };

      // Create JSON string
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename
      const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const count = exportReadings.length;
      const filename = `water_quality_history_${dateStr}_${count}_readings.json`;
      
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

  if (isLoading && readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-gray-600">Loading historical data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={28} className="text-blue-500" />
            Historical Data
          </h1>
          <p className="text-gray-600">Analyze past water quality readings and trends</p>
        </div>
        
        <div className="header-stats flex gap-4">
          <div className="stat-card bg-white p-4 rounded-lg shadow border">
            <span className="stat-label text-sm text-gray-500 block">Total Readings</span>
            <span className="stat-value text-2xl font-bold text-gray-900">{readings.length.toLocaleString()}</span>
          </div>
          <div className="stat-card bg-white p-4 rounded-lg shadow border">
            <span className="stat-label text-sm text-gray-500 block">Filtered</span>
            <span className="stat-value text-2xl font-bold text-gray-900">{filteredReadings.length.toLocaleString()}</span>
          </div>
          <div className="stat-card bg-white p-4 rounded-lg shadow border">
            <span className="stat-label text-sm text-gray-500 block">Selected</span>
            <span className="stat-value text-2xl font-bold text-gray-900">{selectedRows.length.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="history-controls bg-white p-4 rounded-lg shadow border mb-6">
        <div className="controls-left flex flex-wrap gap-4">
          <div className="control-group flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select 
              className="control-select border rounded px-3 py-2"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Quality Levels</option>
              <option value="good">Good Only</option>
              <option value="warning">Warnings</option>
              <option value="danger">Critical</option>
            </select>
          </div>

          <div className="control-group flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <select 
              className="control-select border rounded px-3 py-2"
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="control-group search-group relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="search" 
              className="search-input border rounded pl-10 pr-8 py-2 w-64"
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="controls-right mt-4 sm:mt-0 flex flex-wrap gap-3">
          {selectedRows.length > 0 && (
            <button 
              className="btn secondary bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={clearSelections}
            >
              Clear Selection ({selectedRows.length})
            </button>
          )}
          
          <div className="export-controls flex items-center gap-2">
            <select 
              className="format-select border rounded px-3 py-2"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV Format</option>
              <option value="json">JSON Format</option>
            </select>
            
            <button 
              className={`btn primary bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleExport}
              disabled={exportLoading || filteredReadings.length === 0}
            >
              {exportLoading ? (
                <>
                  <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          </div>
        </div>
      </div>

      <div className="history-content">
        <div className="history-table-container bg-white rounded-lg shadow border overflow-hidden">
          <div className="table-header p-4 border-b">
            <div className="table-controls flex justify-between items-center">
              <div className="select-all flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="select-all"
                  checked={selectedRows.length === filteredReadings.length && filteredReadings.length > 0}
                  onChange={toggleAllRows}
                  className="h-4 w-4"
                />
                <label htmlFor="select-all" className="text-sm text-gray-600">Select All</label>
              </div>
              <span className="table-info text-sm text-gray-600">
                Showing {filteredReadings.length} of {readings.length} readings
              </span>
            </div>
          </div>

          <div className="table-scroll overflow-x-auto">
            <table className="history-table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="select-column px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox"
                      checked={selectedRows.length === filteredReadings.length && filteredReadings.length > 0}
                      onChange={toggleAllRows}
                      className="h-4 w-4"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TDS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turbidity</th>
                  
                 
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReadings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="empty-state flex flex-col items-center">
                        <Search size={48} className="text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No readings found</h4>
                        <p className="text-gray-500">Try adjusting your filters or search query</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReadings.map((reading) => {
                    const readingId = reading.id || reading.device_id + '_' + getReadingTimestamp(reading);
                    const quality = getQualityDisplay(reading);
                    const isSelected = selectedRows.includes(readingId);
                    
                    return (
                      <tr 
                        key={readingId}
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <td className="select-column px-6 py-4 whitespace-nowrap">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(readingId)}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTimestamp(getReadingTimestamp(reading))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {getDeviceName(reading.device_id).charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getDeviceName(reading.device_id)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {reading.device_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${reading.temperature > 25 ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                            {reading.temperature?.toFixed(1)}°C
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${reading.ph < 6.5 || reading.ph > 8.5 ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                            {reading.ph?.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.tds?.toFixed(0)} mg/L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.turbidity?.toFixed(1)} NTU
                        </td>
                       
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => console.log('View details:', readingId)}
                            title="View Details"
                          >
                           
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this reading?')) {
                                console.log('Delete reading:', readingId);
                              }
                            }}
                            title="Delete Reading"
                          >
                            
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;