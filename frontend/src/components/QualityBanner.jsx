import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { calculateWaterQuality } from '../utils/constants';

const QualityBanner = ({ reading }) => {
  const quality = calculateWaterQuality(reading);
  
  const getQualityConfig = () => {
    switch(quality.level) {
      case 'good':
        return {
          icon: <CheckCircle size={24} />,
          title: 'Excellent Water Quality',
          description: 'All parameters within safe limits',
          color: 'var(--success)',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'var(--success)',
          recommendations: ['Continue regular monitoring', 'No immediate action required']
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} />,
          title: 'Moderate Water Quality',
          description: 'Some parameters require attention',
          color: 'var(--warning)',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'var(--warning)',
          recommendations: ['Increase monitoring frequency', 'Check sensor calibration']
        };
      case 'danger':
        return {
          icon: <XCircle size={24} />,
          title: 'Critical Water Quality',
          description: 'Immediate action required',
          color: 'var(--danger)',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'var(--danger)',
          recommendations: ['Initiate emergency protocol', 'Notify relevant authorities']
        };
      default:
        return {
          icon: <Info size={24} />,
          title: 'Analyzing Water Quality',
          description: 'Collecting data...',
          color: 'var(--textSecondary)',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'var(--border)',
          recommendations: []
        };
    }
  };

  const config = getQualityConfig();

  return (
    <div 
      className="quality-banner"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor
      }}
    >
      <div className="quality-header">
        <div className="quality-icon" style={{ color: config.color }}>
          {config.icon}
        </div>
        <div className="quality-info">
          <h3 className="quality-title">{config.title}</h3>
          <p className="quality-description">{config.description}</p>
          <div className="quality-metrics">
            <span className="metric">
              Confidence: <strong>{(quality.confidence * 100).toFixed(1)}%</strong>
            </span>
            <span className="metric">
              Last Update: <strong>{new Date(reading.timestamp).toLocaleTimeString()}</strong>
            </span>
          </div>
        </div>
      </div>

      {quality.issues.length > 0 && (
        <div className="quality-issues">
          <h4>Parameters Requiring Attention:</h4>
          <div className="issues-list">
            {quality.issues.map((issue, index) => (
              <div key={index} className="issue-item">
                <AlertTriangle size={14} />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {config.recommendations.length > 0 && (
        <div className="quality-recommendations">
          <h4>Recommendations:</h4>
          <ul>
            {config.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="quality-footer">
        <div className="quality-score">
          <span>Overall Score</span>
          <div className="score-circle">
            <span>{quality.score}/100</span>
          </div>
        </div>
        <button className="action-btn" style={{ backgroundColor: config.color }}>
          View Detailed Report
        </button>
      </div>
    </div>
  );
};

export default QualityBanner;