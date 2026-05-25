import React from 'react';
export default function SeverityBadge({ severity }) {
  return (
    <span className="px-2 py-1 text-xs rounded bg-red-900/50 text-red-400 font-semibold">
      {severity}
    </span>
  );
}
