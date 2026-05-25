'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ui/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import AlertCard from '../../components/common/AlertCard';

export default function SupervisorPortal() {
  const { user, logout } = useAuth();
  
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  // Broadcast fields
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastType, setBroadcastType] = useState('push'); // push, sms, whatsapp, emergency
  const [broadcastDistrict, setBroadcastDistrict] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    fetchPendingAlerts();
  }, []);

  const fetchPendingAlerts = async () => {
    setLoading(true);
    setFeedbackMsg('');
    try {
      const response = await apiService.get('/sos?status=pending&limit=100');
      setPendingAlerts(response.data.data || []);
    } catch (err) {
      console.error('Failed to load pending alerts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAlert = async (alertId, status) => {
    try {
      await apiService.patch(`/sos/${alertId}/status`, { status });
      setFeedbackMsg(`Incident report marked successfully as: ${status.toUpperCase()}`);
      fetchPendingAlerts();
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Failed to update incident report status.');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setSendingBroadcast(true);
    setFeedbackMsg('');

    try {
      let endpoint = '/broadcast/push';
      let payload = { title: broadcastTitle, body: broadcastBody, district: broadcastDistrict };

      if (broadcastType === 'sms') {
        endpoint = '/broadcast/sms';
        payload = { message: `${broadcastTitle}: ${broadcastBody}`, phones: ['+1111111111', '+2222222222'] }; // mock numbers
      } else if (broadcastType === 'whatsapp') {
        endpoint = '/broadcast/whatsapp';
        payload = { templateSid: 'emergency_template', phones: ['+1111111111'], vars: {} };
      } else if (broadcastType === 'emergency') {
        endpoint = '/broadcast/emergency';
        payload = { title: broadcastTitle, body: broadcastBody, district: broadcastDistrict };
      }

      const response = await apiService.post(endpoint, payload);
      setFeedbackMsg(`Emergency Broadcast dispatched successfully! Recipients reached: ${response.data.data?.recipientsCount || 0}`);
      
      // Clear forms
      setBroadcastTitle('');
      setBroadcastBody('');
    } catch (err) {
      setFeedbackMsg('Failed to dispatch broadcast. Ensure providers configured.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ndrf', 'admin']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        
        {/* Navigation Bar */}
        <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-black text-white text-lg">S</div>
              <span className="font-extrabold text-lg tracking-tight uppercase">Supervisor Command</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm hidden sm:inline">User: <strong className="text-slate-200">{user?.name}</strong></span>
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
          {/* Header */}
          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-3xl flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-200">Incident verification desk & Broadcast Center</h2>
              <p className="text-slate-500 text-xs mt-1">Review citizen reports, inspect AI confidence scores, and dispatch mass emergency alerts.</p>
            </div>
            <button 
              onClick={fetchPendingAlerts}
              className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-lg"
            >
              Refresh Desk
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-slate-900 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-2xl">
              {feedbackMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Verification Feed list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Pending SOS Alerts Verification ({pendingAlerts.length})</h3>
              
              {loading ? (
                <p className="text-slate-500 text-sm">Loading pending feed...</p>
              ) : pendingAlerts.length === 0 ? (
                <p className="text-slate-500 text-sm py-12 text-center bg-slate-900/10 border border-dashed border-slate-850 rounded-2xl">
                  No pending alerts needing verification.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingAlerts.map(alert => (
                    <div key={alert._id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-200 block text-base leading-tight">{alert.title}</strong>
                          <span className="px-2 py-0.5 bg-red-950/40 border border-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase">
                            AI Score: {alert.aiScore?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">{alert.description}</p>
                        <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">District: {alert.reportedBy?.district || 'Anonymous'}</div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-900">
                        <button
                          onClick={() => handleVerifyAlert(alert._id, 'verified')}
                          className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition"
                        >
                          Verify & Alert
                        </button>
                        <button
                          onClick={() => handleVerifyAlert(alert._id, 'fake')}
                          className="flex-1 py-2 bg-red-900/60 hover:bg-red-800 text-red-400 font-bold text-xs rounded-xl transition border border-red-500/10"
                        >
                          Mark Fake
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Broadcast panel */}
            <div className="lg:col-span-1 p-6 bg-slate-900/40 border border-slate-800 rounded-3xl h-max space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Emergency Broadcast</h3>
                <p className="text-slate-500 text-xs mt-1">Send emergency warnings to citizens on active device channels.</p>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Alert Heading</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. FLASH FLOOD WARNING"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 text-slate-100 text-xs rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Alert Message</label>
                  <textarea
                    required
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="Evacuate low lying areas immediately..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 text-slate-100 text-xs rounded-xl outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Target District (Optional)</label>
                  <input
                    type="text"
                    value={broadcastDistrict}
                    onChange={(e) => setBroadcastDistrict(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 text-slate-100 text-xs rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Channel Type</label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl outline-none"
                  >
                    <option value="push">FCM App Push Multicast</option>
                    <option value="sms">Twilio Bulk SMS Alert</option>
                    <option value="whatsapp">Twilio WhatsApp Template</option>
                    <option value="emergency">Emergency Parallel Broadcast (All)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold rounded-xl shadow-lg transition duration-200 uppercase tracking-widest text-[10px]"
                >
                  {sendingBroadcast ? 'Dispatching Broadcast...' : 'Dispatch Broadcast'}
                </button>
              </form>
            </div>

          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
