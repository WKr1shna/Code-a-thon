import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext';
import '../app.css';

export const metadata = {
  title: 'Disaster Response & Safety Alert Coordination Portal',
  description: 'Unified disaster dispatching and emergency command center'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen">
        <AuthProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
