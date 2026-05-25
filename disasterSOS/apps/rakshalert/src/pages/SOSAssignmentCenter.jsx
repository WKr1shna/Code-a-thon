import React, { useState, useEffect } from 'react';
import { Shield, Map as MapIcon, Users, Truck, Activity, Bell, CheckCircle, AlertTriangle, Navigation, Clock, User, X } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Fallback polling (30s)

    // Setup Socket.IO listener for live updates
    const socket = io('http://localhost:5005');

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
      setIncidents(incRes.data.data);
      
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

  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
    setAiRec(null);
    getAiRec(inc.id);
  };

  const handleAssignClick = (resource, type) => {
    setSelectedResource({ ...resource, type });
    setIsAssigning(true);
  };

  const confirmAssignment = async () => {
    try {
      const payload = { notes };
      if (selectedResource.type === 'Responder') payload.responderId = selectedResource.id;
      if (selectedResource.type === 'Volunteer') payload.volunteerId = selectedResource.id;
      if (selectedResource.type === 'Vehicle') payload.vehicleId = selectedResource.id;

      await api.post(`/sos/${selectedIncident.id}/assign`, payload);
      toast.success("Resource successfully dispatched!");
      setIsAssigning(false);
      setSelectedResource(null);
      setNotes('');
      fetchData();
    } catch (err) {
      toast.error("Failed to dispatch resource");
    }
  };



  return (
    <div className="h-screen bg-[#0a0e1a] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-16 border-b border-gray-800 bg-[#111827] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-red-500" />
          <span className="text-xl font-black tracking-widest uppercase">Live Dispatch Center</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm font-bold bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>System Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: SOS FEED */}
        <div className="w-1/3 border-r border-gray-800 flex flex-col bg-[#0f1422]">
          <div className="p-4 border-b border-gray-800 shrink-0">
            <h2 className="text-lg font-black uppercase text-gray-300 flex justify-between">
              <span>Incoming SOS</span>
              <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">{incidents.length} LIVE</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {incidents.map(inc => (
              <div 
                key={inc.id} 
                onClick={() => handleSelectIncident(inc)}
                className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  selectedIncident?.id === inc.id ? 'border-red-500 bg-red-900/10' : 'border-gray-800 bg-[#111827] hover:border-gray-600'
                } ${inc.severity === 'CRITICAL' ? 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                    inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                    inc.dispatchStatus === 'UNASSIGNED' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {inc.dispatchStatus}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{inc.title}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{inc.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(inc.createdAt).toLocaleTimeString()}</span>
                  <span className="flex items-center"><User className="w-3 h-3 mr-1"/> {inc.reporter.fullName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: MAP */}
        <div className="w-2/5 flex flex-col bg-gray-900 relative">
          <MapContainer center={[12.9716, 77.5946]} zoom={11} className="w-full h-full z-0">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {/* Incident Markers */}
            {incidents.map(inc => (
              <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={redIcon}>
                <Popup>
                  <strong className="text-black">{inc.title}</strong><br/>
                  <span className="text-red-600 font-bold">{inc.severity}</span>
                </Popup>
              </Marker>
            ))}
            
            {/* Vehicle Markers */}
            {resources.vehicles.map(v => v.lat && v.lng ? (
              <Marker key={v.id} position={[v.lat, v.lng]} icon={blueIcon}>
                <Popup><strong className="text-black">{v.type}</strong></Popup>
              </Marker>
            ) : null)}

            {selectedIncident && (
              <Circle center={[selectedIncident.lat, selectedIncident.lng]} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} radius={2000} />
            )}
          </MapContainer>
          
          {/* Overlay Map Controls */}
          <div className="absolute top-4 left-4 z-10 flex space-x-2">
            <div className="bg-[#111827]/90 backdrop-blur border border-gray-700 rounded-lg p-2 flex space-x-2 shadow-2xl">
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold transition text-gray-300">Radar On</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold transition text-gray-300">Show Heatmap</button>
            </div>
          </div>
        </div>

        {/* RIGHT: RESOURCES */}
        <div className="w-4/12 border-l border-gray-800 flex flex-col bg-[#0f1422]">
          {!selectedIncident ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
              <Navigation className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold text-lg">No Incident Selected</p>
              <p className="text-sm mt-2">Select an SOS request from the feed to deploy resources.</p>
            </div>
          ) : (
            <>
              {/* AI Recommendation */}
              <div className="p-6 border-b border-gray-800 shrink-0 bg-gradient-to-br from-indigo-900/20 to-[#111827]">
                <h3 className="text-xs font-black uppercase text-indigo-400 mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-1" /> Smart AI Recommendation
                </h3>
                <p className="text-sm text-gray-300 font-medium italic bg-black/30 p-3 rounded-lg border border-indigo-500/20">
                  {aiRec || 'Analyzing incident vector...'}
                </p>
              </div>

              {/* Resource Tabs */}
              <div className="flex border-b border-gray-800 shrink-0 bg-[#111827]">
                {['Responders', 'Vehicles', 'Volunteers'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setResourceTab(t)}
                    className={`flex-1 py-3 text-xs font-black uppercase transition ${resourceTab === t ? 'text-white border-b-2 border-red-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
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
                      <h4 className="font-bold">{r.user.fullName}</h4>
                      <p className="text-xs text-gray-400">{r.agency.name} • {r.status}</p>
                    </div>
                    <button onClick={() => handleAssignClick(r, 'Responder')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Assign</button>
                  </div>
                ))}

                {resourceTab === 'Vehicles' && resources.vehicles.map(v => (
                  <div key={v.id} className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-gray-600 transition">
                    <div>
                      <h4 className="font-bold">{v.type}</h4>
                      <p className="text-xs text-gray-400">Cap: {v.capacity} • {v.status}</p>
                    </div>
                    <button onClick={() => handleAssignClick(v, 'Vehicle')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Dispatch</button>
                  </div>
                ))}

                {resourceTab === 'Volunteers' && resources.volunteers.map(v => (
                  <div key={v.id} className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-gray-600 transition">
                    <div>
                      <h4 className="font-bold">{v.user.fullName}</h4>
                      <p className="text-xs text-gray-400">Civilian • Available</p>
                    </div>
                    <button onClick={() => handleAssignClick(v, 'Volunteer')} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Request</button>
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
                <p className="font-bold">{selectedResource.type === 'Vehicle' ? selectedResource.type : selectedResource.user.fullName}</p>
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
