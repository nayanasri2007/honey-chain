import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import EcosystemSection from '../components/landing/EcosystemSection';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`);
        if (response.ok) {
          const data = await response.json();
          setHealthStatus(data);
        } else {
          setHealthStatus({ status: 'offline', database: 'error' });
        }
      } catch (error) {
        setHealthStatus({ status: 'offline', database: 'disconnected' });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar healthStatus={healthStatus} />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <EcosystemSection />
      </main>
      <Footer />
    </div>
  );
}
