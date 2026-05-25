'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ui/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { useAlertContext } from '../../context/AlertContext';
import apiService from '../../services/api.service';
import AlertCard from '../../components/common/AlertCard';
import Map from '../../components/map/Map';

export default function CitizenPortal() {
  const { user, logout } = useAuth();
  const { alerts, fetchAlerts, loading: alertsLoading } = useAlertContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('flood');
  const [lat, setLat] = useState('13.0827');
  const [lng, setLng] = useState('80.2707');
  const [mediaUrl, setMediaUrl] = useState('');
  
  const [isReporting, setIsReporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', isError: false });
  const [langTab, setLangTab] = useState('en');

  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  useEffect(() => {
    fetchNearbyResources();
  }, []);

  const fetchNearbyResources = async () => {
    setResourcesLoading(true);
    try {
      const response = await apiService.get('/resources/nearby?lat=13.0827&lng=80.2707&radius=50');
      setResources(response.data.data || []);
    } catch (err) {
      console.error('Failed to load resources:', err.message);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleSOSSubmit = async (e) => {
    e.preventDefault();
    setIsReporting(true);
    setFeedbackMsg({ text: '', isError: false });

    try {
      const payload = {
        title,
        description,
        type,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        mediaUrls: mediaUrl ? [mediaUrl] : []
      };

      await apiService.post('/sos', payload);

      setFeedbackMsg({ text: '🚨 SOS emergency report submitted successfully! AI verification is running.', isError: false });
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setMediaUrl('');
      
      // Reload alerts
      fetchAlerts();
    } catch (err) {
      setFeedbackMsg({ 
        text: err.response?.data?.message || 'Failed to submit SOS report. Please try again.', 
        isError: true 
      });
    } finally {
      setIsReporting(false);
    }
  };

  const safetyGuides = {
    en: {
      flood: "Move to higher ground immediately. Do not walk or drive through flood waters. Store clean drinking water.",
      earthquake: "Drop, Cover, and Hold on. Stay away from windows and heavy structures. Avoid elevators.",
      cyclone: "Secure roofs and windows. Unplug electrical appliances. Stay indoors until official clearance."
    },
    hi: {
      flood: "तुरंत ऊंचे स्थानों पर जाएं। बाढ़ के पानी में पैदल न चलें या गाड़ी न चलाएं। पीने का साफ पानी जमा करें।",
      earthquake: "झुकें, ढकें और पकड़ें। खिड़कियों और भारी संरचनाओं से दूर रहें। लिफ्ट का प्रयोग न करें।",
      cyclone: "छतों और खिड़कियों को सुरक्षित करें। बिजली के उपकरण अनप्लग करें। आधिकारिक निकासी तक घर के अंदर रहें।"
    },
    ta: {
      flood: "உடனடியாக உயரமான இடத்திற்குச் செல்லுங்கள். வெள்ள நீரில் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம்.",
      earthquake: "கீழே இறங்கி, உங்களை மூடிக்கொண்டு, பிடித்துக் கொள்ளுங்கள். ஜன்னல்களிலிருந்து விலகி இருங்கள்.",
      cyclone: "கூரைகள் மற்றும் ஜன்னல்களைப் பாதுகாக்கவும். மின்சாதனங்களை அணைக்கவும். வீட்டிற்குள்ளேயே இருங்கள்."
    }
  };

  return (
    <ProtectedRoute allowedRoles={['citizen', 'admin']}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        
        {/* Navigation Bar */}
        <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-lg">!</div>
              <span className="font-extrabold text-lg tracking-tight uppercase">Disaster SOS</span>
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

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SOS emergency panic form */}
            <div className="lg:col-span-1 p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-red-500 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>Report Emergency Panic</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">Submit geo-tagged report to activate responders dispatch.</p>
              </div>

              {feedbackMsg.text && (
                <div className={`p-4 text-xs font-semibold rounded-xl border ${feedbackMsg.isError ? 'bg-red-950/80 border-red-500/20 text-red-400' : 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400'}`}>
                  {feedbackMsg.text}
                </div>
              )}

              <form onSubmit={handleSOSSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Incident Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Flooding near Main Gate"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 text-sm rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about casualties, structural blockages..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 text-sm rounded-xl outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Disaster Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl outline-none"
                    >
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="fire">Fire</option>
                      <option value="landslide">Landslide</option>
                      <option value="urban">Urban Crisis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Media Photo URL (optional)</label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isReporting}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg transition duration-200 uppercase tracking-widest text-xs"
                >
                  {isReporting ? 'Submitting SOS...' : 'Trigger SOS Panic'}
                </button>
              </form>
            </div>

            {/* Active alerts & maps */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-200">Nearby Active verified reports</h2>
                  <p className="text-slate-500 text-xs mt-1">Showing crisis incidents with active updates inside 100km radius.</p>
                </div>
                <button 
                  onClick={fetchAlerts}
                  className="py-1.5 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Reload Feed
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertsLoading ? (
                  <div className="col-span-2 text-center py-12 text-slate-500 text-sm">Loading reports feed...</div>
                ) : alerts.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-slate-500 text-sm bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                    No active verified alerts reported nearby.
                  </div>
                ) : (
                  alerts.map(alert => (
                    <AlertCard key={alert._id} alert={alert} />
                  ))
                )}
              </div>

              <Map />
            </div>
          </div>

          <hr className="border-slate-900" />

          {/* Multilingual instructions and Resource center directory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Multilingual guides */}
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-200">AI Multilingual Guidelines</h3>
                <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl">
                  <button 
                    onClick={() => setLangTab('en')} 
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${langTab === 'en' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setLangTab('hi')} 
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${langTab === 'hi' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                  >
                    हिन्दी
                  </button>
                  <button 
                    onClick={() => setLangTab('ta')} 
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${langTab === 'ta' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-sm leading-relaxed text-slate-300">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <strong className="text-xs uppercase text-red-400 block mb-1">🌊 Flood safety</strong>
                  <p>{safetyGuides[langTab].flood}</p>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <strong className="text-xs uppercase text-amber-400 block mb-1">🧱 Earthquake safety</strong>
                  <p>{safetyGuides[langTab].earthquake}</p>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <strong className="text-xs uppercase text-sky-400 block mb-1">🌀 Cyclone safety</strong>
                  <p>{safetyGuides[langTab].cyclone}</p>
                </div>
              </div>
            </div>

            {/* Relief resources locator */}
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Relief resources directory</h3>
              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-2">
                {resourcesLoading ? (
                  <p className="text-slate-500 text-sm">Loading shelter information...</p>
                ) : resources.length === 0 ? (
                  <p className="text-slate-500 text-sm">No nearby resource depots registered.</p>
                ) : (
                  resources.map(resObj => (
                    <div key={resObj._id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between text-sm hover:border-slate-800 transition">
                      <div className="space-y-1">
                        <strong className="text-slate-200 block">{resObj.name}</strong>
                        <span className="text-xs text-slate-400 block">Address: {resObj.address}</span>
                        <span className="text-xs text-slate-500 block">Contact: {resObj.contactPhone}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 text-xs font-bold bg-sky-950/40 border border-sky-500/20 text-sky-400 rounded-full block uppercase">
                          {resObj.type}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold block mt-1.5">
                          Capacity: {resObj.availableCapacity} / {resObj.totalCapacity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
