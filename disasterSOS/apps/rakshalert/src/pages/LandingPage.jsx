import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AppDownloadSection from '../components/AppDownloadSection';
import LiveMapSection from '../components/LiveMapSection';
import FeaturesSection from '../components/FeaturesSection';
import ProblemsSolvedSection from '../components/ProblemsSolvedSection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <HeroSection />
      <AppDownloadSection />
      <LiveMapSection />
      <FeaturesSection />
      <ProblemsSolvedSection />
      <Footer />
    </div>
  );
}
