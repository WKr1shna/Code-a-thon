'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.service';
import socketService from '../services/socket.service';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Expand radius to 10,000km to capture alerts globally regardless of user GPS
      const response = await apiService.get('/sos/nearby?lat=13.0827&lng=80.2707&radius=10000');
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load active alerts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Connect to WebSocket
    socketService.connect();
    
    // Listen for real-time events
    const handleNewAlert = (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    };
    
    const handleStatusUpdate = (updatedAlert) => {
      setAlerts(prev => prev.map(a => a._id === updatedAlert._id ? updatedAlert : a));
    };

    socketService.on('new_sos_alert', handleNewAlert);
    socketService.on('alert_status_update', handleStatusUpdate);

    return () => {
      socketService.off('new_sos_alert', handleNewAlert);
      socketService.off('alert_status_update', handleStatusUpdate);
      socketService.disconnect();
    };
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts, fetchAlerts, loading }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
