// Enhanced Header.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  Wifi, 
  Battery, 
  RefreshCw,
  ChevronDown,
  Moon,
  Sun,
  Droplets,
  Zap,
  Globe,
  Clock,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { lastUpdate, loadData, statistics, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [time, setTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { id: 1, type: 'alert', message: 'Critical: pH level above threshold', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'Temperature rising at Station 3', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Weekly report generated', time: '1 hour ago' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'ocean', label: 'Ocean', icon: <Droplets size={16} /> }
  ];

  return (
    <header className="modern-header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="header-left">
          <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="brand-section">
            <div className="brand-logo">
              <div className="logo-animation">
                <Droplets size={24} />
                <div className="logo-ripple"></div>
                <div className="logo-ripple delay-1"></div>
              </div>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">
                <span className="brand-gradient">AquaCheck</span> Water Conditioning
              </h1>
              <p className="brand-subtitle">
               
                
                <span className="status-dot live"></span>
                <span className="status-text">Live</span>
              </p>
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* System Status */}
          <div className="system-status">
            
           
            
           
          </div>

          {/* Divider */}
          <div className="header-divider"></div>

          {/* Search */}
          <div className="search-wrapper">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="search"
                placeholder="Search devices, metrics, locations..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            className="refresh-button"
            onClick={loadData}
            disabled={isLoading}
            aria-label="Refresh data"
            data-tooltip="Refresh all data"
          >
            <div className="refresh-icon-wrapper">
              <RefreshCw size={20} className={isLoading ? 'spinning' : ''} />
              {isLoading && <div className="refresh-pulse"></div>}
            </div>
            <span className="refresh-label">Refresh</span>
          </button>

          {/* Notifications */}
          <div className="notifications-wrapper">
            <button
              className="notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {statistics.alertsToday > 0 && (
                <>
                  <span className="notification-badge">{statistics.alertsToday}</span>
                  <div className="notification-pulse"></div>
                </>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  <button className="mark-read">Mark all as read</button>
                </div>
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.type}`}>
                      <div className="notification-icon">
                        {notification.type === 'alert' && <AlertCircle size={16} />}
                        {notification.type === 'warning' && <Bell size={16} />}
                        {notification.type === 'info' && <Zap size={16} />}
                      </div>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="theme-selector-wrapper">
            <select
              className="theme-select"
              value={theme}
              onChange={(e) => toggleTheme(e.target.value)}
              aria-label="Select theme"
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="theme-icon">
              {theme === 'light' && <Sun size={16} />}
              {theme === 'dark' && <Moon size={16} />}
              {theme === 'ocean' && <Droplets size={16} />}
            </div>
          </div>

          {/* User Menu */}
          <div className="user-menu-wrapper">
            <button
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                <User size={20} />
                <div className="avatar-status online"></div>
              </div>
              <div className="user-info">
                <span className="user-name">Admin</span>
                <span className="user-role">System Administrator</span>
              </div>
              <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-section">
                  <div className="user-profile">
                    <div className="profile-avatar">
                      <User size={24} />
                    </div>
                    <div className="profile-info">
                      <h5>System Admin</h5>
                      <p>admin@aquasense.com</p>
                    </div>
                  </div>
                </div>
                <div className="dropdown-section">
                  <button className="dropdown-item">
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="dropdown-item">
                    <Settings size={16} />
                    <span>System Preferences</span>
                  </button>
                  <button className="dropdown-item">
                    <Bell size={16} />
                    <span>Notification Settings</span>
                  </button>
                </div>
                <div className="dropdown-section">
                  <button className="dropdown-item logout">
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Quick Stats */}
      <div className="header-bottom">
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Last Update:</span>
            <span className="stat-value">
              {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Data Points:</span>
            <span className="stat-value">{statistics.total_readings?.toLocaleString() || '0'}</span>
          </div>
          
        </div>

        <div className="system-health">
          <div className="health-indicator">
            <div className="health-bar">
              <div className="health-fill" style={{ width: '95%' }}></div>
            </div>
            <span className="health-label">System Health: Excellent</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;