import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <Shield className={`w-8 h-8 ${isScrolled ? 'text-primary' : 'text-white group-hover:text-primary transition-colors'}`} />
          <span className={`text-2xl font-black tracking-tight ${isScrolled ? 'text-secondary' : 'text-white'}`}>
            RakshAlert
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => scrollTo('map')} className={`text-sm font-semibold hover:text-primary transition ${isScrolled ? 'text-secondary' : 'text-gray-300'}`}>Map</button>
          <button onClick={() => scrollTo('features')} className={`text-sm font-semibold hover:text-primary transition ${isScrolled ? 'text-secondary' : 'text-gray-300'}`}>Features</button>
          <button onClick={() => scrollTo('impact')} className={`text-sm font-semibold hover:text-primary transition ${isScrolled ? 'text-secondary' : 'text-gray-300'}`}>Impact</button>
          <button onClick={() => scrollTo('download')} className={`text-sm font-semibold hover:text-primary transition ${isScrolled ? 'text-secondary' : 'text-gray-300'}`}>Download</button>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className={`px-5 py-2 text-sm font-bold rounded-xl transition border ${isScrolled ? 'text-secondary border-gray-200 hover:border-primary hover:text-primary' : 'text-white border-white/30 hover:border-white'}`}>
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 text-sm font-bold rounded-xl bg-primary hover:bg-red-700 text-white shadow-lg shadow-red-500/30 transition">
            Sign Up
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className={isScrolled ? 'text-secondary' : 'text-white'} /> : <Menu className={isScrolled ? 'text-secondary' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col p-6 space-y-4">
          <button onClick={() => scrollTo('map')} className="text-left font-bold text-secondary">Map</button>
          <button onClick={() => scrollTo('features')} className="text-left font-bold text-secondary">Features</button>
          <button onClick={() => scrollTo('impact')} className="text-left font-bold text-secondary">Impact</button>
          <button onClick={() => scrollTo('download')} className="text-left font-bold text-secondary">Download</button>
          <hr />
          <Link to="/login" className="font-bold text-center border border-gray-200 py-2 rounded-xl">Login</Link>
          <Link to="/signup" className="font-bold text-center bg-primary text-white py-2 rounded-xl">Sign Up</Link>
        </div>
      )}
    </nav>
  );
}
