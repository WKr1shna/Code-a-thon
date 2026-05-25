import React from 'react';
export default function AdminDashboardLayout({ children }) {
  return (
    <div className="admin-dashboard min-h-screen bg-neutral-900 text-white">
      <header className="p-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold">National Analytics & Admin Control Panel</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
