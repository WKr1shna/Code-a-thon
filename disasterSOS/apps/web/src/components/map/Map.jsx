'use client';

import React from 'react';

export default function Map() {
  return (
    <div className="relative w-full h-[320px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      
      {/* Simulation Heatmap Indicators */}
      <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl animate-pulse delay-700"></div>

      <div className="z-10 text-center p-6">
        <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
        </svg>
        <h4 className="text-slate-200 font-bold text-sm">Interactive GIS Platform Mapping</h4>
        <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">Spatial indices active. Geofencing locations loaded, showing capacity counts in real-time.</p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono">
        <span>Lng: 80.2707 | Lat: 13.0827</span>
        <span>Radius: 20km Active</span>
      </div>
    </div>
  );
}
