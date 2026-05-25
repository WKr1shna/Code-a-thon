import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-secondary pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          
          {/* Logo & Tagline */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-2xl font-black tracking-tight text-white">RakshAlert</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              India's first AI-powered disaster response platform. Coordinating relief and saving lives when every second counts.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#map" className="hover:text-primary transition">Live Map</a></li>
              <li><a href="#features" className="hover:text-primary transition">Features</a></li>
              <li><a href="#impact" className="hover:text-primary transition">Impact</a></li>
              <li><a href="#download" className="hover:text-primary transition">Download App</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">For Responders</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/login" className="hover:text-primary transition">NDRF Login</Link></li>
              <li><Link to="/login" className="hover:text-primary transition">NGO Portal</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition">Command Center</Link></li>
              <li><a href="#" className="hover:text-primary transition">API Documentation</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">About</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition">Our Mission</a></li>
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2025 RakshAlert. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Built for Bharat</span>
            <span className="text-primary">❤</span>
            <span>during Hackathon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
