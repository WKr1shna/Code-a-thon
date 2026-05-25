import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Home, AlertTriangle, Bell, Map, Book, Tent, HeartPulse, Activity, CheckCircle, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import SOSAssignmentCenter from './SOSAssignmentCenter';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [incidents, setIncidents] = useState([]);
  
  // Emergency Form State
  const [emergencyType, setEmergencyType] = useState('Medical');
  const [emergencyDesc, setEmergencyDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const mapTypeToBackend = (type) => {
    const mapping = {
      'Medical': 'other',
      'Fire': 'fire',
      'Flood': 'flood',
      'Collapse': 'urban',
      'Other': 'other'
    };
    return mapping[type] || 'other';
  };

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents?limit=10');
      if (res.data.success) {
        const rawIncidents = Array.isArray(res.data.data) ? res.data.data : (res.data.data.incidents || []);
        const mappedIncidents = rawIncidents.map(inc => ({
          ...inc,
          id: inc.id || inc._id,
          lat: inc.lat || (inc.location?.coordinates && inc.location.coordinates[1]) || 12.9716,
          lng: inc.lng || (inc.location?.coordinates && inc.location.coordinates[0]) || 77.5946,
          reporter: inc.reporter || { fullName: inc.reportedBy?.name || 'Citizen' }
        }));
        setIncidents(mappedIncidents);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportEmergency = async (e) => {
    e.preventDefault();
    if (!emergencyDesc) return toast.error("Please describe the emergency.");
    
    setIsSubmitting(true);
    try {
      // Create a mock location for demo purposes (near Bengaluru)
      const lat = 12.9716 + (Math.random() * 0.05 - 0.025);
      const lng = 77.5946 + (Math.random() * 0.05 - 0.025);
      
      const res = await api.post('/incidents', {
        title: `${emergencyType} Emergency Reported`,
        description: emergencyDesc,
        type: mapTypeToBackend(emergencyType),
        location: {
          lat,
          lng
        }
      });

      if (res.data.success) {
        toast.success("Emergency broadcasted to nearest NDRF teams!");
        setEmergencyDesc('');
        setActiveTab('alerts');
        fetchIncidents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report emergency.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-secondary text-white hidden md:flex flex-col border-r border-gray-800 z-20">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-black tracking-tight">RakshAlert</span>
          </Link>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'home' ? 'bg-primary text-white shadow-[0_0_15px_rgba(215,38,56,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Home className="w-5 h-5" /> <span>Home Overview</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('report')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'report' ? 'bg-primary text-white shadow-[0_0_15px_rgba(215,38,56,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <AlertTriangle className="w-5 h-5" /> <span>Report SOS</span>
          </button>

          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'alerts' ? 'bg-primary text-white shadow-[0_0_15px_rgba(215,38,56,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5" /> <span>Live Alerts</span>
          </button>

          <button 
            onClick={() => setActiveTab('resources')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'resources' ? 'bg-primary text-white shadow-[0_0_15px_rgba(215,38,56,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Map className="w-5 h-5" /> <span>Local Resources</span>
          </button>

          <button 
            onClick={() => setActiveTab('safety')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'safety' ? 'bg-primary text-white shadow-[0_0_15px_rgba(215,38,56,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Book className="w-5 h-5" /> <span>Safety Guide</span>
          </button>

          {user?.role === 'COORDINATOR' && (
            <button 
              onClick={() => setActiveTab('sos_dispatch')}
              className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition ${activeTab === 'sos_dispatch' ? 'bg-primary text-white shadow-[0_0_15px_rgba(215,38,56,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Navigation className="w-5 h-5" /> <span>SOS Dispatch</span>
            </button>
          )}
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition w-full px-4 py-2 font-bold text-sm">
            <LogOut className="w-4 h-4" /> <span>Secure Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 relative h-screen ${activeTab === 'sos_dispatch' ? 'overflow-hidden bg-[#0a0e1a]' : 'overflow-y-auto'}`}>
        {activeTab === 'sos_dispatch' ? (
          <SOSAssignmentCenter />
        ) : (
          <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-24">
            
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-3xl font-black text-secondary">Welcome back, {user?.fullName || 'Citizen'} 👋</h1>
                <p className="text-gray-500 font-medium">Here's your live safety overview for today.</p>
              </div>
              <div className="px-3 py-1 bg-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-lg">
                Role: {user?.role}
              </div>
            </div>

          {/* TAB: HOME */}
          {activeTab === 'home' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              
              {/* Big Report Button */}
              <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-center shadow-xl shadow-red-500/20 border border-red-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] pointer-events-none rounded-full"></div>
                <h2 className="text-2xl font-black text-white mb-2 relative z-10">Are you in an emergency?</h2>
                <p className="text-red-200 mb-6 max-w-lg mx-auto relative z-10">Broadcast your GPS location instantly to nearest NDRF teams and NGO responders.</p>
                <button onClick={() => setActiveTab('report')} className="relative z-10 bg-white text-red-700 font-black text-lg px-10 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center space-x-3 mx-auto">
                  <Activity className="w-6 h-6 animate-pulse" />
                  <span>🚨 Report Emergency Now</span>
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab('alerts')}>
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-black text-secondary">2</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Reports</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab('alerts')}>
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl"><Bell className="w-6 h-6 animate-pulse-fast" /></div>
                  <div>
                    <div className="text-2xl font-black text-secondary">{incidents.length}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nearby Alerts</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab('resources')}>
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Tent className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-black text-secondary">2.3 km</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nearest Shelter</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORT EMERGENCY */}
          {activeTab === 'report' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-secondary mb-6 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-primary" />
                <span>Submit SOS Report</span>
              </h2>
              
              <form onSubmit={handleReportEmergency} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-2xl">
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold flex items-center space-x-3">
                  <Navigation className="w-5 h-5 flex-shrink-0" />
                  <span>Your exact GPS location will be securely shared with verified rescue agencies.</span>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Emergency Type</label>
                  <select 
                    value={emergencyType} 
                    onChange={e => setEmergencyType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-secondary"
                  >
                    <option>Medical</option>
                    <option>Fire</option>
                    <option>Flood</option>
                    <option>Collapse</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Describe the situation</label>
                  <textarea 
                    rows="4"
                    value={emergencyDesc}
                    onChange={e => setEmergencyDesc(e.target.value)}
                    placeholder="e.g. Someone is trapped under the debris, requires immediate medical attention..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-secondary resize-none"
                  ></textarea>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full bg-primary hover:bg-red-700 disabled:opacity-50 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-red-500/30 transition flex justify-center items-center space-x-2">
                  {isSubmitting ? 'Transmitting...' : 'Transmit SOS Alert'}
                </button>
              </form>
            </div>
          )}

          {/* TAB: LIVE ALERTS */}
          {activeTab === 'alerts' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-secondary mb-6 flex items-center space-x-2">
                <span className="w-3 h-3 bg-primary rounded-full animate-pulse-fast"></span>
                <span>Nearby Verified Alerts</span>
              </h2>
              
              <div className="space-y-4">
                {incidents.filter(i => i.status !== 'FAKE').map((inc) => (
                  <div key={inc.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-4 md:mb-0">
                      <h4 className="font-bold text-lg text-secondary">{inc.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">"{inc.description}"</p>
                      <p className="text-[10px] text-gray-400 mt-3 font-black uppercase tracking-widest">
                        {new Date(inc.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase">{inc.type}</span>
                      <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase shadow-sm ${inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : inc.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {inc.severity}
                      </span>
                    </div>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <div className="text-center p-10 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500 font-bold">No active alerts in your area. You are safe.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-secondary mb-6 flex items-center space-x-2">
                <Map className="w-6 h-6 text-emerald-600" />
                <span>Nearest Relief Resources</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: Tent, name: 'Govt Relief Shelter (BBMP)', dist: '2.3 km', stat: 'Open · 45 beds left', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                  { icon: HeartPulse, name: 'Red Cross Medical Camp', dist: '3.1 km', stat: 'First Aid Available', color: 'text-red-600 bg-red-50 border-red-100' },
                  { icon: Map, name: 'Food Distribution Van', dist: '4.5 km', stat: 'Moving towards area', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                  { icon: Shield, name: 'NDRF Base Camp 10', dist: '6.2 km', stat: 'Rescue Boats Available', color: 'text-orange-600 bg-orange-50 border-orange-100' },
                ].map((r, i) => (
                  <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-2 ${r.color} flex items-center space-x-4 hover:shadow-md transition`}>
                    <div className={`p-4 rounded-xl bg-white shadow-sm`}><r.icon className="w-8 h-8" /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-secondary text-lg">{r.name}</h4>
                        <span className="text-xs font-black text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">{r.dist}</span>
                      </div>
                      <p className="text-sm font-medium opacity-80 mt-1">{r.stat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SAFETY GUIDE */}
          {activeTab === 'safety' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-secondary mb-6 flex items-center space-x-2">
                <Book className="w-6 h-6 text-purple-600" />
                <span>Emergency Safety Protocols</span>
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
                  <h3 className="text-xl font-black text-secondary mb-3">Flood Survival Guidelines</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 font-medium">
                    <li>Move immediately to higher ground or the top floor of a building.</li>
                    <li>Do not walk or drive through floodwaters. 6 inches of moving water can knock you down.</li>
                    <li>Turn off utilities at the main switches if instructed to do so.</li>
                    <li>Avoid contact with floodwater—it may be contaminated by sewage or chemicals.</li>
                  </ul>
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
                  <h3 className="text-xl font-black text-secondary mb-3">Earthquake / Collapse Protocols</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 font-medium">
                    <li>DROP, COVER, and HOLD ON under a sturdy piece of furniture.</li>
                    <li>Stay away from glass, windows, outside doors and walls.</li>
                    <li>If trapped, do not light a match. Cover your mouth with a cloth.</li>
                    <li>Tap on a pipe or wall so rescuers can locate you. Use a whistle if available.</li>
                  </ul>
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
