import React from 'react';
import OperationCenter from './OperationCenter';
import Deployment from './Deployment';
import Reports from './Reports';
import PredictiveMap from './PredictiveMap';

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-amber-500">System Admin Control Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OperationCenter />
        <Deployment />
        <Reports />
        <PredictiveMap />
      </div>
    </div>
  );
}
