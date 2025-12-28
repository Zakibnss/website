import React from 'react';
import { 
  LayoutDashboard, Map, History, Settings, Cpu, AlertTriangle, 
  BarChart3, Download, HelpCircle, ChevronLeft, ChevronRight, 
  Activity, Shield, Zap, Cloud, Database, BarChart, 
  TrendingUp, Users, Globe, Bell, Wifi, Battery
} from 'lucide-react';
import logo from '../images/logo.png';

// Sidebar Component
const Sidebar = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, badge: null },
    { id: 'map', label: 'Live Map', icon: <Map size={20} /> },

    { id: 'history', label: 'History', icon: <History size={20} />, badge: null },
   
  ];

  const toolsItems = [
   
   
  ];

  const systemStatus = {
    overall: 'optimal',
    devices: { online: 12, total: 15 },
    alerts: { active: 2, resolved: 15 },
    uptime: '99.8%'
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <div className="water-ripple"></div>
            <Globe size={24} className="globe-icon" />
          </div>
          {isOpen && (
            <div className="brand-text">
              <h1 className="brand-title">AquaCheck Water Conditioning</h1>
              <p className="brand-subtitle">IoT Water Monitoring</p>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="section-label">MONITORING</h3>
          <div className="nav-items">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
                aria-label={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {isOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
                {activePage === item.id && (
                  <div className="active-indicator"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        

        
        {/* System Status */}
       
        
      </nav>

      {/* User Profile */}
     
    </aside>
  );
};

export default Sidebar;