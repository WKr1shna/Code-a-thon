import React from 'react';

export default function SeverityLegend() {
  const levels = [
    { label: 'Normal', color: 'bg-severity-normal' },
    { label: 'Low', color: 'bg-severity-low' },
    { label: 'Medium', color: 'bg-severity-medium' },
    { label: 'High', color: 'bg-severity-high' },
    { label: 'Critical', color: 'bg-severity-critical animate-pulse-fast' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
      <span className="text-sm font-bold text-gray-500 mr-2 uppercase tracking-widest">Severity:</span>
      {levels.map((lvl) => (
        <div key={lvl.label} className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${lvl.color}`}></div>
          <span className="text-sm font-medium text-gray-700">{lvl.label}</span>
        </div>
      ))}
    </div>
  );
}
