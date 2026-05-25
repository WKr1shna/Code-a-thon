import React from 'react';
import Dashboard from './Dashboard';
import TaskManager from './TaskManager';
import StatusUpdater from './StatusUpdater';
import ResourceTracker from './ResourceTracker';

export default function ResponderPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-green-500">First Responder Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Dashboard />
        <TaskManager />
        <StatusUpdater />
        <ResourceTracker />
      </div>
    </div>
  );
}
