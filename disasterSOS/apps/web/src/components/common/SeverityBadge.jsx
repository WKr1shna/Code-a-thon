import React from 'react';

export default function SeverityBadge({ severity }) {
  const styles = {
    LOW: 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400',
    MEDIUM: 'bg-amber-950/80 border border-amber-500/30 text-amber-400',
    HIGH: 'bg-orange-950/80 border border-orange-500/30 text-orange-400',
    CRITICAL: 'bg-red-950/80 border border-red-500/30 text-red-400 animate-pulse'
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${styles[severity] || styles.LOW}`}>
      {severity}
    </span>
  );
}
