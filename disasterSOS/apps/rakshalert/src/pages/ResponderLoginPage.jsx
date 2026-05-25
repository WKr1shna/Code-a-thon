import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ShieldAlert, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ResponderLoginPage() {
  const { login, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = await login(email, password);
      if (userData) {
        const userRole = userData.role ? userData.role.toUpperCase() : '';
        if (userRole === 'COORDINATOR' || userRole === 'RESPONDER') {
          toast.success(`Welcome to the Rescue Portal, Officer ${userData.name}!`);
          navigate('/responder-portal');
        } else {
          // Deny regular citizens or unverified roles, log them out instantly
          logout();
          toast.error("Access Denied: This portal is reserved strictly for verified NDRF and NGO rescue teams.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0e1a] text-white">
      {/* LEFT HALF (Brand Banner with Hologram Vibes) */}
      <div className="hidden lg:flex w-1/2 bg-[#0f1422] flex-col justify-center px-16 relative overflow-hidden border-r border-gray-800">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-[150%] h-[150%] text-white fill-current animate-pulse">
            <path d="M40 10 L50 0 L60 10 L65 25 L80 35 L75 55 L85 65 L80 80 L60 90 L50 100 L40 90 L20 80 L15 65 L25 55 L20 35 L35 25 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-lg">
          <Link to="/" className="flex items-center space-x-2 mb-12 group">
            <Shield className="w-10 h-10 text-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-transform" />
            <span className="text-3xl font-black tracking-widest uppercase bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">RakshAlert</span>
          </Link>

          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight text-white">
            Command Center<br />Rescue Portal
          </h1>
          <p className="text-lg text-gray-400 mb-12 leading-relaxed">
            Secure terminal for verified NGO coordinators, disaster relief teams, and NDRF responders.
          </p>

          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-gray-800 flex items-center space-x-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Navigation className="w-5 h-5 animate-pulse" /></div>
              <div>
                <div className="text-sm font-black uppercase text-gray-300">Live GPS Coordinates</div>
                <div className="text-xs text-gray-500">Real-time localized citizen tracking active</div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-gray-800 flex items-center space-x-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><ShieldAlert className="w-5 h-5" /></div>
              <div>
                <div className="text-sm font-black uppercase text-gray-300">FastAPI AI Verification</div>
                <div className="text-xs text-gray-500">Active automated threat validity scoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT HALF (Login Form Card) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0a0e1a]">
        <div className="w-full max-w-md bg-[#111827] rounded-[2rem] shadow-2xl p-8 sm:p-10 border border-gray-800">
          
          <div className="flex justify-center mb-8 lg:hidden">
            <Shield className="w-12 h-12 text-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2 text-white">Rescue Login</h2>
            <p className="text-sm text-gray-400">Access NDRF & NGO task coordinator terminal</p>
          </div>

          <div className="bg-red-500/10 text-red-400 p-3 rounded-xl flex items-center space-x-3 mb-6 border border-red-500/20 text-xs">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold tracking-wide uppercase">⚠ Authorised Personnel Access Only</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Responder Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-red-500 bg-[#0f1422] border border-gray-700 text-white placeholder-gray-600 text-sm"
                  placeholder="ngo@disastersos.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl outline-none focus:ring-1 focus:ring-red-500 bg-[#0f1422] border border-gray-700 text-white placeholder-gray-600 text-sm"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest transition shadow-lg mt-6 rounded-xl shadow-red-600/30 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Decrypting Credentials...' : 'Authenticate & Enter →'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-800 pt-6 text-center">
            <Link to="/login" className="text-xs font-bold text-gray-400 hover:text-red-400 transition">
              ← Access Citizen Portal Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
