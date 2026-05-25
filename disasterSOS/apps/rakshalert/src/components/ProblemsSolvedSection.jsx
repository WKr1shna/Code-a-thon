import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, ShieldCheck } from 'lucide-react';
import { ProblemsSolvedBackground } from './ThreeVisuals';

export default function ProblemsSolvedSection() {
  const pairs = [
    {
      problem: { title: "Fragmented Reporting", desc: "Citizens call overloaded helplines or post on social media. By the time reports reach rescue teams, critical hours are lost." },
      solution: { title: "Unified SOS Platform", desc: "One tap SOS with GPS auto-tag reaches NGOs and NDRF simultaneously in under 30 seconds." }
    },
    {
      problem: { title: "Fake Alert Overload", desc: "During disasters, 60-70% of social media reports are unverified. Responders waste resources on false emergencies." },
      solution: { title: "AI Verification Pipeline", desc: "NLP + image analysis + geo-cluster frequency scoring filters fakes with 91% accuracy before any alert goes live." }
    },
    {
      problem: { title: "Language Barrier", desc: "Most emergency apps work only in English, leaving 700 million Hindi and regional-language speakers without guidance." },
      solution: { title: "10-Language AI Translation", desc: "Safety instructions auto-generated in the user's preferred language using NLLB-200 multilingual AI model." }
    }
  ];

  return (
    <section id="impact" className="py-24 bg-secondary relative overflow-hidden">
      {/* 3D Flowing Turbulent Disaster Wave Field */}
      <ProblemsSolvedBackground />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-primary text-white font-bold uppercase tracking-widest text-xs px-4 py-1.5 rounded-full mb-4">
            The Problem We're Solving
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            India Loses Lives to Broken Emergency Systems
          </h2>
          <p className="text-gray-400 text-lg">
            We studied how disaster response fails in India and rebuilt it from scratch.
          </p>
        </div>

        <div className="space-y-6 max-w-5xl mx-auto">
          {pairs.map((pair, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {/* Problem Card */}
              <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertOctagon className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-bold text-red-400 uppercase tracking-wider">{pair.problem.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{pair.problem.desc}</p>
              </div>
              
              {/* Solution Card */}
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-6 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center space-x-3 mb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-wider">{pair.solution.title}</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{pair.solution.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Impact Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-10 max-w-5xl mx-auto text-center"
        >
          <h3 className="text-2xl font-black text-white mb-8">What We've Built For India</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-black text-white mb-2">91%</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">&lt;30s</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">To Notify NDRF</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">10+</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Languages</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">0 MB</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Offline Mode</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
