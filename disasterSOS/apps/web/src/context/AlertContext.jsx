'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.service';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Fetch public nearby alerts by default or active feed
      const response = await apiService.get('/sos/nearby?lat=13.0827&lng=80.2707&radius=100');
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load active alerts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
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
