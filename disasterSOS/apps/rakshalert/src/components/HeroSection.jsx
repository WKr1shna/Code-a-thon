import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BrainCircuit, Activity } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ThreeBackground from './ThreeBackground';
import api from '../services/api';
import { io } from 'socket.io-client';

export default function HeroSection() {
  const [latestAlert, setLatestAlert] = useState(null);

  useEffect(() => {
    const fetchLatestAlert = async () => {
      try {
        const response = await api.get('/sos/nearby?lat=22.5937&lng=78.9629&radius=5000');
        if (response.data.success) {
          const rawAlerts = response.data.data;
          const activeAlerts = rawAlerts.filter(a => a.status !== 'resolved' && a.status !== 'fake');
          if (activeAlerts.length > 0) {
            // Map location coordinate properties cleanly for Leaflet markers
            const latest = activeAlerts[0];
            setLatestAlert({
              ...latest,
              id: latest.id || latest._id,
              lat: latest.lat || (latest.location?.coordinates && latest.location.coordinates[1]) || 25.5941,
              lng: latest.lng || (latest.location?.coordinates && latest.location.coordinates[0]) || 85.1376,
              reporter: latest.reporter || { fullName: latest.reportedBy?.name || 'Citizen' }
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch latest alert for mockup:", err);
      }
    };

    fetchLatestAlert();

    const socket = io('http://localhost:5001');
    socket.on('sos_update', () => {
      fetchLatestAlert();
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-secondary">
      {/* 3D Background */}
      <ThreeBackground />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex items-center space-x-2 bg-red-900/30 border border-red-500/30 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-fast"></span>
              <span className="text-red-400 text-xs font-bold tracking-wider uppercase">Live — 47 Active Incidents Across India</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
              When Every Second Counts, <br/><span className="text-primary">India Responds Together</span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-10 max-w-xl leading-relaxed">
              AI-powered disaster alerts, real-time rescue coordination, and multilingual safety guidance — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => scrollTo('download')}
                className="px-8 py-4 bg-primary hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition text-center"
              >
                Download the App
              </button>
              <button 
                onClick={() => scrollTo('map')}
                className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold rounded-xl transition text-center"
              >
                View Live Map →
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 items-center text-gray-400 text-sm font-semibold">
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-success"/> NDRF Integrated</div>
              <div className="flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-accent"/> AI Verified Alerts</div>
              <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400"/> Real-time Data</div>
            </div>
          </motion.div>

          {/* Right Phone Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-[320px] mx-auto lg:mx-0"
          >
            {/* Ping Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-[ping_4s_ease-out_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-[ping_4s_ease-out_infinite] delay-1000"></div>

            {/* Phone Body */}
            <div className="relative bg-gray-900 border-[8px] border-gray-800 rounded-[3rem] h-[650px] w-full overflow-hidden shadow-2xl flex flex-col items-center">
              {/* Notch */}
              <div className="absolute top-0 w-32 h-6 bg-gray-800 rounded-b-2xl z-20"></div>
              
              {/* Fake Map App UI */}
              <div className="w-full h-full bg-[#1A1A2E] relative p-4 pt-12">
                <div className="w-full h-48 rounded-2xl mb-4 overflow-hidden relative border border-gray-800 ring-2 ring-red-500/10 bg-gray-900">
                  <MapContainer
                    key={latestAlert?.id || 'fallback'}
                    center={[
                      latestAlert?.lat || (latestAlert?.location?.coordinates && latestAlert.location.coordinates[1]) || 25.5941,
                      latestAlert?.lng || (latestAlert?.location?.coordinates && latestAlert.location.coordinates[0]) || 85.1376
                    ]}
                    zoom={9}
                    zoomControl={false}
                    dragging={false}
                    doubleClickZoom={false}
                    scrollWheelZoom={false}
                    attributionControl={false}
                    className="w-full h-full z-10"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <CircleMarker
                      center={[
                        latestAlert?.lat || (latestAlert?.location?.coordinates && latestAlert.location.coordinates[1]) || 25.5941,
                        latestAlert?.lng || (latestAlert?.location?.coordinates && latestAlert.location.coordinates[0]) || 85.1376
                      ]}
                      pathOptions={{ color: '#D72638', fillColor: '#D72638', fillOpacity: 0.6 }}
                      radius={12}
                    />
                  </MapContainer>
                </div>

                {/* Floating Alert Card */}
                <motion.div 
                  key={latestAlert?.id || 'mock'}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-4 shadow-xl relative z-10 text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-gray-900 text-sm uppercase truncate max-w-[130px]">
                      🚨 {latestAlert ? latestAlert.title : 'WAITING FOR SOS'}
                    </h3>
                    <span className={`px-2 py-0.5 font-bold text-[10px] rounded animate-pulse-fast ${
                      (latestAlert?.severity || 'CRITICAL') === 'CRITICAL' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {latestAlert ? latestAlert.severity : 'STANDBY'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-2 truncate">
                    📍 {latestAlert ? (latestAlert.district || latestAlert.reportedBy?.district || 'Verified Area') : 'All India Monitoring'}
                  </p>
                  <p className="text-[11px] text-gray-600 leading-relaxed mb-3 line-clamp-3">
                    {latestAlert ? latestAlert.description : 'No active emergencies reported. Standing by for geotagged citizen panic transmissions.'}
                  </p>
                  <button onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-2 bg-primary hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                    {latestAlert ? 'View on Live Map' : 'Go to Emergency Map'}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
