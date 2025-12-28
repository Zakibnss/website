import { SENSOR_THRESHOLDS, DEVICE_STATUS, ALERT_TYPES } from './constants';

export const generateMockReading = (deviceId = null) => {
  const devices = ['sensor-alpha-01', 'sensor-beta-02', 'sensor-gamma-03', 'sensor-delta-04'];
  const locations = [
    { lat: 35.1892, lng: -0.6417, name: 'Main Reservoir' },
    { lat: 35.2000, lng: -0.6500, name: 'North Treatment Plant' },
    { lat: 35.1800, lng: -0.6300, name: 'South Distribution' },
    { lat: 35.1950, lng: -0.6350, name: 'East Monitoring Station' }
  ];
  
  const deviceIndex = Math.floor(Math.random() * devices.length);
  const selectedDevice = deviceId || devices[deviceIndex];
  const location = locations[deviceIndex];
  
  // Generate realistic sensor values
  const baseTemp = 20 + (Math.random() * 10 - 5);
  const basePh = 7 + (Math.random() * 2 - 1);
  const baseTds = 200 + Math.random() * 300;
  const baseTurbidity = 2 + Math.random() * 8;
  
  // Occasionally generate problematic readings
  const isProblematic = Math.random() < 0.2;
  
  const reading = {
    id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    device_id: selectedDevice,
    location_name: location.name,
    latitude: location.lat + (Math.random() * 0.01 - 0.005),
    longitude: location.lng + (Math.random() * 0.01 - 0.005),
    temperature: isProblematic 
      ? baseTemp + (Math.random() > 0.5 ? 15 : -10)
      : baseTemp,
    ph: isProblematic 
      ? basePh + (Math.random() > 0.5 ? 3 : -2)
      : basePh,
    tds: isProblematic 
      ? baseTds + 800
      : baseTds,
    turbidity: isProblematic 
      ? baseTurbidity + 30
      : baseTurbidity,
    dissolved_oxygen: 7 + Math.random() * 3,
    conductivity: 500 + Math.random() * 300,
    battery_level: 70 + Math.random() * 25,
    signal_strength: 80 + Math.random() * 15
  };
  
  // Calculate quality
  let qualityScore = 100;
  if (reading.temperature < 5 || reading.temperature > 30) qualityScore -= 40;
  if (reading.ph < 6 || reading.ph > 9) qualityScore -= 40;
  if (reading.tds > 500) qualityScore -= 40;
  if (reading.turbidity > 20) qualityScore -= 40;
  
  reading.quality_class = qualityScore >= 80 ? 'good' : qualityScore >= 40 ? 'warning' : 'danger';
  reading.quality_score = qualityScore;
  reading.confidence = 0.85 + Math.random() * 0.1;
  
  return reading;
};

export const mockDevices = [
  {
    id: 'sensor-alpha-01',
    name: 'Alpha Sensor',
    type: 'water_quality',
    location: { lat: 35.1892, lng: -0.6417 },
    status: 'online',
    batteryLevel: 92,
    lastReading: new Date().toISOString(),
    firmwareVersion: '2.1.4',
    alerts: 2,
    parameters: ['temperature', 'ph', 'tds', 'turbidity', 'oxygen']
  },
  {
    id: 'sensor-beta-02',
    name: 'Beta Sensor',
    type: 'water_quality',
    location: { lat: 35.2000, lng: -0.6500 },
    status: 'online',
    batteryLevel: 78,
    lastReading: new Date(Date.now() - 300000).toISOString(),
    firmwareVersion: '2.0.8',
    alerts: 1,
    parameters: ['temperature', 'ph', 'tds', 'turbidity']
  },
  {
    id: 'sensor-gamma-03',
    name: 'Gamma Sensor',
    type: 'water_quality',
    location: { lat: 35.1800, lng: -0.6300 },
    status: 'offline',
    batteryLevel: 45,
    lastReading: new Date(Date.now() - 86400000).toISOString(),
    firmwareVersion: '1.9.3',
    alerts: 0,
    parameters: ['temperature', 'ph', 'tds']
  },
  {
    id: 'sensor-delta-04',
    name: 'Delta Sensor',
    type: 'water_quality',
    location: { lat: 35.1950, lng: -0.6350 },
    status: 'online',
    batteryLevel: 85,
    lastReading: new Date(Date.now() - 600000).toISOString(),
    firmwareVersion: '2.1.0',
    alerts: 3,
    parameters: ['temperature', 'ph', 'tds', 'turbidity', 'oxygen', 'conductivity']
  }
];

export const mockAlerts = [
  {
    id: 'alert_001',
    type: 'warning',
    message: 'High temperature detected at Alpha Sensor',
    deviceId: 'sensor-alpha-01',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    parameter: 'temperature',
    value: 28.5,
    threshold: 25,
    resolved: false
  },
  {
    id: 'alert_002',
    type: 'critical',
    message: 'Low pH level detected at Delta Sensor',
    deviceId: 'sensor-delta-04',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    parameter: 'ph',
    value: 5.8,
    threshold: 6.5,
    resolved: false
  },
  {
    id: 'alert_003',
    type: 'warning',
    message: 'High turbidity detected at Beta Sensor',
    deviceId: 'sensor-beta-02',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    parameter: 'turbidity',
    value: 18.2,
    threshold: 15,
    resolved: true
  }
];

export const generateHeatmapData = (count = 50) => {
  const data = [];
  const centerLat = 35.1892;
  const centerLng = -0.6417;
  
  for (let i = 0; i < count; i++) {
    const lat = centerLat + (Math.random() - 0.5) * 0.1;
    const lng = centerLng + (Math.random() - 0.5) * 0.1;
    const intensity = Math.random();
    const quality = intensity > 0.7 ? 'danger' : intensity > 0.4 ? 'warning' : 'good';
    
    data.push({
      lat,
      lng,
      intensity,
      quality,
      temperature: 20 + Math.random() * 15,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
    });
  }
  
  return data;
};

export const generateHistoricalData = (days = 7, readingsPerDay = 24) => {
  const data = [];
  const now = new Date();
  
  for (let day = days; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    for (let hour = 0; hour < readingsPerDay; hour++) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, Math.floor(Math.random() * 60));
      
      data.push({
        id: `hist_${day}_${hour}`,
        timestamp: timestamp.toISOString(),
        temperature: 18 + Math.random() * 8 + Math.sin(hour * Math.PI / 12) * 3,
        ph: 7 + Math.random() * 1.5 - 0.75,
        tds: 150 + Math.random() * 200 + Math.cos(hour * Math.PI / 6) * 50,
        turbidity: 3 + Math.random() * 7,
        device_id: Math.random() > 0.5 ? 'sensor-alpha-01' : 'sensor-beta-02',
        quality_class: Math.random() > 0.8 ? 'warning' : 'good'
      });
    }
  }
  
  return data;
};