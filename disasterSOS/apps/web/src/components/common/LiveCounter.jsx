import React from 'react';

export default function LiveCounter({ label, count, colorClass = 'text-red-500' }) {
  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-center items-center backdrop-blur-md">
      <span className={`text-4xl font-extrabold tracking-tight ${colorClass}`}>{count}</span>
      <span className="text-slate-400 text-xs font-semibold uppercase mt-1 tracking-wider">{label}</span>
    </div>
  );
}
