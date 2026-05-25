'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if role not allowed
        router.push(`/${user.role === 'admin' ? 'admin' : user.role === 'ndrf' ? 'supervisor' : user.role === 'ngo' ? 'responder' : 'citizen'}`);
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Verifying authorization access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
