import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, WifiOff, BellRing } from 'lucide-react';
import { AppDownload3D } from './ThreeVisuals';

export default function AppDownloadSection() {
  const features = [
    { icon: MapPin, text: 'Geo-tagged SOS in under 10 seconds' },
    { icon: Globe, text: 'Safety instructions in 10+ Indian languages' },
    { icon: WifiOff, text: 'Works offline — syncs when connected' },
    { icon: BellRing, text: 'Instant push alerts for your district' },
  ];

  return (
    <section id="download" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-black uppercase tracking-widest text-xs mb-3 block">RakshAlert Mobile App</span>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary tracking-tight mb-6 leading-tight">
              Command-Level Disaster Response, <br/>Right In Your Pocket
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              RakshAlert is India's most advanced disaster response app. Designed for citizens, NGOs, and government agencies alike, it lets you report emergencies with a single tap, view AI-verified alerts on a live map, receive safety instructions in your language, and find the nearest shelter, food camp, or medical unit — even without internet.
            </p>

            <ul className="space-y-4 mb-10">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center space-x-3 text-secondary font-semibold">
                  <div className="bg-red-50 p-2 rounded-lg text-primary">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <button className="flex items-center space-x-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition shadow-lg w-full sm:w-auto justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8" />
              </button>
              <button className="flex items-center space-x-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition shadow-lg w-full sm:w-auto justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8" />
              </button>
            </div>
            <div className="mt-4 text-center sm:text-left">
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-primary transition underline decoration-gray-300 underline-offset-4">
                APK Direct Download ↓
              </a>
            </div>
          </motion.div>

          {/* Right: Rotating 3D Phone with Pulsing Signal Waves */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block relative z-10"
          >
            <AppDownload3D />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
