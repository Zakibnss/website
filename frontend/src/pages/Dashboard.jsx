// Dashboard.jsx - IMPROVED VERSION

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Download,
  PlayCircle,
  BarChart3,
  Shield,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  Bell,
  Filter,
  Calendar,
  Sparkles,
  Wifi,
  MapPin,
  Droplet,
  TrendingDown
} from 'lucide-react';
import { useData } from '../context/DataContext';
import QualityBanner from '../components/QualityBanner';
import SensorCard from '../components/SensorCard';
import StatisticsCard from '../components/StatisticsCard.jsx';

const Dashboard = () => {
  const { readings, statistics, sendTestData, isLoading } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const latestReading = readings[0] || {};
  
  // Safe data extraction with defaults
  const totalReadings = statistics?.total_readings ?? 0;
  const alertsToday = statistics?.alertsToday ?? 0;
  const devicesOnline = statistics?.devicesOnline ?? 0;
  const averageQuality = statistics?.averageQuality ?? 0;

  // Enhanced sensors data with status
  const sensors = useMemo(() => [
    {
      id: 1,
      name: 'Temperature',
      value: latestReading.temperature ? latestReading.temperature.toFixed(1) : '--',
      unit: '°C',
      icon: '🌡️',
      color: '#ff6b6b',
      min: 0,
      max: 40,
      optimal: [15, 25],
      trend: 'up',
      status: latestReading.temperature > 25 ? 'warning' : 'normal',
      lastUpdated: '2 min ago',
      sensorId: 'TEMP_001',
      location: 'Main Reservoir',
      change: '+1.2°C'
    },
    {
      id: 2,
      name: 'pH Level',
      value: latestReading.ph ? latestReading.ph.toFixed(1) : '--',
      unit: '',
      icon: '🧪',
      color: '#9d4edd',
      min: 0,
      max: 14,
      optimal: [6.5, 8.5],
      trend: 'stable',
      status: latestReading.ph < 6.5 ? 'warning' : 'normal',
      lastUpdated: '1 min ago',
      sensorId: 'PH_002',
      location: 'Treatment Plant',
      change: '-0.1'
    },
    {
      id: 3,
      name: 'TDS',
      value: latestReading.tds ? latestReading.tds.toFixed(0) : '--',
      unit: 'mg/L',
      icon: '💎',
      color: '#ffd166',
      min: 0,
      max: 1000,
      optimal: [50, 250],
      trend: 'down',
      status: latestReading.tds > 250 ? 'warning' : 'normal',
      lastUpdated: '3 min ago',
      sensorId: 'TDS_003',
      location: 'Distribution Line',
      change: '-15 mg/L'
    },
    {
      id: 4,
      name: 'Turbidity',
      value: latestReading.turbidity ? latestReading.turbidity.toFixed(1) : '--',
      unit: 'NTU',
      icon: '🌫️',
      color: '#06b6d4',
      min: 0,
      max: 100,
      optimal: [0, 5],
      trend: 'up',
      status: latestReading.turbidity > 5 ? 'critical' : 'normal',
      lastUpdated: '4 min ago',
      sensorId: 'TURB_004',
      location: 'Filter Station',
      change: '+0.3 NTU'
    }
  ], [latestReading]);

  // Enhanced stats cards with sparklines
  const statsCards = useMemo(() => [
    {
      id: 1,
      title: 'Total Readings',
      value: totalReadings.toLocaleString(),
      change: '+12.5%',
      icon: <Activity size={24} />,
      color: '#10b981',
      trend: 'up',
      variant: 'sparkline',
      sparklineData: 'M0,50 L25,30 L50,45 L75,35 L100,50',
      description: 'Last 24 hours',
      subValue: '1.2M total',
      progress: 85
    },
    {
      id: 2,
      title: 'Active Alerts',
      value: alertsToday,
      change: '+2',
      icon: <AlertTriangle size={24} />,
      color: '#ef4444',
      trend: 'up',
      variant: 'highlight',
      description: 'Require immediate attention',
      progress: alertsToday > 5 ? 100 : (alertsToday / 5) * 100,
      severity: alertsToday > 5 ? 'critical' : alertsToday > 2 ? 'warning' : 'normal'
    },
    {
      id: 3,
      title: 'Online Devices',
      value: `${devicesOnline}/12`,
      change: 'All',
      icon: <Users size={24} />,
      color: '#3b82f6',
      trend: 'stable',
      variant: 'compact',
      description: 'Operational status',
      progress: (devicesOnline / 12) * 100
    },
    {
      id: 4,
      title: 'Avg Quality',
      value: `${averageQuality.toFixed(1)}%`,
      change: '+3.2%',
      icon: <TrendingUp size={24} />,
      color: '#8b5cf6',
      trend: 'up',
      variant: 'progress',
      description: 'Industry standard: 95%',
      progress: averageQuality,
      quality: averageQuality >= 95 ? 'excellent' : averageQuality >= 85 ? 'good' : 'fair'
    }
  ], [totalReadings, alertsToday, devicesOnline, averageQuality]);

  // Quick actions with icons
  const quickActions = [
    {
      id: 1,
      title: 'Run Diagnostics',
      icon: <Zap size={20} />,
      color: '#ffd166',
      description: 'Check system health',
      action: () => console.log('Run diagnostics')
    },
    {
      id: 2,
      title: 'View Reports',
      icon: <BarChart3 size={20} />,
      color: '#06b6d4',
      description: 'Generate analytics',
      action: () => console.log('View reports')
    },
    {
      id: 3,
      title: 'Security Scan',
      icon: <Shield size={20} />,
      color: '#9d4edd',
      description: 'Check vulnerabilities',
      action: () => console.log('Security scan')
    },
    {
      id: 4,
      title: 'Export Data',
      icon: <Download size={20} />,
      color: '#10b981',
      description: 'Download reports',
      action: () => console.log('Export data')
    }
  ];

  // Dashboard tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={16} /> }

  ];

  // Filtered readings
  const filteredReadings = useMemo(() => {
    if (filterStatus === 'all') return readings;
    return readings.filter(r => r.quality_flag === filterStatus);
  }, [readings, filterStatus]);

  // Sensor status summary
  const sensorsSummary = useMemo(() => {
    return {
      normal: sensors.filter(s => s.status === 'normal').length,
      warning: sensors.filter(s => s.status === 'warning').length,
      critical: sensors.filter(s => s.status === 'critical').length
    };
  }, [sensors]);

  // Event handlers
  const handleExportData = useCallback(() => {
    console.log('Export data triggered');
    // Implement export logic
  }, []);

  const handleRunDiagnostics = useCallback(() => {
    console.log('Run diagnostics triggered');
    // Implement diagnostics logic
  }, []);

  return (
    <div className="dashboard-container">
      {/* Dashboard Header with Tabs */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-main">
            <div className="title-section">
              <h1 className="dashboard-title">
                <span className="title-gradient">Aqua Check</span> Dashboard
              </h1>
              <div className="title-badge">
                <Sparkles size={14} />
                <span>Live Monitoring</span>
              </div>
            </div>
            
          </div>
          
          <div className="header-actions">
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => sendTestData()}
                disabled={isLoading}
                title="Generate test data for demonstration"
              >
                <PlayCircle size={18} />
                <span>Generate Data</span>
                {isLoading && <span className="loading-dots"></span>}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleExportData}
                title="Export current data"
              >
                
                
              </button>
             
            </div>
            
           
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="dashboard-tabs">
          <div className="tabs-container">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'alerts' && alertsToday > 0 && (
                  <span className="tab-badge" aria-label={`${alertsToday} alerts`}>
                    {alertsToday}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="tab-indicator" style={{
            transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`
          }} aria-hidden="true"></div>
        </div>
      </div>

      {/* Quality Overview */}
      <div className="quality-section">
        <div className="section-header">
          <h2>
            
            Water Quality Overview
          </h2>
          <button className="btn-text">
            View details
            <ChevronRight size={16} />
          </button>
        </div>
        {latestReading && Object.keys(latestReading).length > 0 && (
          <QualityBanner reading={latestReading} />
        )}
      </div>

      {/* Statistics Grid */}
      <div className="statistics-section">
        <div className="section-header">
          <h2>
            
            Performance Metrics
          </h2>
          <span className="last-update">
            <Clock size={14} />
            Updated just now
          </span>
        </div>
        <div className="statistics-grid">
          {statsCards.map((stat) => (
            <StatisticsCard 
              key={stat.id} 
              stat={stat} 
              variant={stat.variant}
              onClick={() => console.log(`Clicked ${stat.title}`)}
            />
          ))}
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="sensors-section">
        <div className="section-header">
          <div className="header-left">
            <h2>
              <span className="section-icon">🔍</span>
              Live Sensor Readings
            </h2>
            <div className="sensor-status-summary">
              <span className="status-dot online"></span>
              <span>{sensorsSummary.normal} Normal</span>
              <span className="status-dot warning"></span>
              <span>{sensorsSummary.warning} Warning</span>
              <span className="status-dot critical"></span>
              <span>{sensorsSummary.critical} Critical</span>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-outline">
              <Eye size={16} />
              <span>View All Sensors</span>
            </button>
            <div className="refresh-indicator">
              <div className="refresh-pulse"></div>
              <span>Auto-refresh in 30s</span>
            </div>
          </div>
        </div>
        
        <div className="sensors-grid">
          {sensors.map((sensor) => (
            <SensorCard 
              key={sensor.id} 
              sensor={sensor}
              onClick={() => console.log(`Clicked ${sensor.name}`)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <Activity size={20} />
              Recent Activity
            </h3>
            <div className="card-actions">
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter activity by status"
              >
                <option value="all">All</option>
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <button className="btn-text">
                View All
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="card-content">
            <div className="activity-stream">
              {filteredReadings && filteredReadings.length > 0 ? (
                filteredReadings.slice(0, 6).map((reading, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <div className={`icon-bg ${reading.quality_flag || 'normal'}`}>
                        {reading.quality_flag === 'critical' ? 
                          <AlertTriangle size={14} /> : 
                          reading.quality_flag === 'warning' ?
                          <AlertTriangle size={14} /> :
                          <Activity size={14} />
                        }
                      </div>
                    </div>
                    <div className="activity-details">
                      <div className="activity-main">
                        <span className="activity-title">
                          {reading.device_id || 'Unknown Device'}
                        </span>
                        <span className="activity-time">
                          {reading.timestamp 
                            ? new Date(reading.timestamp).toLocaleTimeString() 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-location">
                          <MapPin size={12} />
                          Main Reservoir
                        </span>
                        <div className={`activity-status ${reading.quality_flag || 'normal'}`}>
                          {reading.quality_flag?.toUpperCase() || 'NORMAL'}
                        </div>
                      </div>
                    </div>
                    <button className="activity-action" aria-label="View activity details">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Activity size={48} />
                  <h4>No activity yet</h4>
                  <p>Start monitoring to see activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
       
        </div>
      </div>
    
  );
};

export default Dashboard;