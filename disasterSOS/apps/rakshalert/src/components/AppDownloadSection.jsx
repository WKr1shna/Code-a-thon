import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, WifiOff, BellRing } from 'lucide-react';

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

          {/* Right: Dual Phone Mockup (CSS Only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] hidden sm:block"
          >
            {/* Back Phone (Map) */}
            <div className="absolute right-0 top-10 w-[280px] h-[580px] bg-secondary border-[8px] border-gray-800 rounded-[3rem] shadow-2xl rotate-6 opacity-60">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20"></div>
              <div className="w-full h-full bg-gray-100 rounded-[2rem] overflow-hidden p-2">
                <div className="w-full h-full bg-[url('https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png')] bg-cover opacity-30"></div>
              </div>
            </div>

            {/* Front Phone (SOS Report) */}
            <div className="absolute left-10 top-0 w-[300px] h-[600px] bg-white border-[8px] border-gray-900 rounded-[3rem] shadow-2xl z-10 flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>
              
              <div className="flex-1 bg-background rounded-[2rem] overflow-hidden flex flex-col">
                <div className="bg-primary text-white pt-12 pb-6 px-6 text-center shadow-md">
                  <h3 className="font-black text-2xl uppercase tracking-widest">SOS Panic</h3>
                  <p className="text-xs opacity-80 mt-1">Hold to broadcast location</p>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  {/* Big SOS Button */}
                  <div className="w-40 h-40 bg-red-100 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 border-4 border-red-200 rounded-full animate-ping-slow"></div>
                    <button className="w-32 h-32 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white font-black text-3xl shadow-red-500/50 hover:scale-95 transition-transform">
                      SOS
                    </button>
                  </div>
                  
                  <div className="w-full space-y-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">🌊</div>
                      <span className="font-bold text-secondary text-sm">Flood Emergency</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">🔥</div>
                      <span className="font-bold text-secondary text-sm">Fire Breakout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
