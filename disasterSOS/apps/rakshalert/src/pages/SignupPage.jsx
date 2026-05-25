import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ChevronLeft, Check, Home, HeartHandshake, Tent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', language: 'English',
    role: 'citizen', district: '', state: '', consent: false
  });

  const updateForm = (key, value) => setFormData({ ...formData, [key]: value });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) return toast.error("Please fill all required fields");
      setStep(2);
    } else if (step === 2) {
      if (!formData.district || !formData.state) return toast.error("Please select location");
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) return toast.error("You must agree to terms and location access.");
    
    try {
      const roleMap = {
        'citizen': 'citizen',
        'ngo': 'ngo',
        'ndrf': 'ndrf'
      };

      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        password: formData.password,
        role: roleMap[formData.role] || 'citizen',
        district: formData.district || 'Unknown',
        language: formData.language || 'English'
      });

      if (res.data.success) {
        toast.success("Account created successfully!");
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT HALF (Same as Login) */}
      <div className="hidden lg:flex w-1/2 bg-secondary flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-[150%] h-[150%] text-white fill-current">
            <path d="M40 10 L50 0 L60 10 L65 25 L80 35 L75 55 L85 65 L80 80 L60 90 L50 100 L40 90 L20 80 L15 65 L25 55 L20 35 L35 25 Z" />
          </svg>
        </div>
        <div className="relative z-10 text-white max-w-lg">
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-3xl font-black tracking-tight">RakshAlert</span>
          </Link>
          <h1 className="text-5xl font-black mb-6 leading-tight">Join India's Response Network</h1>
          <p className="text-xl text-gray-400 mb-12">Together we can save lives when disaster strikes.</p>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 bg-gray-50 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          
          <div className="mb-10">
            <h2 className="text-3xl font-black text-secondary mb-2">Create Account</h2>
            <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link></p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
            <motion.div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            ></motion.div>
            
            {[1, 2, 3].map(num => (
              <div key={num} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Full Name *</label>
                    <input type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email *</label>
                    <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Password *</label>
                    <input type="password" value={formData.password} onChange={e => updateForm('password', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Preferred Language</label>
                    <select value={formData.language} onChange={e => updateForm('language', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none">
                      {['English', 'हिंदी', 'தமிழ்', 'বাংলা', 'తెలుగు', 'मराठी'].map(lang => <option key={lang}>{lang}</option>)}
                    </select>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Role & Location */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Your Role</label>
                    <div className="space-y-3">
                      {[
                        { id: 'citizen', icon: Home, title: 'Citizen', desc: 'Report emergencies, get alerts' },
                        { id: 'ngo', icon: HeartHandshake, title: 'NGO Worker', desc: 'Coordinate relief operations' },
                        { id: 'ndrf', icon: Tent, title: 'NDRF Officer', desc: 'Command rescue teams' }
                      ].map(r => (
                        <div key={r.id} onClick={() => updateForm('role', r.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center space-x-4 ${formData.role === r.id ? 'border-primary bg-red-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                          <r.icon className={`w-6 h-6 ${formData.role === r.id ? 'text-primary' : 'text-gray-400'}`} />
                          <div>
                            <div className={`font-bold ${formData.role === r.id ? 'text-primary' : 'text-secondary'}`}>{r.title}</div>
                            <div className="text-xs text-gray-500">{r.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">State *</label>
                      <select value={formData.state} onChange={e => updateForm('state', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none">
                        <option value="">Select...</option>
                        {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Bihar', 'Assam'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">District *</label>
                      <input type="text" placeholder="e.g. Pune" value={formData.district} onChange={e => updateForm('district', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Confirmation */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-secondary mb-4 border-b pb-2">Account Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-bold">{formData.name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-bold">{formData.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Role:</span> <span className="font-bold capitalize">{formData.role}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Location:</span> <span className="font-bold">{formData.district}, {formData.state}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Language:</span> <span className="font-bold">{formData.language}</span></div>
                    </div>
                  </div>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input type="checkbox" checked={formData.consent} onChange={e => updateForm('consent', e.target.checked)} className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                    <span className="text-sm text-gray-600">
                      I agree to the Terms of Service and <strong className="text-secondary">consent to sharing my GPS location</strong> when reporting an emergency.
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center px-4 py-2 text-sm font-bold text-gray-500 hover:text-secondary transition">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
              ) : <div></div>}

              {step < 3 ? (
                <button onClick={handleNext} className="flex items-center px-6 py-2 bg-secondary text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button onClick={handleSubmit} className="flex items-center px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-500/30">
                  Create Account <Check className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
