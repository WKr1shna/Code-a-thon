import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, BarChart2, Users, Radio, CheckCircle, XCircle, LogOut, Loader2, MapPin, Activity } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SOSAssignmentCenter from './SOSAssignmentCenter';

export default function AdminDashboard() {
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, fake_queue, personnel, broadcast
  
  const [stats, setStats] = useState(null);
  const [fakeQueue, setFakeQueue] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [personnel, setPersonnel] = useState({ agencies: [], volunteers: [] });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Broadcast Form State
  const [broadcastTarget, setBroadcastTarget] = useState('All Citizens (Global)');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const mapIncidents = (rawList) => {
    return (rawList || []).map(inc => ({
      ...inc,
      id: inc.id || inc._id,
      lat: inc.lat || (inc.location?.coordinates && inc.location.coordinates[1]) || 12.9716,
      lng: inc.lng || (inc.location?.coordinates && inc.location.coordinates[0]) || 77.5946,
      reporter: inc.reporter || { fullName: inc.reportedBy?.name || 'Citizen' }
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, queueRes, broadcastRes, personnelRes, incidentsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/fake-queue'),
        api.get('/broadcast/history'),
        api.get('/admin/personnel'),
        api.get('/incidents?limit=20')
      ]);

      if (analyticsRes.data.success) setStats(analyticsRes.data.data);
      if (queueRes.data.success) setFakeQueue(mapIncidents(queueRes.data.data));
      if (broadcastRes.data.success) setBroadcasts(broadcastRes.data.data);
      if (personnelRes.data.success) setPersonnel(personnelRes.data.data);
      if (incidentsRes.data.success) {
        const rawIncidents = Array.isArray(incidentsRes.data.data) ? incidentsRes.data.data : (incidentsRes.data.data.incidents || []);
        setIncidents(mapIncidents(rawIncidents));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmFake = async (id) => {
    try {
      const res = await api.patch(`/incidents/${id}/status`, { status: 'FAKE' });
      if (res.data.success) {
        toast.success('Alert confirmed as fake and removed from queue');
        setFakeQueue(prev => prev.filter(a => a.id !== id));
        fetchData();
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleMarkReal = async (id) => {
    try {
      const res = await api.patch(`/incidents/${id}/status`, { status: 'VERIFIED' });
      if (res.data.success) {
        toast.success('Alert overridden to Verified and published globally');
        setFakeQueue(prev => prev.filter(a => a.id !== id));
        fetchData();
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMsg) return toast.error('Message cannot be empty');
    setSendingBroadcast(true);
    try {
      let targetRoles = [];
      if (broadcastTarget === 'NDRF Teams Only') targetRoles = ['ndrf'];
      if (broadcastTarget === 'NGO Coordinators') targetRoles = ['ngo'];
      
      const res = await api.post('/broadcast/push', {
        title: 'Emergency Admin Broadcast',
        message: broadcastMsg,
        type: 'PUSH',
        targets: targetRoles
      });

      if (res.data.success) {
        toast.success('Broadcast sent successfully');
        setBroadcastMsg('');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to send broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-20">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-2">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          <span className="text-xl font-black text-white tracking-tight">Command Center</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'overview' ? 'bg-red-900/20 text-red-400 border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart2 className="w-5 h-5" /> <span>Overview</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('fake_queue')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'fake_queue' ? 'bg-red-900/20 text-red-400 border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ShieldAlert className="w-5 h-5" /> 
            <span>AI Verification</span>
            {fakeQueue.length > 0 && (
              <span className="ml-auto bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full">{fakeQueue.length}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('sos_dispatch')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'sos_dispatch' ? 'bg-red-900/20 text-red-400 border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Shield className="w-5 h-5" /> <span>SOS Dispatch</span>
          </button>

          <button 
            onClick={() => setActiveTab('personnel')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'personnel' ? 'bg-red-900/20 text-red-400 border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users className="w-5 h-5" /> <span>Personnel</span>
          </button>

          <button 
            onClick={() => setActiveTab('broadcast')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'broadcast' ? 'bg-red-900/20 text-red-400 border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Radio className="w-5 h-5" /> <span>Broadcast</span>
          </button>
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center space-x-2 text-gray-500 hover:text-red-400 transition w-full px-4 py-2 font-bold text-sm">
            <LogOut className="w-4 h-4" /> <span>End Shift</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 relative h-screen ${activeTab === 'sos_dispatch' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {activeTab === 'sos_dispatch' ? (
          <SOSAssignmentCenter />
        ) : (
          <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-24">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-white">System Overview</h1>
                <button onClick={fetchData} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition flex items-center space-x-1">
                  <Activity className="w-4 h-4" /> <span>Live Sync</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                  { label: 'Total Alerts', val: stats?.totalIncidents || 0, color: 'text-blue-400', border: 'border-blue-900/50', bg: 'bg-blue-900/10' },
                  { label: 'Verified Active', val: stats?.verifiedToday || 0, color: 'text-emerald-400', border: 'border-emerald-900/50', bg: 'bg-emerald-900/10' },
                  { label: 'Spam Blocked', val: stats?.fakeToday || 0, color: 'text-red-400', border: 'border-red-900/50', bg: 'bg-red-900/10' },
                  { label: 'Avg Response', val: `${stats?.avgResponseTime || 12}m`, color: 'text-purple-400', border: 'border-purple-900/50', bg: 'bg-purple-900/10' }
                ].map((s, i) => (
                  <div key={i} className={`border ${s.border} ${s.bg} p-6 rounded-2xl backdrop-blur-sm`}>
                    <div className={`text-4xl font-black mb-1 ${s.color}`}>{s.val}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Recent Live Incidents</span>
              </h3>
              
              <div className="grid gap-4">
                {incidents.filter(i => i.status !== 'FAKE').slice(0, 10).map((inc) => (
                  <div key={inc.id} className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-800 transition cursor-default">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className={`w-2 h-2 rounded-full ${inc.status === 'ACTIVE' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        <h4 className="font-bold text-lg text-white">{inc.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 pl-5">{inc.description}</p>
                    </div>
                    <div className="flex space-x-4 pl-5 md:pl-0">
                      <div className="text-right">
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Severity</div>
                        <div className={`text-sm font-black ${inc.severity === 'CRITICAL' ? 'text-red-500' : inc.severity === 'HIGH' ? 'text-orange-500' : 'text-yellow-500'}`}>{inc.severity}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Type</div>
                        <div className="text-sm font-bold text-blue-400">{inc.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {incidents.length === 0 && <div className="text-gray-500 italic p-4 text-center">No recent incidents.</div>}
              </div>
            </div>
          )}

          {/* TAB: FAKE QUEUE */}
          {activeTab === 'fake_queue' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-black text-white mb-8">AI Verification Review</h1>
              
              <div className="bg-yellow-900/10 border border-yellow-900/50 p-4 rounded-xl mb-8 flex items-center space-x-3 text-yellow-500">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-bold">These alerts were flagged by Claude AI as potential spam or hoaxes. Manual review required before global broadcast.</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {fakeQueue.length === 0 ? (
                  <div className="col-span-2 bg-gray-800/50 p-10 rounded-3xl border border-gray-700/50 text-center text-gray-400 font-bold flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mb-4 opacity-50" />
                    Queue is empty! All alerts verified.
                  </div>
                ) : fakeQueue.map((q) => (
                  <div key={q.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-between items-start hover:border-gray-600 transition">
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-white pr-4">{q.title}</h4>
                        <span className="text-[10px] font-black text-red-300 bg-red-950/80 px-2.5 py-1 rounded-full whitespace-nowrap border border-red-900/50 shadow-inner">
                          {((1 - (q.aiConfidence || 0)) * 100).toFixed(0)}% SPAM PROB
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-6 italic">"{q.description}"</p>
                    </div>
                    <div className="flex space-x-3 w-full mt-auto">
                      <button onClick={() => handleConfirmFake(q.id)} className="flex-1 flex items-center justify-center space-x-2 bg-gray-900/50 hover:bg-red-950 text-white text-xs font-bold py-3 rounded-xl transition border border-gray-700 hover:border-red-500/50">
                        <XCircle className="w-4 h-4 text-red-500" /> <span>Confirm Fake</span>
                      </button>
                      <button onClick={() => handleMarkReal(q.id)} className="flex-1 flex items-center justify-center space-x-2 bg-gray-900/50 hover:bg-emerald-950 text-white text-xs font-bold py-3 rounded-xl transition border border-gray-700 hover:border-emerald-500/50">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> <span>Mark Real</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PERSONNEL */}
          {activeTab === 'personnel' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-black text-white mb-8">Personnel & Agencies</h1>
              
              <div className="space-y-12">
                {/* Agencies */}
                <div>
                  <h3 className="text-xl font-black text-white mb-6 border-b border-gray-800 pb-2">Registered Agencies ({personnel?.agencies?.length || 0})</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {personnel?.agencies?.map(agency => (
                      <div key={agency.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg text-blue-400">{agency.name}</h4>
                          <span className="text-xs font-bold text-gray-500 bg-gray-900 px-3 py-1 rounded-full">{agency.type}</span>
                        </div>
                        
                        <div className="text-sm text-gray-400 mb-4 font-mono">{agency.contactEmail}</div>
                        
                        <div className="bg-gray-900/50 rounded-xl p-4">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Assigned Responders ({agency.responders?.length || 0})</div>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {agency.responders?.map(resp => (
                              <div key={resp.id} className="flex justify-between items-center text-sm bg-gray-800/80 p-2 rounded-lg">
                                <span className="text-gray-300 font-medium">{resp.user?.fullName}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${resp.status === 'DEPLOYED' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                  {resp.status}
                                </span>
                              </div>
                            ))}
                            {agency.responders?.length === 0 && <span className="text-xs text-gray-600">No responders assigned yet.</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volunteers */}
                <div>
                  <h3 className="text-xl font-black text-white mb-6 border-b border-gray-800 pb-2">Local Volunteers ({personnel?.volunteers?.length || 0})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {personnel?.volunteers?.map(vol => (
                      <div key={vol.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800 transition">
                        <div className="font-bold text-gray-200 truncate">{vol.user?.fullName}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate">{vol.user?.phoneNumber}</div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {vol.skills?.map(skill => (
                            <span key={skill} className="text-[9px] font-bold bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded-sm uppercase">{skill}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-black text-white mb-8">Emergency Broadcast Center</h1>
              
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Compose Broadcast */}
                <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none rounded-full"></div>
                  
                  <h3 className="text-xl font-black text-white mb-6 relative z-10 flex items-center space-x-2">
                    <Radio className="w-6 h-6 text-red-500" />
                    <span>Compose Alert</span>
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Audience</label>
                      <select 
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition font-medium"
                      >
                        <option>All Citizens (Global)</option>
                        <option>NDRF Teams Only</option>
                        <option>NGO Coordinators</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message Body</label>
                      <textarea 
                        rows="5" 
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-4 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition resize-none font-medium leading-relaxed"
                        placeholder="Enter official alert message to be broadcasted instantly via Push Notifications, SMS, and WhatsApp..."
                      ></textarea>
                    </div>
                    
                    <button 
                      onClick={handleSendBroadcast}
                      disabled={sendingBroadcast}
                      className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-900/50 flex items-center justify-center space-x-2"
                    >
                      {sendingBroadcast ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radio className="w-5 h-5 animate-pulse" />}
                      <span>Transmit Global Alert</span>
                    </button>
                  </div>
                </div>
                
                {/* Broadcast History */}
                <div>
                  <h3 className="text-xl font-black text-white mb-6 border-b border-gray-800 pb-2">Transmission Log</h3>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {broadcasts.map((b) => (
                      <div key={b.id} className="bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50 border-l-4 border-l-blue-500 hover:bg-gray-800/60 transition">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-gray-900 text-gray-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">
                            {b.type} PROTOCOL
                          </span>
                          <span className="text-xs font-medium text-gray-500">{new Date(b.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed font-medium mb-4">"{b.body}"</p>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                          <span className="text-xs text-gray-400"><span className="font-bold text-gray-300">Audience:</span> {b.targetRoles?.length > 0 ? b.targetRoles.join(', ') : 'Global Population'}</span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded">Delivered ({b.recipientsCount?.toLocaleString() || 0})</span>
                        </div>
                      </div>
                    ))}
                    {broadcasts.length === 0 && (
                      <div className="text-gray-500 text-center italic py-10 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                        No transmissions in log.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          </div>
        )}
      </div>
    </div>
  );
}
