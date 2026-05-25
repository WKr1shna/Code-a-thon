import React from 'react';
export default function LiveCounter({ label, count }) {
  return (
    <div className="text-center p-4 bg-slate-900 rounded-lg">
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
