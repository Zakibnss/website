import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  Info,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatisticsCard = ({ 
  stat, 
  variant = 'default',
  onClick,
  isLoading = false
}) => {
  const {
    title,
    value,
    change,
    changeType = 'percentage',
    icon,
    color,
    trend = 'up',
    unit = '',
    description,
    subValue,
    progress,
    status = 'normal',
    sparklineData,
    compareTo = 'previous',
    timestamp
  } = stat;

  // Get trend configuration
  const getTrendConfig = () => {
    switch(trend) {
      case 'up':
        return {
          icon: <ArrowUpRight size={16} />,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          text: 'Increased'
        };
      case 'down':
        return {
          icon: <ArrowDownRight size={16} />,
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          text: 'Decreased'
        };
      case 'stable':
        return {
          icon: <Minus size={16} />,
          color: '#6b7280',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          text: 'Stable'
        };
      default:
        return {
          icon: <TrendingUp size={16} />,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          text: 'Increased'
        };
    }
  };

  // Get status configuration
  const getStatusConfig = () => {
    switch(status) {
      case 'critical':
        return {
          icon: <AlertCircle size={14} />,
          color: '#ef4444',
          text: 'Critical'
        };
      case 'warning':
        return {
          icon: <AlertCircle size={14} />,
          color: '#f59e0b',
          text: 'Warning'
        };
      case 'success':
        return {
          icon: <TrendingUp size={14} />,
          color: '#10b981',
          text: 'Optimal'
        };
      default:
        return {
          icon: <Info size={14} />,
          color: '#6b7280',
          text: 'Normal'
        };
    }
  };

  const trendConfig = getTrendConfig();
  const statusConfig = getStatusConfig();

  // Render different variants
  const renderDefaultVariant = () => (
    <motion.div 
      className={`stat-card variant-${variant}`}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
    >
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        
        <div className="stat-header-right">
          {status !== 'normal' && (
            <div className="stat-status" style={{ color: statusConfig.color }}>
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </div>
          )}
          
          <button className="stat-menu-btn">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="stat-content">
        <div className="stat-value-section">
          <h3 className="stat-value">
            {isLoading ? (
              <div className="skeleton skeleton-text"></div>
            ) : (
              <>
                {value}
                {unit && <span className="stat-unit">{unit}</span>}
              </>
            )}
          </h3>
          
          <div className="stat-title">
            {isLoading ? (
              <div className="skeleton skeleton-text skeleton-text-sm"></div>
            ) : (
              title
            )}
          </div>
        </div>

        <div className="stat-trend-section">
          <div 
            className="stat-change" 
            style={{ 
              backgroundColor: trendConfig.bgColor,
              color: trendConfig.color
            }}
          >
            {trendConfig.icon}
            <span>
              {change}
              {changeType === 'percentage' && '%'}
              {changeType === 'absolute' && unit}
            </span>
          </div>
          
          <div className="stat-compare">
            vs. {compareTo}
          </div>
        </div>

        {description && (
          <div className="stat-description">
            {description}
          </div>
        )}

        {sparklineData && (
          <div className="stat-sparkline">
            <svg width="100%" height="40" viewBox="0 0 100 40">
              <path
                d={sparklineData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {progress !== undefined && (
          <div className="stat-progress">
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ backgroundColor: color }}
              />
            </div>
            <div className="progress-labels">
              <span>0%</span>
              <span>{progress}%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {subValue && (
          <div className="stat-subvalue">
            <span className="sub-label">Previous:</span>
            <span className="sub-value">{subValue}{unit}</span>
          </div>
        )}
      </div>

      {timestamp && (
        <div className="stat-footer">
          <span className="timestamp">
            Updated: {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button className="refresh-btn">
            <RefreshCw size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderCompactVariant = () => (
    <motion.div 
      className="stat-card variant-compact"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="stat-header-compact">
        <div className="stat-icon-compact" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <h4 className="stat-title-compact">{title}</h4>
      </div>
      
      <div className="stat-value-compact">
        {value}
        {unit && <span className="unit-small">{unit}</span>}
      </div>
      
      <div className="stat-change-compact" style={{ color: trendConfig.color }}>
        {trendConfig.icon}
        <span>{change}{changeType === 'percentage' && '%'}</span>
      </div>
    </motion.div>
  );

  const renderHighlightVariant = () => (
    <motion.div 
      className="stat-card variant-highlight"
      style={{ 
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        borderLeft: `4px solid ${color}`
      }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      onClick={onClick}
    >
      <div className="highlight-header">
        <h3 className="highlight-title">{title}</h3>
        <div className="highlight-badge" style={{ backgroundColor: color }}>
          {icon}
        </div>
      </div>
      
      <div className="highlight-content">
        <div className="highlight-value">
          {value}
          {unit && <span className="highlight-unit">{unit}</span>}
        </div>
        
        <div className="highlight-trend">
          <div className="trend-indicator" style={{ color: trendConfig.color }}>
            {trendConfig.icon}
            <span>{trendConfig.text}</span>
          </div>
          <div className="trend-value" style={{ color: trendConfig.color }}>
            {change}{changeType === 'percentage' && '%'}
          </div>
        </div>
        
        {description && (
          <p className="highlight-description">{description}</p>
        )}
      </div>
    </motion.div>
  );

  const renderProgressVariant = () => (
    <motion.div 
      className="stat-card variant-progress"
      onClick={onClick}
    >
      <div className="progress-header">
        <div className="progress-title">
          <div className="progress-icon" style={{ color }}>
            {icon}
          </div>
          <h4>{title}</h4>
        </div>
        <span className="progress-value" style={{ color }}>
          {progress}%
        </span>
      </div>
      
      <div className="progress-container">
        <motion.div 
          className="progress-track"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        >
          <div className="progress-glow"></div>
        </motion.div>
      </div>
      
      <div className="progress-details">
        <div className="progress-labels">
          <span>0</span>
          <span>Target: {value}{unit}</span>
          <span>100%</span>
        </div>
        
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-label">Current</span>
            <span className="stat-value">{value}{unit}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Change</span>
            <div className="stat-change" style={{ color: trendConfig.color }}>
              {trendConfig.icon}
              <span>{change}{changeType === 'percentage' && '%'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSparklineVariant = () => (
    <motion.div 
      className="stat-card variant-sparkline"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="sparkline-header">
        <div className="sparkline-title">
          <div className="sparkline-icon" style={{ color }}>
            {icon}
          </div>
          <h4>{title}</h4>
        </div>
        <button className="maximize-btn">
          <Maximize2 size={16} />
        </button>
      </div>
      
      <div className="sparkline-content">
        <div className="sparkline-chart">
          <svg width="100%" height="60" viewBox="0 0 300 60">
            <path
              d={sparklineData || "M0,50 L50,30 L100,40 L150,20 L200,45 L250,35 L300,50"}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={sparklineData || "M0,50 L50,30 L100,40 L150,20 L200,45 L250,35 L300,50"}
              fill={`url(#gradient-${color})`}
              stroke="none"
              opacity="0.3"
            />
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="sparkline-stats">
          <div className="stat-main">
            <span className="stat-value">{value}{unit}</span>
            <div className="stat-change" style={{ color: trendConfig.color }}>
              {trendConfig.icon}
              <span>{change}{changeType === 'percentage' && '%'}</span>
            </div>
          </div>
          
          <div className="stat-secondary">
            <div className="stat-item">
              <span className="stat-label">High</span>
              <span className="stat-value">{(value * 1.2).toFixed(1)}{unit}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Low</span>
              <span className="stat-value">{(value * 0.8).toFixed(1)}{unit}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render based on variant
  switch(variant) {
    case 'compact':
      return renderCompactVariant();
    case 'highlight':
      return renderHighlightVariant();
    case 'progress':
      return renderProgressVariant();
    case 'sparkline':
      return renderSparklineVariant();
    default:
      return renderDefaultVariant();
  }
};

export default StatisticsCard;