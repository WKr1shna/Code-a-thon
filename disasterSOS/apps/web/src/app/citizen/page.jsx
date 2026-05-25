import React from 'react';
import SOSReport from './SOSReport';
import AlertFeed from './AlertFeed';
import SafetyGuide from './SafetyGuide';
import ResourceLocator from './ResourceLocator';

export default function CitizenPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-red-500">Citizen Response Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SOSReport />
        <AlertFeed />
        <SafetyGuide />
        <ResourceLocator />
      </div>
    </div>
  );
}
