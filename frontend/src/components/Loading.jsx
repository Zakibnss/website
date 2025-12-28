import React, { useState, useEffect } from 'react';

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        {/* Brand Logo */}
        <div className="brand-section">
          <div className="logo-wrapper">
            {imageError ? (
              <div className="logo-fallback">
                <span className="water-icon">💧</span>
              </div>
            ) : (
              <img 
                src="../images/aqua.png" 
                alt="AquaCheck Water Conditioning" 
                className="logo"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            )}
          </div>
          <div className="brand-text">
            <h1 className="brand-name">AquaCheck</h1>
            <p className="brand-tagline">Water Conditioning System</p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="loading-animation">
          <div className="water-drops">
            <div className="drop"></div>
            <div className="drop"></div>
            <div className="drop"></div>
          </div>
          
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>Initializing system...</span>
              <span className="percentage">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="status-messages">
          <div className="status-item">
            <span className="status-dot active"></span>
            <span>Connecting to sensors</span>
          </div>
          <div className="status-item">
            <span className="status-dot"></span>
            <span>Loading water quality data</span>
          </div>
          <div className="status-item">
            <span className="status-dot"></span>
            <span>Preparing dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;