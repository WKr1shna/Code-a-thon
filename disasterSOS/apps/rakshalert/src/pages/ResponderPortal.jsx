import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Home, Navigation, CheckCircle, Clock, Send, MessageSquare, AlertTriangle, Truck, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import toast from 'react-hot-toast';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const amberIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function ResponderPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'tasks'
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newLogText, setNewLogText] = useState('');
  const [isPostingLog, setIsPostingLog] = useState(false);

  useEffect(() => {
    fetchAssignedTasks();
    const interval = setInterval(fetchAssignedTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      const res = await api.get('/responders/my-alerts');
      if (res.data.success) {
        const raw = res.data.data;
        const mapped = raw.map(t => ({
          ...t,
          id: t.id || t._id,
          lat: t.location?.coordinates && t.location.coordinates[1] || 12.9716,
          lng: t.location?.coordinates && t.location.coordinates[0] || 77.5946,
          reporter: t.reporter || { fullName: t.reportedBy?.name || 'Citizen' }
        }));
        setAssignedTasks(mapped);

        // Update selected task reference with fresh data if currently selected
        if (selectedTask) {
          const fresh = mapped.find(item => item.id === selectedTask.id);
          if (fresh) {
            setSelectedTask(fresh);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned tasks");
    }
  };

  const handleSelectTask = async (task) => {
    setSelectedTask(task);
    try {
      // Fetch full fresh populated task info
      const detailsRes = await api.get(`/sos/${task.id}`);
      if (detailsRes.data.success) {
        const fullTask = detailsRes.data.data;
        const mapped = {
          ...fullTask,
          id: fullTask.id || fullTask._id,
          lat: fullTask.lat || (fullTask.location?.coordinates && fullTask.location.coordinates[1]) || 12.9716,
          lng: fullTask.lng || (fullTask.location?.coordinates && fullTask.location.coordinates[0]) || 77.5946,
          reporter: fullTask.reporter || { fullName: fullTask.reportedBy?.name || 'Citizen' }
        };
        setSelectedTask(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch fresh task details:", err);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogText.trim() || !selectedTask) return;
    setIsPostingLog(true);
    try {
      const res = await api.post(`/responders/update/${selectedTask.id}`, { text: newLogText });
      if (res.data.success) {
        toast.success("Dispatch update log recorded!");
        setNewLogText('');
        
        // Refresh detail view
        const detailsRes = await api.get(`/sos/${selectedTask.id}`);
        if (detailsRes.data.success) {
          const fullTask = detailsRes.data.data;
          const mapped = {
            ...fullTask,
            id: fullTask.id || fullTask._id,
            lat: fullTask.lat || (fullTask.location?.coordinates && fullTask.location.coordinates[1]) || 12.9716,
            lng: fullTask.lng || (fullTask.location?.coordinates && fullTask.location.coordinates[0]) || 77.5946,
            reporter: fullTask.reporter || { fullName: fullTask.reportedBy?.name || 'Citizen' }
          };
          setSelectedTask(mapped);
        }
        fetchAssignedTasks();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to record log");
    } finally {
      setIsPostingLog(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedTask) return;
    try {
      const res = await api.patch(`/sos/${selectedTask.id}/status`, { status });
      if (res.data.success) {
        toast.success(`Mission status updated to ${status.toUpperCase()}!`);
        
        // Refresh details view
        const detailsRes = await api.get(`/sos/${selectedTask.id}`);
        if (detailsRes.data.success) {
          const fullTask = detailsRes.data.data;
          const mapped = {
            ...fullTask,
            id: fullTask.id || fullTask._id,
            lat: fullTask.lat || (fullTask.location?.coordinates && fullTask.location.coordinates[1]) || 12.9716,
            lng: fullTask.lng || (fullTask.location?.coordinates && fullTask.location.coordinates[0]) || 77.5946,
            reporter: fullTask.reporter || { fullName: fullTask.reportedBy?.name || 'Citizen' }
          };
          setSelectedTask(mapped);
        }
        fetchAssignedTasks();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/responder-login');
  };

  const activeMissions = assignedTasks.filter(t => t.status !== 'resolved' && t.status !== 'fake');
  const completedMissions = assignedTasks.filter(t => t.status === 'resolved' || t.status === 'fake');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0f1422] flex flex-col border-r border-gray-800 shrink-0 z-20 shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-2">
          <Shield className="w-8 h-8 text-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-xl font-black tracking-widest bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent uppercase">RESCUE OPS</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition duration-200 ${
              activeTab === 'overview' 
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5" /> <span>Overview Board</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('tasks');
              setSelectedTask(null);
            }}
            className={`w-full font-bold px-4 py-3 rounded-xl flex items-center space-x-3 transition duration-200 ${
              activeTab === 'tasks' 
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Truck className="w-5 h-5" /> <span>Assigned Tasks ({activeMissions.length})</span>
          </button>
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="bg-black/30 p-3 rounded-xl border border-gray-800 mb-4 text-xs">
            <div className="font-bold text-gray-400">OPERATOR:</div>
            <div className="font-black text-white truncate text-sm">{user?.fullName || 'Rescue Unit'}</div>
            <div className="text-gray-500 font-bold uppercase tracking-wider mt-1">{user?.role}</div>
          </div>
          <button onClick={handleLogoutClick} className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition w-full px-4 py-2 font-bold text-sm">
            <LogOut className="w-4 h-4" /> <span>Secure Exit</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <div className="h-16 border-b border-gray-800 bg-[#111827] flex items-center justify-between px-8 shrink-0 shadow-md">
          <h2 className="text-lg font-black tracking-wider uppercase text-gray-200">
            {activeTab === 'overview' ? 'Command Overview' : 'Mission Dispatch Board'}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <span>Encrypted Link Secure</span>
            </div>
          </div>
        </div>

        {/* Tab Content View */}
        <div className="flex-1 overflow-hidden">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-8 space-y-8 animate-in fade-in duration-300">
              
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-red-950/20 to-[#111827] p-8 rounded-3xl border border-red-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 blur-[80px] pointer-events-none rounded-full"></div>
                <h3 className="text-3xl font-black text-white mb-2">Welcome Back, Command Responder</h3>
                <p className="text-gray-400 max-w-xl leading-relaxed text-sm font-medium">
                  This dashboard is tailored specifically to NDRF officers and NGO relief task leaders. View active dispatches assigned directly to your team, coordinate operations, post live mission activity logs, and complete dispatches efficiently.
                </p>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="mt-6 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-red-500/20 transition-transform active:scale-95 duration-100 flex items-center space-x-2"
                >
                  <Truck className="w-4 h-4" /> <span>Launch Task Board →</span>
                </button>
              </div>

              {/* Status Stats Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex items-center space-x-4 shadow-sm hover:border-gray-700 transition cursor-pointer" onClick={() => setActiveTab('tasks')}>
                  <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20"><AlertTriangle className="w-6 h-6 animate-pulse" /></div>
                  <div>
                    <div className="text-3xl font-black text-white">{activeMissions.length}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Pending Active Tasks</div>
                  </div>
                </div>
                
                <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex items-center space-x-4 shadow-sm hover:border-gray-700 transition">
                  <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20"><CheckCircle className="w-6 h-6" /></div>
                  <div>
                    <div className="text-3xl font-black text-white">{completedMissions.length}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Missions Completed</div>
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex items-center space-x-4 shadow-sm hover:border-gray-700 transition">
                  <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20"><MapPin className="w-6 h-6" /></div>
                  <div>
                    <div className="text-lg font-black text-white truncate max-w-[150px]">{user?.district || 'State-wide'}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Active Area Focus</div>
                  </div>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl">
                <h4 className="font-black text-gray-300 uppercase tracking-widest text-xs mb-4">Command Protocols</h4>
                <ul className="space-y-3 text-sm text-gray-400 font-medium list-disc pl-5 leading-relaxed">
                  <li>Keep GPS coordinates updated when operations are active.</li>
                  <li>Log critical changes in dispatch status (e.g. *En-Route*, *Arrived On-Scene*, *Awaiting Supplies*) into the timeline.</li>
                  <li>Ensure citizen confirmation is obtained prior to marking tasks as **Resolved**.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 2: TASKS BOARD */}
          {activeTab === 'tasks' && (
            <div className="h-full flex overflow-hidden animate-in fade-in duration-300">
              
              {/* Column 1: Task Feed List */}
              <div className="w-1/3 border-r border-gray-800 flex flex-col bg-[#0f1422]">
                <div className="p-4 border-b border-gray-800 bg-[#111827] shrink-0 text-center">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Assigned Task Queue</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {assignedTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => handleSelectTask(task)}
                      className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                        selectedTask?.id === task.id
                          ? task.status === 'resolved'
                            ? 'border-green-500 bg-green-950/10'
                            : 'border-amber-500 bg-amber-950/10'
                          : 'border-gray-800 bg-[#111827] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                          task.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {task.severity}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                          task.status === 'resolved' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}>
                          {task.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{task.title}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">{task.description}</p>
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {new Date(task.createdAt).toLocaleTimeString()}</span>
                        <span className="flex items-center">👤 {task.reporter.fullName}</span>
                      </div>
                    </div>
                  ))}
                  {assignedTasks.length === 0 && (
                    <div className="text-center p-8 text-gray-500 mt-20 flex flex-col items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-gray-400 opacity-20 mb-4" />
                      <p className="font-bold text-sm text-gray-400">All Clear!</p>
                      <p className="text-xs mt-1 text-gray-500">No emergency tasks are currently assigned to your team.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Live Operational Leaflet Map */}
              <div className="w-2/5 flex flex-col bg-gray-900 relative">
                <MapContainer center={[12.9716, 77.5946]} zoom={11} className="w-full h-full z-0">
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  />
                  {assignedTasks.map(task => (
                    <Marker 
                      key={task.id} 
                      position={[task.lat, task.lng]}
                      icon={task.status === 'resolved' ? greenIcon : amberIcon}
                    >
                      <Popup>
                        <div className="text-black">
                          <strong className="block text-sm font-bold">{task.title}</strong>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-black mt-1 inline-block uppercase ${
                            task.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>{task.status.toUpperCase()}</span>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {selectedTask && (
                    <Circle 
                      center={[selectedTask.lat, selectedTask.lng]}
                      pathOptions={{
                        color: selectedTask.status === 'resolved' ? '#10b981' : '#f59e0b',
                        fillColor: selectedTask.status === 'resolved' ? '#10b981' : '#f59e0b',
                        fillOpacity: 0.15,
                        weight: 2,
                        dashArray: '5, 10'
                      }}
                      radius={2500}
                    />
                  )}
                </MapContainer>
              </div>

              {/* Column 3: Active Task Details panel */}
              <div className="w-4/12 border-l border-gray-800 flex flex-col bg-[#0f1422]">
                {!selectedTask ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                    <Navigation className="w-16 h-16 mb-4 opacity-20 text-gray-400" />
                    <p className="font-bold text-lg text-gray-400 font-sans">No Mission Selected</p>
                    <p className="text-xs mt-2 text-gray-500">Select any emergency task from the assigned list queue to coordinate dispatch operations.</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
                    
                    {/* Header Details Card */}
                    <div className={`p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 ${
                      selectedTask.status === 'resolved' 
                        ? 'from-emerald-950/20 to-[#111827] border-emerald-500/20' 
                        : 'from-amber-950/20 to-[#111827] border-amber-500/20'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          selectedTask.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {selectedTask.severity}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2 leading-snug">{selectedTask.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed mb-4">{selectedTask.description}</p>
                      
                      <div className="border-t border-gray-800/80 pt-3 space-y-2 text-xs font-semibold text-gray-400">
                        <div className="flex justify-between"><span>Reporter:</span> <span className="font-bold text-white">{selectedTask.reporter?.fullName || 'Citizen'}</span></div>
                        {selectedTask.reportedBy?.phone && (
                          <div className="flex justify-between"><span>Contact Number:</span> <span className="font-bold text-white">{selectedTask.reportedBy.phone}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Action Panel: Location Directions */}
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedTask.lat},${selectedTask.lng}`, '_blank')}
                      className="w-full bg-[#111827] hover:border-amber-500/40 border border-gray-800 py-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center space-x-2 text-amber-400 hover:text-white"
                      title="Navigate using Google Maps Directions"
                    >
                      <MapPin className="w-4 h-4 animate-bounce" /> <span>📍 View Location directions</span>
                    </button>

                    {/* Action Panel: Update Mission Status */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Verify Mission Resolution
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleUpdateStatus('active')}
                          className={`py-3 rounded-xl text-xs font-black uppercase border transition duration-200 ${
                            selectedTask.status === 'active' 
                              ? 'bg-amber-600/20 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/20' 
                              : 'bg-[#111827] border-gray-800 text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          Active Operations
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus('resolved')}
                          className={`py-3 rounded-xl text-xs font-black uppercase border transition duration-200 ${
                            selectedTask.status === 'resolved' 
                              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/20' 
                              : 'bg-[#111827] border-gray-800 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/20'
                          }`}
                        >
                          Mark Resolved ✔
                        </button>
                      </div>
                    </div>

                    {/* Timeline logs */}
                    <div className="space-y-4 border-t border-gray-800 pt-6">
                      <div className="flex items-center space-x-1.5 text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <h4 className="text-xs font-black uppercase tracking-wider">Mission Timeline Logs</h4>
                      </div>

                      {/* Timeline Add Input Form */}
                      <form onSubmit={handleAddLog} className="flex space-x-2">
                        <input 
                          type="text" 
                          value={newLogText}
                          onChange={(e) => setNewLogText(e.target.value)}
                          placeholder="Type deployment log..."
                          className="flex-1 bg-[#111827] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 outline-none"
                          disabled={isPostingLog}
                        />
                        <button 
                          type="submit"
                          className="bg-red-600 hover:bg-red-500 text-white px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 disabled:opacity-50"
                          disabled={isPostingLog || !newLogText.trim()}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                      {/* Log entries lists */}
                      {selectedTask.responderUpdates && selectedTask.responderUpdates.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {selectedTask.responderUpdates.map((upd, idx) => (
                            <div key={idx} className="bg-gray-900/50 border border-gray-800 p-3 rounded-xl text-[10px] space-y-1">
                              <div className="flex justify-between items-center text-gray-500 font-bold border-b border-gray-800/40 pb-1">
                                <span>👤 {upd.postedBy?.name || 'Rescue Unit'} ({upd.postedBy?.role?.toUpperCase() || 'OFFICER'})</span>
                                <span>{new Date(upd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-gray-300 leading-relaxed font-semibold mt-1">{upd.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-600 font-bold italic text-center py-4 bg-[#111827]/40 rounded-xl border border-gray-800/60">No dispatch activity logs logged yet.</p>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
