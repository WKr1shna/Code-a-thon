import React from 'react';
import SeverityBadge from './SeverityBadge';

export default function AlertCard({ alert, onClaim, claimLabel = 'Claim Emergency' }) {
  const statusStyles = {
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    verified: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    active: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    resolved: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    fake: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  return (
    <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-lg backdrop-blur-md hover:border-slate-700/80 transition duration-300">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-slate-100">{alert.title}</h3>
        <SeverityBadge severity={alert.severity} />
      </div>
      
      <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">{alert.description}</p>
      
      <div className="flex items-center space-x-3 mt-4">
        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${statusStyles[alert.status]}`}>
          {alert.status}
        </span>
        <span className="text-slate-500 text-xs font-medium">Type: {alert.type}</span>
      </div>

      {onClaim && alert.status === 'pending' && (
        <button
          onClick={() => onClaim(alert._id)}
          className="w-full mt-5 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition duration-200"
        >
          {claimLabel}
        </button>
      )}
    </div>
  );
}
