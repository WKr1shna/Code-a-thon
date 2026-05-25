import { useState, useEffect } from 'react';
import apiService from '../services/api.service';

export default function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    apiService.get('/alerts').then(res => setAlerts(res.data.alerts || []));
  }, []);

  return alerts;
}
