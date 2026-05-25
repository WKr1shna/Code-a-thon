import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('citizen'); // citizen or admin
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email || (activeTab === 'admin' ? 'admin@disastersos.com' : 'citizen@disastersos.com'), password, activeTab);
      if (userData) {
        const userRole = userData.role ? userData.role.toUpperCase() : '';
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT HALF */}
      <div className="hidden lg:flex w-1/2 bg-secondary flex-col justify-center px-16 relative overflow-hidden">
        {/* SVG Map Background */}
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

          <h1 className="text-5xl font-black mb-6 leading-tight">
            Protecting Lives,<br />Coordinating Response
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            India's first AI-powered disaster response platform.
          </p>

          <div className="space-y-4">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
              <div className="text-2xl font-black text-primary w-16 text-center">12K+</div>
              <div className="text-sm font-bold text-gray-300">Lives Assisted</div>
            </motion.div>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
              <div className="text-2xl font-black text-accent w-16 text-center">340+</div>
              <div className="text-sm font-bold text-gray-300">NGOs Connected</div>
            </motion.div>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
              <div className="text-2xl font-black text-success w-16 text-center">28</div>
              <div className="text-sm font-bold text-gray-300">States Covered</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className={`w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 transition-colors duration-500 ${activeTab === 'admin' ? 'bg-[#FFF5F5] ring-2 ring-red-100' : ''}`}>
          
          <div className="flex justify-center mb-8 lg:hidden">
            <Shield className="w-12 h-12 text-primary" />
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'citizen' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500'}`}
            >
              Citizen / Responder
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'admin' ? 'bg-red-900 text-white shadow-sm' : 'text-gray-500'}`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {activeTab === 'admin' && (
              <div className="bg-red-100 text-red-800 p-3 rounded-xl flex items-center space-x-3 mb-6 border border-red-200">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-bold tracking-wide uppercase">⚠ Restricted Access — Authorised Personnel Only</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                {activeTab === 'admin' ? 'Admin Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 ${activeTab === 'admin' ? 'bg-white border border-red-200 focus:ring-red-500/20' : 'bg-gray-50 border border-gray-200 focus:ring-blue-500/20'}`}
                  placeholder={activeTab === 'admin' ? 'admin@disastersos.com' : 'name@example.com'}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl outline-none focus:ring-2 ${activeTab === 'admin' ? 'bg-white border border-red-200 focus:ring-red-500/20' : 'bg-gray-50 border border-gray-200 focus:ring-blue-500/20'}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition shadow-lg mt-6 ${activeTab === 'admin' ? 'bg-secondary hover:bg-gray-900 shadow-gray-900/30' : 'bg-primary hover:bg-red-700 shadow-red-500/30'}`}
            >
              {activeTab === 'admin' ? 'Login as Admin' : 'Login'}
            </button>
          </form>

          {activeTab === 'citizen' && (
            <div className="mt-8">
              <div className="flex items-center space-x-4 mb-6">
                <hr className="flex-1 border-gray-200" />
                <span className="text-xs font-bold text-gray-400">OR</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <Link to="/signup" className="block w-full py-3.5 rounded-xl border-2 border-gray-200 text-secondary font-bold text-sm text-center hover:bg-gray-50 transition">
                Create New Account →
              </Link>
              
              <p className="text-[10px] text-gray-400 text-center mt-6 leading-relaxed px-4">
                Logging in as NGO or NDRF? Use your registered organisation credentials. Contact admin for access.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
