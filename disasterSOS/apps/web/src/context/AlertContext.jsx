import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext([]);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
