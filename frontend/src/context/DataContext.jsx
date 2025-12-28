import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  fetchSensorData, 
  sendTestData as apiSendTestData,
  getHistoricalData,
  getHeatmapData,
  getStatistics,
  getAlerts,
  updateAlertStatus,
  getDevices,
  updateDevice as apiUpdateDevice
} from '../utils/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [readings, setReadings] = useState([]);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [statistics, setStatistics] = useState({
    averageQuality: 0,
    totalReadings: 0,
    alertsToday: 0,
    devicesOnline: 0,
    temperature: { min: 0, max: 0, avg: 0, count: 0 },
    ph: { min: 0, max: 0, avg: 0, count: 0 },
    tds: { min: 0, max: 0, avg: 0, count: 0 },
    turbidity: { min: 0, max: 0, avg: 0, count: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState(null);

  // Load all data from REAL API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load readings from backend
      const readingsData = await fetchSensorData();
      if (readingsData && readingsData.readings) {
        console.log('✅ Loaded readings:', readingsData.readings);
        setReadings(readingsData.readings);
      }

      // Load statistics
      const statsData = await getStatistics();
      if (statsData) {
        console.log('✅ Loaded statistics:', statsData);
        setStatistics(statsData);
      }

      // Load heatmap data
      const heatmapRawData = await getHeatmapData();
      if (heatmapRawData && heatmapRawData.heatmap) {
        console.log('✅ Loaded heatmap:', heatmapRawData.heatmap);
        setHeatmapData(heatmapRawData.heatmap);
      }

      // Load alerts
      const alertsData = await getAlerts();
      if (alertsData && alertsData.alerts) {
        console.log('✅ Loaded alerts:', alertsData.alerts);
        setAlerts(alertsData.alerts);
      }

      // Load devices
      const devicesData = await getDevices();
      if (devicesData && devicesData.devices) {
        console.log('✅ Loaded devices:', devicesData.devices);
        setDevices(devicesData.devices);
      }

      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError(error.message);
      toast.error('Failed to load sensor data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send test data to API
  const sendTestData = useCallback(async (deviceId) => {
    setIsLoading(true);
    try {
      const testData = {
        device_id: deviceId || 'sensor-01',
        temperature: 22.5 + (Math.random() * 10 - 5),
        ph: 7.2 + (Math.random() * 1.5 - 0.75),
        tds: 250 + (Math.random() * 300 - 150),
        turbidity: 3.5 + (Math.random() * 6),
        latitude: 35.1892,
        longitude: -0.6417
      };
      
      console.log('📤 Sending test data:', testData);
      const response = await apiSendTestData(testData);
      console.log('✅ Response:', response);
      
      // Reload data after sending
      await loadData();
      
      toast.success('Test data sent successfully!');
      return response;
    } catch (error) {
      console.error('❌ Error sending test data:', error);
      toast.error('Failed to send test data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // Resolve alert
  const resolveAlert = useCallback(async (alertId) => {
    try {
      await updateAlertStatus(alertId, true);
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
      
      toast.success('Alert resolved');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  }, []);

  // Update device
  const updateDevice = useCallback(async (deviceId, updates) => {
    try {
      await apiUpdateDevice(deviceId, updates);
      
      setDevices(prev => prev.map(device => 
        device.id === deviceId ? { ...device, ...updates } : device
      ));
      
      toast.success('Device updated');
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error('Failed to update device');
    }
  }, []);

  // ✅ FIXED: Include [loadData] in dependency array
  // Initial load on mount
  useEffect(() => {
    console.log('🚀 Initial load...');
    loadData();
  }, [loadData]);

  // ✅ FIXED: Include [loadData] in dependency array
  // Periodic updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Periodic update...');
      loadData();
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [loadData]);

  // ✅ Memoize context value
  const contextValue = useMemo(() => ({
    readings,
    devices,
    alerts,
    heatmapData,
    statistics,
    isLoading,
    error,
    selectedDevice,
    setSelectedDevice,
    lastUpdate,
    loadData,
    sendTestData,
    resolveAlert,
    updateDevice,
    getHistoricalData: async (days = 7) => {
      try {
        return await getHistoricalData(days);
      } catch (error) {
        console.error('Error getting historical data:', error);
        return null;
      }
    }
  }), [
    readings,
    devices,
    alerts,
    heatmapData,
    statistics,
    isLoading,
    error,
    selectedDevice,
    lastUpdate,
    loadData,
    sendTestData,
    resolveAlert,
    updateDevice
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export { DataContext };