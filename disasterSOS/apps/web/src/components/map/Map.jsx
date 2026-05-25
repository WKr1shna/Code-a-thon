'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading Live Map Data...</span>
    </div>
  )
});

export default function Map() {
  return <MapComponent />;
}
