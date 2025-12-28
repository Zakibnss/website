const API_BASE_URL = 'http://localhost:5000/api';

export const fetchSensorData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/readings?limit=50`);
    if (!response.ok) throw new Error('Failed to fetch sensor data');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const sendTestData = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sensor/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to send test data');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getHistoricalData = async (days = 7) => {
  try {
    const response = await fetch(`${API_BASE_URL}/readings/history?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch historical data');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getHeatmapData = async (days = 7) => {
  try {
    const response = await fetch(`${API_BASE_URL}/heatmap?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch heatmap data');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateAlertStatus = async (alertId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: status })
    });
    if (!response.ok) throw new Error('Failed to update alert');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getDevices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`);
    if (!response.ok) throw new Error('Failed to fetch devices');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateDevice = async (deviceId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update device');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};