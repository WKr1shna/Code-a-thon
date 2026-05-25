'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Chennai');
  const [role, setRole] = useState('citizen');
  const [language, setLanguage] = useState('en');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    if (role === 'admin') router.push('/admin');
    else if (role === 'ndrf') router.push('/supervisor');
    else if (role === 'ngo') router.push('/responder');
    else router.push('/citizen');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isRegisterMode) {
      const result = await register({
        name,
        email,
        phone,
        password,
        role,
        district,
        language
      });
      setLoading(false);
      if (result.success) {
        redirectUser(result.user.role);
      } else {
        setErrorMsg(result.message);
      }
    } else {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) {
        redirectUser(result.user.role);
      } else {
        setErrorMsg(result.message);
      }
    }
  };

  const handleQuickLogin = async (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setErrorMsg('');
    setLoading(true);

    const result = await login(roleEmail, 'password123');
    setLoading(false);

    if (result.success) {
      redirectUser(result.user.role);
    } else {
      setErrorMsg(result.message || 'Seeded account not found. Ensure backend database seeder was run.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-6 overflow-hidden">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-25"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 z-10 items-center">
        
        {/* Title branding column */}
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Emergency Coordination Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
            Disaster Response Coordination & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">Community Safety</span> Alert Platform
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed">
            A unified network connecting citizens, NGO responders, and NDRF commanders. Trigger SOS panic alerts, coordinate rescue, map resources, and broadcast alerts in real-time.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
              <div className="text-2xl font-bold text-red-500">100%</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Geo-Tagged</div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
              <div className="text-2xl font-bold text-amber-500">FastAPI</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">AI Verified</div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
              <div className="text-2xl font-bold text-sky-500">FCM</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Real-Time</div>
            </div>
          </div>
        </div>

        {/* Form column */}
        <div className="p-8 sm:p-10 bg-slate-900/40 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-100">
              {isRegisterMode ? 'Create an Account' : 'Sign In to Dashboard'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isRegisterMode ? 'Join the disaster response and coordination network.' : 'Access role portals and dispatch command controls.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-950/80 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 rounded-xl outline-none transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 rounded-xl outline-none transition duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">District</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Chennai"
                      className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 rounded-xl outline-none transition duration-150"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 rounded-xl outline-none transition duration-150"
                    >
                      <option value="citizen">👤 Local Citizen</option>
                      <option value="ngo">🤝 NGO Responder</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@disastersos.com"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 rounded-xl outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-red-500/40 text-slate-100 rounded-xl outline-none transition duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg transition duration-200 uppercase tracking-widest text-xs"
            >
              {loading ? (isRegisterMode ? 'Creating Account...' : 'Authenticating...') : (isRegisterMode ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Toggle register / sign-in view */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
              }}
              className="text-xs font-semibold text-slate-400 hover:text-red-400 transition"
            >
              {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>

          {/* Quick presets for Developer/Hackathon Testing */}
          {!isRegisterMode && (
            <div className="border-t border-slate-800/80 pt-6">
              <span className="block text-xs font-bold uppercase text-slate-500 mb-3 text-center tracking-wider">
                Developer Preset Logins
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => handleQuickLogin('admin@disastersos.com')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-red-500/30 text-slate-300 font-semibold rounded-xl text-left transition"
                >
                  👑 Admin Portal
                </button>
                <button
                  onClick={() => handleQuickLogin('ndrf@disastersos.com')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/30 text-slate-300 font-semibold rounded-xl text-left transition"
                >
                  🎖️ NDRF Commander
                </button>
                <button
                  onClick={() => handleQuickLogin('ngo@disastersos.com')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-sky-500/30 text-slate-300 font-semibold rounded-xl text-left transition"
                >
                  🤝 NGO Responder
                </button>
                <button
                  onClick={() => handleQuickLogin('citizen@disastersos.com')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-slate-300 font-semibold rounded-xl text-left transition"
                >
                  👤 Local Citizen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
