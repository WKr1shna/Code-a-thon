'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAlertContext } from '../../context/AlertContext';

export default function MapComponent() {
  const { alerts } = useAlertContext();
  const defaultCenter = [13.0827, 80.2707]; // Coordinates for Chennai

  useEffect(() => {
    // Fix leafet default icon issue in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="relative w-full h-[320px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-inner z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* Draw a subtle radar circle */}
        <Circle center={defaultCenter} pathOptions={{ fillColor: '#ef4444', color: '#ef4444' }} radius={5000} />

        {alerts && alerts.map(alert => (
          <Marker 
            key={alert._id} 
            position={[
              alert.location?.coordinates[1] || defaultCenter[0], 
              alert.location?.coordinates[0] || defaultCenter[1]
            ]}
          >
            <Popup>
              <strong className="text-slate-800 block text-sm">{alert.title}</strong>
              <span className="text-xs text-slate-500 uppercase">{alert.type} - {alert.severity}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
