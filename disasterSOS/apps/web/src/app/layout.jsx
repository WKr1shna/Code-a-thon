import React from 'react';
import '../app.css';

export const metadata = {
  title: 'Disaster Response & Community Safety Alert Platform Dashboard',
  description: 'Real-time Emergency & Disaster Dispatch'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">{children}</body>
    </html>
  );
}
