import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { AlertCircle, MapPin, Activity, Users } from 'lucide-react';
import SeverityLegend from './SeverityLegend';
import { mockAlerts } from '../data/mockAlerts';

export default function LiveMapSection() {
  
  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'NORMAL': return { color: '#2DC653', radius: 6, pulse: false };
      case 'LOW': return { color: '#F4A261', radius: 8, pulse: false };
      case 'MEDIUM': return { color: '#FF6B35', radius: 10, pulse: false };
      case 'HIGH': return { color: '#D72638', radius: 14, pulse: false };
      case 'CRITICAL': return { color: '#6B0F1A', radius: 18, pulse: true };
      default: return { color: '#2DC653', radius: 6, pulse: false };
    }
  };

  return (
    <section id="map" className="py-24 bg-[#F0F4F8]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-fast"></span>
            <span className="text-primary font-black uppercase tracking-widest text-xs">Live Monitoring</span>
          </div>
          <h2 className="text-4xl font-black text-secondary tracking-tight mb-4">
            Real-Time Disaster Map of India
          </h2>
          <p className="text-gray-500 text-lg">
            Updated every 60 seconds. AI-verified incidents only.
          </p>
        </div>

        {/* Map Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full h-[550px] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-red-100 bg-white"
        >
          <MapContainer 
            center={[22.5937, 78.9629]} 
            zoom={5} 
            scrollWheelZoom={false}
            className="w-full h-full z-10"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {mockAlerts.map(alert => {
              const style = getSeverityStyle(alert.severity);
              return (
                <CircleMarker
                  key={alert.id}
                  center={[alert.lat, alert.lng]}
                  pathOptions={{ 
                    color: style.color, 
                    fillColor: style.color, 
                    fillOpacity: 0.6,
                    className: style.pulse ? 'animate-pulse-fast' : ''
                  }}
                  radius={style.radius}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <strong className="font-bold text-secondary">{alert.title}</strong>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded text-white`} style={{ backgroundColor: style.color }}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">📍 {alert.district}, {alert.state}</p>
                      <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                      <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg text-center font-semibold uppercase tracking-wider">
                        Reported {alert.reportedAt}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </motion.div>

        {/* Legend */}
        <SeverityLegend />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {[
            { icon: AlertCircle, label: 'Active Incidents', value: '47', color: 'text-primary' },
            { icon: MapPin, label: 'States Affected', value: '12', color: 'text-accent' },
            { icon: Activity, label: 'Critical Zones', value: '8', color: 'text-red-900' },
            { icon: Users, label: 'Responders Deployed', value: '230', color: 'text-success' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4"
            >
              <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
