'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ui/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import AlertCard from '../../components/common/AlertCard';

export default function ResponderPortal() {
  const { user, logout } = useAuth();
  
  const [unclaimedAlerts, setUnclaimedAlerts] = useState([]);
  const [claimedAlerts, setClaimedAlerts] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('claim'); // claim, active, tasks
  const [updateTexts, setUpdateTexts] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFeedbackMsg('');
    try {
      // 1. Get unclaimed alerts (pending)
      const pendingRes = await apiService.get('/sos?status=pending&limit=100');
      setUnclaimedAlerts(pendingRes.data.data || []);

      // 2. Get my claimed alerts
      const claimedRes = await apiService.get('/responders/my-alerts');
      setClaimedAlerts(claimedRes.data.data || []);

      // 3. Get volunteer profile and assigned tasks
      const volunteerTasksRes = await apiService.get('/volunteers/my-tasks').catch(() => null);
      if (volunteerTasksRes) {
        setTasks(volunteerTasksRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load responder dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAlert = async (alertId) => {
    try {
      await apiService.post(`/responders/claim/${alertId}`);
      setFeedbackMsg('Incident claimed successfully!');
      fetchData();
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Failed to claim incident.');
    }
  };

  const handlePostUpdate = async (alertId) => {
    const text = updateTexts[alertId];
    if (!text) return;

    try {
      await apiService.post(`/responders/update/${alertId}`, { text });
      setUpdateTexts(prev => ({ ...prev, [alertId]: '' }));
      setFeedbackMsg('Incident log entry posted successfully!');
      fetchData();
    } catch (err) {
      setFeedbackMsg('Failed to post incident log.');
    }
  };

  const handleTaskStatusUpdate = async (taskId, status) => {
    try {
      await apiService.patch(`/volunteers/my-tasks/${taskId}`, { status });
      setFeedbackMsg(`Task marked as ${status}!`);
      fetchData();
    } catch (err) {
      setFeedbackMsg('Failed to update task status.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ngo', 'ndrf', 'admin']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        
        {/* Navigation Bar */}
        <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-black text-white text-lg">H</div>
              <span className="font-extrabold text-lg tracking-tight uppercase">First Responder Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm hidden sm:inline">Role: <strong className="text-slate-200 capitalize">{user?.role}</strong></span>
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
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <div>
              <h2 className="text-xl font-bold text-slate-200">Incident Claims & Task Board</h2>
              <p className="text-slate-500 text-xs mt-1">Claim reports, post rescue coordinates logs, and track checklist duties.</p>
            </div>
            <button 
              onClick={fetchData}
              className="py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              Refresh Dashboard
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-slate-900 border border-sky-500/20 text-sky-400 text-xs font-semibold rounded-2xl">
              {feedbackMsg}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex space-x-2 bg-slate-900/50 p-1.5 rounded-2xl w-max border border-slate-800">
            <button
              onClick={() => setActiveTab('claim')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'claim' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Unclaimed SOS Feed ({unclaimedAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'active' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              My Claimed Emergencies ({claimedAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'tasks' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Assigned Action Tasks ({tasks.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading dashboards...</div>
            ) : (
              <>
                {/* 1. Unclaimed SOS alerts */}
                {activeTab === 'claim' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unclaimedAlerts.length === 0 ? (
                      <p className="text-slate-500 text-sm col-span-3 text-center py-12">No unclaimed pending reports reported in this area.</p>
                    ) : (
                      unclaimedAlerts.map(alert => (
                        <AlertCard 
                          key={alert._id} 
                          alert={alert} 
                          onClaim={handleClaimAlert} 
                          claimLabel="Claim SOS Emergency"
                        />
                      ))
                    )}
                  </div>
                )}

                {/* 2. My Claimed active alerts */}
                {activeTab === 'active' && (
                  <div className="space-y-6">
                    {claimedAlerts.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-12">You have not claimed any emergency incident reports yet.</p>
                    ) : (
                      claimedAlerts.map(alert => (
                        <div key={alert._id} className="p-6 bg-slate-900/30 border border-slate-800 rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-1 space-y-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Active Incident</span>
                              <h3 className="text-lg font-bold mt-1 text-slate-100">{alert.title}</h3>
                              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{alert.description}</p>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                              <div>Type: <strong className="text-slate-400 uppercase">{alert.type}</strong></div>
                              <div>Severity: <strong className="text-slate-400">{alert.severity}</strong></div>
                              <div>Reported: {new Date(alert.createdAt).toLocaleString()}</div>
                            </div>
                          </div>

                          {/* Posting update updates log and updates list */}
                          <div className="lg:col-span-2 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-900 lg:pl-6 pt-4 lg:pt-0">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Responder updates & log history</h4>
                            
                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                              {alert.responderUpdates && alert.responderUpdates.length > 0 ? (
                                alert.responderUpdates.map((update, idx) => (
                                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs leading-relaxed">
                                    <p className="text-slate-300">{update.text}</p>
                                    <span className="text-[10px] text-slate-500 mt-1 block">
                                      Posted by: {update.postedBy?.name || 'Responder'} | {new Date(update.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-slate-500 text-xs">No updates logged yet on this emergency incident.</p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={updateTexts[alert._id] || ''}
                                onChange={(e) => setUpdateTexts(prev => ({ ...prev, [alert._id]: e.target.value }))}
                                placeholder="Log emergency notes, blockages, casualties stats..."
                                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl outline-none"
                              />
                              <button
                                onClick={() => handlePostUpdate(alert._id)}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition"
                              >
                                Post Log
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. Assigned tasks checklists */}
                {activeTab === 'tasks' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tasks.length === 0 ? (
                      <p className="text-slate-500 text-sm col-span-2 text-center py-12">No dispatch tasks assigned to your profile.</p>
                    ) : (
                      tasks.map(task => (
                        <div key={task._id} className="p-6 bg-slate-900/30 border border-slate-800 rounded-3xl space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${task.priority === 'HIGH' ? 'text-orange-400 border-orange-500/20 bg-orange-500/10' : 'text-slate-400 border-slate-800 bg-slate-900/50'}`}>
                                Priority: {task.priority}
                              </span>
                              <h3 className="text-base font-bold text-slate-200 mt-2">{task.title}</h3>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                              {task.status}
                            </span>
                          </div>

                          <p className="text-slate-400 text-xs leading-relaxed">{task.description}</p>
                          
                          {task.alertId && (
                            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs space-y-1">
                              <span className="text-[9px] uppercase font-bold text-slate-500 block">Incident context</span>
                              <strong>{task.alertId.title}</strong>
                              <p className="text-slate-400 leading-relaxed mt-0.5">{task.alertId.description}</p>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                            <span className="text-[10px] text-slate-500">Task Actions:</span>
                            <div className="flex space-x-1.5">
                              {task.status !== 'completed' && (
                                <button
                                  onClick={() => handleTaskStatusUpdate(task._id, 'completed')}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition"
                                >
                                  Complete Task
                                </button>
                              )}
                              {task.status !== 'in-progress' && task.status !== 'completed' && (
                                <button
                                  onClick={() => handleTaskStatusUpdate(task._id, 'in-progress')}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition border border-slate-750"
                                >
                                  Mark In-Progress
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
