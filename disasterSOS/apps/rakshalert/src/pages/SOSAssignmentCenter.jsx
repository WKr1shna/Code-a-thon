import React, { useState, useEffect } from 'react';
import { Shield, Map as MapIcon, Users, Truck, Activity, Bell, CheckCircle, AlertTriangle, Navigation, Clock, User, X, History, Send, MessageSquare } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

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

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
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

export default function SOSAssignmentCenter() {
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState({ responders: [], volunteers: [], vehicles: [] });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resourceTab, setResourceTab] = useState('Responders');
  
  // Assignment Modal
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [notes, setNotes] = useState('');
  const [aiRec, setAiRec] = useState(null);
  const [radarOn, setRadarOn] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [feedTab, setFeedTab] = useState('incoming'); // 'incoming', 'active_dispatches', 'resolved'
  const [newLog, setNewLog] = useState('');
  const [isPostingLog, setIsPostingLog] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Fallback polling (30s)

    // Setup Socket.IO listener for live updates
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:5050' : 'https://code-a-thon-wblx.onrender.com');
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('[SOCKET] Connected to dispatch server');
      socket.emit('join_room', 'coordinator_dispatch');
    });

    socket.on('sos_update', (data) => {
      console.log('[SOCKET] Live SOS update received', data);
      toast.success(`Live Update: SOS Dispatch modified`, { id: 'sos-live-toast' });
      fetchData();
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected from dispatch server');
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      const incRes = await api.get('/sos');
      const rawIncidents = Array.isArray(incRes.data.data) ? incRes.data.data : (incRes.data.data.incidents || []);
      const mappedIncidents = rawIncidents.map(inc => ({
        ...inc,
        id: inc.id || inc._id,
        lat: inc.lat || (inc.location?.coordinates && inc.location.coordinates[1]) || 12.9716,
        lng: inc.lng || (inc.location?.coordinates && inc.location.coordinates[0]) || 77.5946,
        reporter: inc.reporter || { fullName: inc.reportedBy?.name || 'Citizen' },
        dispatchStatus: inc.claimedBy ? 'DISPATCHED' : 'UNASSIGNED'
      }));
      setIncidents(mappedIncidents);
      
      const resRes = await api.get('/sos/available-resources');
      setResources(resRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch live data");
    }
  };

  const getAiRec = async (id) => {
    try {
      setAiRec('Loading...');
      const res = await api.post(`/sos/${id}/ai-recommendation`);
      setAiRec(res.data.data.recommendation);
    } catch (err) {
      setAiRec('Failed to load recommendation.');
    }
  };

  const handleSelectIncident = async (inc) => {
    try {
      // Set basic baseline local info immediately
      setSelectedIncident({
        ...inc,
        dispatchStatus: inc.claimedBy ? 'DISPATCHED' : 'UNASSIGNED'
      });
      setAiRec(null);
      getAiRec(inc.id);

      // Fetch fresh fully populated details from backend
      const detailsRes = await api.get(`/sos/${inc.id}`);
      if (detailsRes.data.success) {
        const fullInc = detailsRes.data.data;
        const mapped = {
          ...fullInc,
          id: fullInc.id || fullInc._id,
          lat: fullInc.lat || (fullInc.location?.coordinates && fullInc.location.coordinates[1]) || 12.9716,
          lng: fullInc.lng || (fullInc.location?.coordinates && fullInc.location.coordinates[0]) || 77.5946,
          reporter: fullInc.reporter || { fullName: fullInc.reportedBy?.name || 'Citizen' },
          dispatchStatus: fullInc.claimedBy ? 'DISPATCHED' : 'UNASSIGNED'
        };
        setSelectedIncident(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch fresh incident details:", err);
    }
  };

  const handleAssignClick = (resource, type) => {
    setSelectedResource({ ...resource, type });
    setIsAssigning(true);
  };

  const confirmAssignment = async () => {
    try {
      const payload = {
        teamId: selectedResource.id,
        priority: selectedIncident.severity,
        assignmentNotes: notes
      };

      await api.post(`/sos/${selectedIncident.id}/assign`, payload);
      toast.success("Resource successfully dispatched!");
      setIsAssigning(false);
      setSelectedResource(null);
      setNotes('');
      setSelectedIncident(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to dispatch resource");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`/sos/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Incident status successfully updated to ${newStatus.toUpperCase()}!`);
        
        // Fetch fresh populated details
        const detailsRes = await api.get(`/sos/${id}`);
        if (detailsRes.data.success) {
          const fullInc = detailsRes.data.data;
          const mapped = {
            ...fullInc,
            id: fullInc.id || fullInc._id,
            lat: fullInc.lat || (fullInc.location?.coordinates && fullInc.location.coordinates[1]) || 12.9716,
            lng: fullInc.lng || (fullInc.location?.coordinates && fullInc.location.coordinates[0]) || 77.5946,
            reporter: fullInc.reporter || { fullName: fullInc.reportedBy?.name || 'Citizen' },
            dispatchStatus: fullInc.claimedBy ? 'DISPATCHED' : 'UNASSIGNED'
          };
          setSelectedIncident(mapped);
        }
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to update incident status");
      console.error(err);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setIsPostingLog(true);
    try {
      const res = await api.post(`/responders/update/${selectedIncident.id}`, { text: newLog });
      if (res.data.success) {
        toast.success("Dispatch activity log added successfully!");
        setNewLog('');
        
        // Refresh details view
        const detailsRes = await api.get(`/sos/${selectedIncident.id}`);
        if (detailsRes.data.success) {
          const fullInc = detailsRes.data.data;
          const mapped = {
            ...fullInc,
            id: fullInc.id || fullInc._id,
            lat: fullInc.lat || (fullInc.location?.coordinates && fullInc.location.coordinates[1]) || 12.9716,
            lng: fullInc.lng || (fullInc.location?.coordinates && fullInc.location.coordinates[0]) || 77.5946,
            reporter: fullInc.reporter || { fullName: fullInc.reportedBy?.name || 'Citizen' },
            dispatchStatus: fullInc.claimedBy ? 'DISPATCHED' : 'UNASSIGNED'
          };
          setSelectedIncident(mapped);
        }
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to post dispatch log update.");
    } finally {
      setIsPostingLog(false);
    }
  };

  const getActiveStep = (incident) => {
    if (!incident) return 0;
    if (incident.status === 'resolved') return 4;
    if (incident.status === 'fake') return 0;
    if (incident.claimedBy) {
      if (incident.status === 'active') return 3;
      return 2;
    }
    return 1;
  };

  // Structured queues for optimal coordination
  const pendingIncidents = incidents.filter(inc => !inc.claimedBy && inc.status !== 'resolved' && inc.status !== 'fake');
  const activeIncidents = incidents.filter(inc => inc.claimedBy && inc.status !== 'resolved' && inc.status !== 'fake');
  const resolvedIncidents = incidents.filter(inc => inc.status === 'resolved' || inc.status === 'fake');
  
  const displayFeed = 
    feedTab === 'incoming' ? pendingIncidents : 
    feedTab === 'active_dispatches' ? activeIncidents : 
    resolvedIncidents;

  const activeStep = getActiveStep(selectedIncident);
  
  const steps = selectedIncident ? [
    { label: 'SOS Registered', desc: 'Emergency broadcasted by citizen', icon: Bell, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Rescue Dispatched', desc: selectedIncident.claimedBy ? `Assigned to ${selectedIncident.claimedBy.name || 'Emergency Unit'}` : 'Awaiting rescue deployment', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Operations Active', desc: selectedIncident.status === 'active' ? 'Team en-route / on-scene' : 'Verification & support pending', icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Mission Completed', desc: 'SOS signal successfully resolved', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ] : [];

  const isDispatchedOrArchived = selectedIncident && (selectedIncident.claimedBy || selectedIncident.status === 'resolved' || selectedIncident.status === 'fake');

  return (
    <div className="h-screen bg-[#0a0e1a] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-16 border-b border-gray-800 bg-[#111827] flex items-center justify-between px-6 shrink-0 z-10 shadow-lg">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-xl font-black tracking-widest uppercase bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">Live Dispatch Center</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            <span>Real-time System Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: SOS FEED */}
        <div className="w-1/3 border-r border-gray-800 flex flex-col bg-[#0f1422]">
          <div className="p-4 border-b border-gray-800 shrink-0 bg-[#111827] flex space-x-2 shadow-sm">
            <button 
              onClick={() => {
                setFeedTab('incoming');
                setSelectedIncident(null);
              }}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all duration-200 ${
                feedTab === 'incoming' 
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]' 
                  : 'bg-gray-800/40 text-gray-400 hover:text-white'
              }`}
            >
              Incoming ({pendingIncidents.length})
            </button>
            <button 
              onClick={() => {
                setFeedTab('active_dispatches');
                setSelectedIncident(null);
              }}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all duration-200 ${
                feedTab === 'active_dispatches' 
                  ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                  : 'bg-gray-800/40 text-gray-400 hover:text-white'
              }`}
            >
              Active ({activeIncidents.length})
            </button>
            <button 
              onClick={() => {
                setFeedTab('resolved');
                setSelectedIncident(null);
              }}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all duration-200 ${
                feedTab === 'resolved' 
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                  : 'bg-gray-800/40 text-gray-400 hover:text-white'
              }`}
            >
              Archive ({resolvedIncidents.length})
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayFeed.map(inc => (
              <div 
                key={inc.id} 
                onClick={() => handleSelectIncident(inc)}
                className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  selectedIncident?.id === inc.id 
                    ? feedTab === 'incoming' 
                      ? 'border-red-500 bg-red-900/10' 
                      : feedTab === 'active_dispatches' 
                        ? 'border-amber-500 bg-amber-900/10' 
                        : 'border-emerald-500 bg-emerald-900/10'
                    : 'border-gray-800 bg-[#111827] hover:border-gray-600'
                } ${inc.severity === 'CRITICAL' && inc.status !== 'resolved' ? 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                    inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                    inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${
                    inc.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    inc.status === 'fake' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    inc.claimedBy ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {inc.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{inc.title}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{inc.description}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-gray-400"/> {new Date(inc.createdAt).toLocaleTimeString()}</span>
                  <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1 text-gray-400"/> {inc.reporter.fullName}</span>
                </div>
              </div>
            ))}
            {displayFeed.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center mt-20">
                <Shield className="w-16 h-16 mb-4 opacity-20 text-gray-400" />
                <p className="font-bold text-lg text-gray-400">Queue is Clear</p>
                <p className="text-xs mt-2 max-w-xs mx-auto">No emergencies in this queue. Everything is monitored and secured.</p>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: MAP */}
        <div className="w-2/5 flex flex-col bg-gray-900 relative">
          <MapContainer center={[12.9716, 77.5946]} zoom={11} className="w-full h-full z-0">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {/* Heatmap overlay layers */}
            {showHeatmap && [...pendingIncidents, ...activeIncidents].map(inc => (
              <Circle 
                key={`heat-${inc.id}`}
                center={[inc.lat, inc.lng]}
                pathOptions={{
                  color: 'transparent',
                  fillColor: inc.severity === 'CRITICAL' ? '#dc2626' : '#f97316',
                  fillOpacity: 0.22
                }}
                radius={4500}
              />
            ))}

            {/* Unassigned Incident Markers - Red */}
            {pendingIncidents.map(inc => (
              <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={redIcon}>
                <Popup>
                  <div className="text-black">
                    <strong className="block text-sm font-bold text-red-600">{inc.title}</strong>
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black mt-1 inline-block">{inc.severity}</span>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{inc.description}</p>
                    <span className="text-[10px] text-gray-400 block mt-2 font-bold uppercase tracking-wider">Awaiting Dispatch</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Active Dispatched Incident Markers - Amber */}
            {activeIncidents.map(inc => (
              <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={amberIcon}>
                <Popup>
                  <div className="text-black">
                    <strong className="block text-sm font-bold text-amber-600">{inc.title}</strong>
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black mt-1 inline-block">{inc.severity}</span>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{inc.description}</p>
                    {inc.claimedBy && (
                      <span className="text-[10px] text-emerald-700 font-bold block mt-2">Dispatched to: {inc.claimedBy.name}</span>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Selected Resolved / Fake Incident Marker - Green */}
            {selectedIncident && (selectedIncident.status === 'resolved' || selectedIncident.status === 'fake') && (
              <Marker position={[selectedIncident.lat, selectedIncident.lng]} icon={greenIcon}>
                <Popup>
                  <div className="text-black">
                    <strong className="block text-sm font-bold text-green-600">{selectedIncident.title}</strong>
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black mt-1 inline-block">RESOLVED / ARCHIVED</span>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{selectedIncident.description}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Vehicle Markers */}
            {resources.vehicles.map(v => v.lat && v.lng ? (
              <Marker key={v.id} position={[v.lat, v.lng]} icon={blueIcon}>
                <Popup><strong className="text-black">{v.type}</strong></Popup>
              </Marker>
            ) : null)}

            {/* Pulsing Radar boundary circle for selected incident */}
            {selectedIncident && radarOn && (
              <Circle 
                center={[selectedIncident.lat, selectedIncident.lng]} 
                pathOptions={{ 
                  color: selectedIncident.status === 'resolved' ? '#10b981' : '#dc2626', 
                  fillColor: selectedIncident.status === 'resolved' ? '#10b981' : '#dc2626', 
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '5, 10'
                }} 
                radius={3000} 
              />
            )}
          </MapContainer>
          
          {/* Overlay Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <div className="bg-[#111827]/90 backdrop-blur border border-gray-700 rounded-xl p-1.5 flex space-x-2 shadow-2xl">
              <button 
                onClick={() => setRadarOn(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  radarOn 
                    ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                }`}
              >
                Radar {radarOn ? 'ON' : 'OFF'}
              </button>
              <button 
                onClick={() => setShowHeatmap(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  showHeatmap 
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                }`}
              >
                {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: RESOURCES OR DISPATCH TRACKER */}
        <div className="w-4/12 border-l border-gray-800 flex flex-col bg-[#0f1422]">
          {!selectedIncident ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
              <Navigation className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold text-lg">No Signal Selected</p>
              <p className="text-sm mt-2">Select an active or incoming SOS request from the feed list.</p>
            </div>
          ) : isDispatchedOrArchived ? (
            
            /* Active Dispatched or Archived Incident Management Panel */
            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
              
              {/* Dispatch Header Card */}
              <div className={`p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 ${
                selectedIncident.status === 'resolved' 
                  ? 'from-emerald-950/20 to-[#111827] border-emerald-500/20' 
                  : 'from-amber-950/20 to-[#111827] border-amber-500/20'
              }`}>
                <h3 className={`text-xs font-black uppercase mb-3 flex items-center tracking-widest ${
                  selectedIncident.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  <Shield className="w-4 h-4 mr-1.5 animate-pulse" /> Dispatch Phase Overview
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-400 border-b border-gray-800 pb-2">
                    <span>Incident Status:</span>
                    <span className={`px-2.5 py-1 font-black text-xs uppercase rounded-lg border ${
                      selectedIncident.status === 'resolved' 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                        : selectedIncident.status === 'fake'
                          ? 'bg-red-500/20 border-red-500/30 text-red-400'
                          : 'bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse'
                    }`}>
                      {selectedIncident.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {selectedIncident.claimedBy && (
                    <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                      <strong className="text-[10px] text-gray-500 font-black block tracking-widest uppercase mb-2">DEPLOYED MISSION UNIT:</strong>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block text-sm">{selectedIncident.claimedBy.name || 'Emergency Responder'}</span>
                          <span className="text-gray-400 font-semibold text-xs">{selectedIncident.claimedBy.phone || '+91-99999-99999'}</span>
                        </div>
                        <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg border border-amber-500/20">
                          <Truck className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="bg-[#111827] border border-gray-800 p-5 rounded-2xl">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Real-time Tracker</h4>
                <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
                  {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = stepNum < activeStep || (activeStep === 4);
                    const isActive = stepNum === activeStep && activeStep !== 4;
                    const isUpcoming = stepNum > activeStep;
                    
                    const StepIcon = step.icon;
                    
                    return (
                      <div key={idx} className="relative flex flex-col items-start transition-all duration-300">
                        {/* Indicator Circle */}
                        <div className={`absolute -left-8 top-0.5 w-7.5 h-7.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] font-black' 
                            : isActive 
                              ? 'bg-amber-500 border-amber-500 text-black animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black' 
                              : 'bg-[#0f1422] border-gray-700 text-gray-500'
                        }`}>
                          <StepIcon className="w-3.5 h-3.5" />
                        </div>
                        
                        {/* Content */}
                        <div className="ml-2">
                          <h5 className={`text-xs font-bold transition-all duration-300 uppercase tracking-wider ${
                            isCompleted ? 'text-gray-300' : isActive ? 'text-amber-400 font-black' : 'text-gray-500'
                          }`}>{step.label}</h5>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                  Update Signal Phase
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Active SOS', value: 'active', color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20' },
                    { label: 'Verified Alert', value: 'verified', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20' },
                    { label: 'Fake Alert', value: 'fake', color: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' },
                    { label: 'Mark Resolved ✔', value: 'resolved', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-black' }
                  ].map((st) => (
                    <button
                      key={st.value}
                      onClick={() => handleUpdateStatus(selectedIncident.id, st.value)}
                      className={`py-3 rounded-xl text-xs font-bold uppercase transition-all duration-200 ${st.color} ${
                        selectedIncident.status === st.value 
                          ? 'ring-2 ring-white scale-[1.03] opacity-100 bg-white/5 border-white/20 font-black' 
                          : 'opacity-70'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispatch Activity Logs with Input Form */}
              <div className="space-y-4 border-t border-gray-800 pt-6">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Mission Activity Logs</h4>
                </div>

                {/* Log Entry Submission Form */}
                <form onSubmit={handleAddLog} className="flex space-x-2">
                  <input
                    type="text"
                    value={newLog}
                    onChange={(e) => setNewLog(e.target.value)}
                    placeholder="Type dispatch update log entry..."
                    className="flex-1 bg-[#111827] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 outline-none"
                    disabled={isPostingLog}
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0"
                    disabled={isPostingLog || !newLog.trim()}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Logs List */}
                {selectedIncident.responderUpdates && selectedIncident.responderUpdates.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedIncident.responderUpdates.map((upd, idx) => (
                      <div key={idx} className="bg-gray-900/50 border border-gray-800 p-3 rounded-xl text-[10px] space-y-1">
                        <div className="flex justify-between items-center text-gray-500 font-bold border-b border-gray-800/40 pb-1">
                          <span>
                            👤 {upd.postedBy?.name || 'Dispatch Control'} ({upd.postedBy?.role?.toUpperCase() || 'COORDINATOR'})
                          </span>
                          <span>
                            {new Date(upd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-semibold mt-1">{upd.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 font-bold italic text-center py-4 bg-[#111827]/40 rounded-xl border border-gray-800/60">No dispatch activity logs logged yet.</p>
                )}
              </div>
            </div>
          ) : (
            
            /* Unassigned SOS - Show AI Recommendation and Deployable Resources Tabs */
            <>
              {/* AI Recommendation */}
              <div className="p-6 border-b border-gray-800 shrink-0 bg-gradient-to-br from-indigo-900/20 to-[#111827]">
                <h3 className="text-xs font-black uppercase text-indigo-400 mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5 animate-pulse" /> Smart AI Recommendation
                </h3>
                <p className="text-xs text-gray-300 font-medium italic bg-black/30 p-3.5 rounded-xl border border-indigo-500/20 leading-relaxed">
                  {aiRec || 'Analyzing incident vector parameters...'}
                </p>
              </div>

              {/* Resource Tabs */}
              <div className="flex border-b border-gray-800 shrink-0 bg-[#111827]">
                {['Responders', 'Vehicles', 'Volunteers'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setResourceTab(t)}
                    className={`flex-1 py-3 text-xs font-black uppercase transition ${
                      resourceTab === t 
                        ? 'text-white border-b-2 border-red-500 bg-white/5 font-black' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Resource List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                
                {resourceTab === 'Responders' && resources.responders.map(r => (
                  <div key={r.id} className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-gray-600 transition">
                    <div>
                      <h4 className="font-bold text-sm">{r.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.district || 'Verified Area'} • {r.status}</p>
                    </div>
                    <button onClick={() => handleAssignClick(r, 'Responder')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md transition">Assign</button>
                  </div>
                ))}

                {resourceTab === 'Vehicles' && resources.vehicles.map(v => (
                  <div key={v.id} className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-gray-600 transition">
                    <div>
                      <h4 className="font-bold text-sm">{v.type}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Cap: {v.capacity} • {v.status}</p>
                    </div>
                    <button onClick={() => handleAssignClick(v, 'Vehicle')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md transition">Dispatch</button>
                  </div>
                ))}

                {resourceTab === 'Volunteers' && resources.volunteers.map(v => (
                  <div key={v.id} className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-gray-600 transition">
                    <div>
                      <h4 className="font-bold text-sm">{v.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{Array.isArray(v.skills) ? v.skills.slice(0, 2).join(', ') : 'Rescue Ops'} • {v.status}</p>
                    </div>
                    <button onClick={() => handleAssignClick(v, 'Volunteer')} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md transition">Request</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      {isAssigning && selectedResource && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
              <h2 className="text-lg font-black uppercase">Confirm Dispatch</h2>
              <button onClick={() => setIsAssigning(false)} className="text-gray-500 hover:text-white"><X/></button>
            </div>
            <div className="p-6">
              <div className="bg-[#0f1422] p-4 rounded-xl border border-gray-800 mb-6">
                <p className="text-sm text-gray-400 mb-1">Target Incident:</p>
                <p className="font-bold text-red-400">{selectedIncident.title}</p>
                
                <p className="text-sm text-gray-400 mt-4 mb-1">Deploying Asset:</p>
                <p className="font-bold">{selectedResource.type === 'Vehicle' ? selectedResource.type : selectedResource.name}</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mission Orders (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#0f1422] border border-gray-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-500 outline-none resize-none"
                  rows="3"
                  placeholder="Enter specific instructions..."
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setIsAssigning(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-bold transition">Cancel</button>
                <button onClick={confirmAssignment} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-black shadow-[0_0_20px_rgba(220,38,38,0.4)] transition">CONFIRM DISPATCH</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
