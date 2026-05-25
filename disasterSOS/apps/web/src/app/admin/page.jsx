'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ui/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  
  const [fakeQueue, setFakeQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('fake'); // fake, users, logs
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFeedbackMsg('');
    try {
      // 1. Get fake queue alerts
      const fakeRes = await apiService.get('/admin/fake-queue');
      setFakeQueue(fakeRes.data.data || []);

      // 2. Get registered users
      const usersRes = await apiService.get('/admin/users?limit=100');
      setUsers(usersRes.data.data || []);

      // 3. Get system audit logs
      const logsRes = await apiService.get('/admin/logs?limit=50');
      setAuditLogs(logsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin logs/tables:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFake = async (alertId) => {
    try {
      await apiService.post(`/admin/fake-queue/${alertId}/confirm`);
      setFeedbackMsg('Alert successfully logged as FAKE and reporter penalized.');
      fetchData();
    } catch (err) {
      setFeedbackMsg('Failed to process fake report confirmation.');
    }
  };

  const handleOverrideFake = async (alertId) => {
    try {
      await apiService.post(`/admin/fake-queue/${alertId}/override`);
      setFeedbackMsg('Alert overridden to VERIFIED state and alerts issued.');
      fetchData();
    } catch (err) {
      setFeedbackMsg('Failed to process alert override.');
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await apiService.patch(`/admin/users/${userId}/role`, { role });
      setFeedbackMsg('User role updated successfully.');
      fetchData();
    } catch (err) {
      setFeedbackMsg('Failed to change user permission level.');
    }
  };

  const handleBanToggle = async (userId, currentBanState) => {
    try {
      await apiService.patch(`/admin/users/${userId}/ban`, { isBanned: !currentBanState });
      setFeedbackMsg(`User account successfully ${!currentBanState ? 'Banned' : 'Unbanned'}.`);
      fetchData();
    } catch (err) {
      setFeedbackMsg('Failed to toggle ban setting.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        
        {/* Navigation Bar */}
        <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center font-black text-white text-lg">A</div>
              <span className="font-extrabold text-lg tracking-tight uppercase">Command Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm hidden sm:inline">Admin session: <strong className="text-slate-200">{user?.name}</strong></span>
              <button 
                onClick={logout}
                className="py-1.5 px-4 bg-slate-900 border border-slate-800 hover:border-red-500/20 text-slate-300 hover:text-red-400 text-xs font-bold rounded-xl transition duration-150"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          <div className="flex justify-between items-center p-6 bg-slate-900/20 border border-slate-800 rounded-3xl">
            <div>
              <h2 className="text-xl font-bold text-slate-200">System Command Center Controls</h2>
              <p className="text-slate-500 text-xs mt-1">Ban malicious accounts, review system audit trials, and resolve AI flagged fake reports.</p>
            </div>
            <button 
              onClick={fetchData}
              className="py-2 px-4 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              Refresh Console
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-slate-900 border border-red-500/20 text-red-450 text-xs font-semibold rounded-2xl">
              {feedbackMsg}
            </div>
          )}

          {/* Console Navigation tabs */}
          <div className="flex space-x-2 bg-slate-900/50 p-1.5 rounded-2xl w-max border border-slate-800">
            <button
              onClick={() => setActiveTab('fake')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'fake' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Flagged Fake Queue ({fakeQueue.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'users' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              User Directory & Moderation ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'logs' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              System Audit Trails ({auditLogs.length})
            </button>
          </div>

          <div className="min-h-[400px]">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Querying admin database...</div>
            ) : (
              <>
                {/* 1. Fake Queue */}
                {activeTab === 'fake' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fakeQueue.length === 0 ? (
                      <p className="text-slate-500 text-sm col-span-3 text-center py-12">No reports marked for spam review in the fake queue.</p>
                    ) : (
                      fakeQueue.map(alert => (
                        <div key={alert._id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-start">
                              <strong className="text-slate-200 block text-base leading-tight">{alert.title}</strong>
                              <span className="px-2 py-0.5 bg-red-950/60 border border-red-500/20 text-red-400 text-[10px] font-bold rounded">
                                AI Confidence: {alert.aiScore?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs mt-3 leading-relaxed">{alert.description}</p>
                            
                            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl text-[11px] text-slate-500 space-y-1 mt-3">
                              <div>Reported By: <strong className="text-slate-400">{alert.reportedBy?.name || 'Anonymous'}</strong></div>
                              <div>Reporter email: {alert.reportedBy?.email || 'N/A'}</div>
                              <div>Fake Report count: <strong className="text-red-400">{alert.reportedBy?.fakeReportCount || 0} / 5</strong></div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t border-slate-900">
                            <button
                              onClick={() => handleConfirmFake(alert._id)}
                              className="flex-1 py-2.5 bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs rounded-xl transition"
                            >
                              Confirm Fake
                            </button>
                            <button
                              onClick={() => handleOverrideFake(alert._id)}
                              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-700"
                            >
                              Override & Verify
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. User directory & moderation */}
                {activeTab === 'users' && (
                  <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs tracking-wider">
                          <tr>
                            <th className="p-4 font-bold">User Name</th>
                            <th className="p-4 font-bold">Email</th>
                            <th className="p-4 font-bold">District</th>
                            <th className="p-4 font-bold">Role</th>
                            <th className="p-4 font-bold">Fake Count</th>
                            <th className="p-4 font-bold text-right">Moderation Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {users.map(userItem => (
                            <tr key={userItem._id} className="hover:bg-slate-900/25 transition">
                              <td className="p-4 font-semibold text-slate-200">{userItem.name}</td>
                              <td className="p-4 text-slate-400">{userItem.email}</td>
                              <td className="p-4 text-slate-400">{userItem.district}</td>
                              <td className="p-4">
                                <select
                                  value={userItem.role}
                                  onChange={(e) => handleUpdateRole(userItem._id, e.target.value)}
                                  className="bg-slate-950 border border-slate-850 text-slate-300 text-xs px-2 py-1 rounded-lg"
                                >
                                  <option value="citizen">Citizen</option>
                                  <option value="ngo">NGO</option>
                                  <option value="ndrf">NDRF</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="p-4 text-slate-400 font-bold">{userItem.fakeReportCount || 0}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleBanToggle(userItem._id, userItem.isBanned)}
                                  className={`py-1 px-3.5 text-xs font-bold rounded-lg transition ${userItem.isBanned ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10 hover:bg-emerald-900/40' : 'bg-red-950/60 text-red-400 border border-red-500/10 hover:bg-red-900/40'}`}
                                >
                                  {userItem.isBanned ? 'Unban User' : 'Ban User'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. System audit logs */}
                {activeTab === 'logs' && (
                  <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-slate-900/60 border-b border-slate-850 font-bold text-xs uppercase tracking-wider text-slate-400">
                      System Mutation Audit Logs (Last 50 actions)
                    </div>
                    <div className="divide-y divide-slate-900">
                      {auditLogs.length === 0 ? (
                        <p className="p-6 text-center text-slate-500 text-sm">No administration actions logged yet.</p>
                      ) : (
                        auditLogs.map(log => (
                          <div key={log._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-900/10">
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 bg-slate-950 text-slate-400 font-bold rounded uppercase tracking-wide border border-slate-850">
                                {log.action}
                              </span>
                              <span className="text-slate-400 ml-2">Target ID: {log.target}</span>
                              <p className="text-slate-500 mt-1">Details: {JSON.stringify(log.details || {})}</p>
                            </div>
                            <div className="text-right text-[10px] text-slate-500">
                              <div>By: {log.performedBy?.name || 'Admin'}</div>
                              <div>{new Date(log.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
