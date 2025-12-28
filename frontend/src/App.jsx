import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Loading from './components/Loading';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/Map';
import History from './pages/History';
import Admin from './pages/Admin';
import './styles/app.css';
import './styles/dashboard.css';
import './styles/header.css';
import './styles/sidebar.css';
import './styles/map.css';
import './styles/mapcomponent.css';
import './styles/statisticscard.css';
import './styles/qualitybanner.css';
import './styles/loading.css';
import './styles/sensorcard.css';
import './styles/history.css';
import './styles/admin.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'map': return <MapPage />;
      case 'history': return <History />;
      case 'admin': return <Admin />;
      default: return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <DataProvider>
        <div className="app-container">
          <Sidebar 
            activePage={activePage}
            setActivePage={setActivePage}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
          
          <div 
            className="main-content"
            style={{ marginLeft: sidebarOpen ? '280px' : '80px' }}
          >
            <Header 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
            />
            
            <div className="content-wrapper">
              {renderPage()}
            </div>
          </div>
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;