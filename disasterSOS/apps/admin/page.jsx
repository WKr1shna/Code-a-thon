import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-500">System Analytics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-neutral-800 border border-neutral-700 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-neutral-400">Total Active Incidents</h3>
          <p className="text-4xl font-extrabold mt-2 text-white">1,482</p>
        </div>
        <div className="p-6 bg-neutral-800 border border-neutral-700 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-neutral-400">Responders Dispatched</h3>
          <p className="text-4xl font-extrabold mt-2 text-white">394</p>
        </div>
        <div className="p-6 bg-neutral-800 border border-neutral-700 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-neutral-400">Success Mitigation Rate</h3>
          <p className="text-4xl font-extrabold mt-2 text-emerald-400">94.8%</p>
        </div>
      </div>
    </div>
  );
}
