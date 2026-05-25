import React from 'react';
import AlertFederation from './AlertFederation';
import UserManagement from './UserManagement';
import Analytics from './Analytics';
import BroadcastCenter from './BroadcastCenter';

export default function SupervisorPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-blue-500">Supervisor Command Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AlertFederation />
        <UserManagement />
        <Analytics />
        <BroadcastCenter />
      </div>
    </div>
  );
}
