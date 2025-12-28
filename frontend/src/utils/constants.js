export const SENSOR_THRESHOLDS = {
  temperature: {
    min: 0,
    max: 40,
    optimal: [15, 25],
    danger: { low: 0, high: 30 },
    warning: { low: 5, high: 28 }
  },
  ph: {
    min: 0,
    max: 14,
    optimal: [6.5, 8.5],
    danger: { low: 4, high: 10 },
    warning: { low: 5.5, high: 9 }
  },
  tds: {
    min: 0,
    max: 2000,
    optimal: [50, 250],
    danger: { low: 0, high: 1000 },
    warning: { low: 20, high: 500 }
  },
  turbidity: {
    min: 0,
    max: 100,
    optimal: [0, 5],
    danger: { low: 0, high: 50 },
    warning: { low: 2, high: 20 }
  },
  dissolved_oxygen: {
    min: 0,
    max: 20,
    optimal: [5, 10],
    danger: { low: 2, high: 15 },
    warning: { low: 3, high: 12 }
  },
  conductivity: {
    min: 0,
    max: 2000,
    optimal: [100, 800],
    danger: { low: 50, high: 1500 },
    warning: { low: 80, high: 1200 }
  }
};

export const QUALITY_LEVELS = {
  GOOD: {
    color: '#10b981',
    icon: '✓',
    label: 'Excellent',
    score: 100,
    description: 'All parameters within safe limits'
  },
  WARNING: {
    color: '#f59e0b',
    icon: '⚠',
    label: 'Moderate',
    score: 60,
    description: 'Some parameters require attention'
  },
  DANGER: {
    color: '#ef4444',
    icon: '⚡',
    label: 'Critical',
    score: 30,
    description: 'Immediate action required'
  }
};

export const DEVICE_STATUS = {
  ONLINE: {
    color: '#10b981',
    label: 'Online',
    icon: '🟢'
  },
  OFFLINE: {
    color: '#6b7280',
    label: 'Offline',
    icon: '⚫'
  },
  MAINTENANCE: {
    color: '#f59e0b',
    label: 'Maintenance',
    icon: '🟡'
  },
  ERROR: {
    color: '#ef4444',
    label: 'Error',
    icon: '🔴'
  }
};

export const ALERT_TYPES = {
  CRITICAL: {
    color: '#ef4444',
    icon: '⚡',
    priority: 1
  },
  WARNING: {
    color: '#f59e0b',
    icon: '⚠',
    priority: 2
  },
  INFO: {
    color: '#3b82f6',
    icon: 'ℹ️',
    priority: 3
  }
};

export const MAP_CONFIG = {
  defaultCenter: [35.1892, -0.6417],
  defaultZoom: 6,
  maxZoom: 18,
  minZoom: 3,
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors'
};

export const calculateWaterQuality = (reading) => {
  const issues = [];
  let score = 100;
  
  // Temperature check
  if (reading.temperature < SENSOR_THRESHOLDS.temperature.warning.low || 
      reading.temperature > SENSOR_THRESHOLDS.temperature.warning.high) {
    issues.push(`Temperature out of range: ${reading.temperature.toFixed(1)}°C`);
    score -= 20;
  }
  
  // pH check
  if (reading.ph < SENSOR_THRESHOLDS.ph.warning.low || 
      reading.ph > SENSOR_THRESHOLDS.ph.warning.high) {
    issues.push(`pH out of range: ${reading.ph.toFixed(1)}`);
    score -= 20;
  }
  
  // TDS check
  if (reading.tds > SENSOR_THRESHOLDS.tds.warning.high) {
    issues.push(`High TDS: ${reading.tds.toFixed(0)} mg/L`);
    score -= 20;
  }
  
  // Turbidity check
  if (reading.turbidity > SENSOR_THRESHOLDS.turbidity.warning.high) {
    issues.push(`High turbidity: ${reading.turbidity.toFixed(1)} NTU`);
    score -= 20;
  }
  
  // Determine quality level
  let level = 'good';
  if (score <= 30) {
    level = 'danger';
  } else if (score <= 60) {
    level = 'warning';
  }
  
  const confidence = Math.min(0.95, 0.7 + (score / 100) * 0.25);
  
  return {
    level,
    score: Math.round(score),
    confidence,
    issues,
    message: issues.length > 0 
      ? `${issues.length} parameter${issues.length > 1 ? 's' : ''} require attention`
      : 'All parameters within normal limits'
  };
};