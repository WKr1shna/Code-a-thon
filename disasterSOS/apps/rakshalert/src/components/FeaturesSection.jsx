import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Map, Globe2, WifiOff, MessageCircle, Tent, Users, TrendingUp, Building2 } from 'lucide-react';
import { FeaturesBackground } from './ThreeVisuals';

export default function FeaturesSection() {
  const features = [
    {
      icon: ShieldAlert,
      title: "AI Fake Alert Detection",
      desc: "Our NLP model cross-checks text, photos, and report frequency to filter out false alarms before they reach responders."
    },
    {
      icon: Map,
      title: "Real-Time Severity Heatmap",
      desc: "See exactly where danger is highest with a live geo-cluster heatmap, updated every 60 seconds from verified ground reports."
    },
    {
      icon: Globe2,
      title: "Multilingual Safety Instructions",
      desc: "AI generates step-by-step safety guidance in Hindi, Tamil, Bengali, Telugu, Marathi, and 6 more languages — instantly."
    },
    {
      icon: WifiOff,
      title: "Offline-First Mode",
      desc: "Report emergencies even without internet. Data syncs automatically the moment connectivity is restored."
    },
    {
      icon: MessageCircle,
      title: "SMS & WhatsApp Alerts",
      desc: "Reaching citizens without smartphones via Twilio-powered SMS and WhatsApp broadcasts for zero-data areas."
    },
    {
      icon: Tent,
      title: "Live Resource Tracker",
      desc: "Real-time availability of shelters, food camps, and medical units — updated by NGOs directly from the field."
    },
    {
      icon: Users,
      title: "Volunteer Coordination Engine",
      desc: "Skill-matched task assignment connects the right volunteer to the right emergency, with status tracking."
    },
    {
      icon: TrendingUp,
      title: "Predictive Flood Mapping",
      desc: "Historical data + ML predicts high-risk zones before floods hit, enabling pre-emptive evacuation."
    },
    {
      icon: Building2,
      title: "Direct NDRF Integration",
      desc: "Government rescue teams get a dedicated command dashboard with deployment tracking and incident ownership."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white/75 backdrop-blur-sm relative z-10 overflow-hidden">
      {/* 3D AI Network Node Graph Background */}
      <FeaturesBackground />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-black uppercase tracking-widest text-xs mb-3 block">Why RakshAlert is Different</span>
          <h2 className="text-4xl font-black text-secondary tracking-tight mb-4">
            Everything Traditional Apps Don't Have
          </h2>
          <p className="text-gray-500 text-lg">
            Built specifically for India's disaster landscape, with technology no other emergency app offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              <div className="w-12 h-12 bg-red-50 text-primary rounded-xl flex items-center justify-center mb-6">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
