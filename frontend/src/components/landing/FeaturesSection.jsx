import React from 'react';
import { Cpu, BrainCircuit, ShieldCheck, QrCode, TestTube2, LayoutDashboard, UserCheck, Scale } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: UserCheck,
      title: "Beekeeper & Hive Registry",
      description: "Digital profile management, geolocation tagging, and apiary registry for honey producers across regions.",
      color: "text-amber-400"
    },
    {
      icon: Cpu,
      title: "IoT Hive Telemetry",
      description: "Real-time acoustic frequency, internal temperature, humidity, and weight monitoring with ESP32 sensor feeds.",
      color: "text-yellow-400"
    },
    {
      icon: BrainCircuit,
      title: "AI Health & Risk Engine",
      description: "scikit-learn powered ML models to detect colony collapse risk, Varroa mite stress, and forecast honey yields.",
      color: "text-amber-500"
    },
    {
      icon: TestTube2,
      title: "Honey Quality Analytics",
      description: "Standardized lab quality parameters (HMF levels, moisture content, diastase activity, pollen origin verification).",
      color: "text-amber-300"
    },
    {
      icon: ShieldCheck,
      title: "Blockchain Batch Ledger",
      description: "Local private blockchain ledger storing immutable hash records of every honey harvest batch.",
      color: "text-amber-400"
    },
    {
      icon: QrCode,
      title: "Batch QR Code Generation",
      description: "Unique QR code printing for honey jars giving consumers instant access to origin and purity certificates.",
      color: "text-emerald-400"
    },
    {
      icon: LayoutDashboard,
      title: "Beekeeper Operations Hub",
      description: "Actionable dashboard for hive management, feeding schedules, harvest logs, and environmental alerts.",
      color: "text-yellow-400"
    },
    {
      icon: Scale,
      title: "KVIC & Admin Governance",
      description: "National scale analytics, authenticity tracking, adulteration flags, and subsidy allocation monitoring.",
      color: "text-amber-500"
    }
  ];

  return (
    <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-xs uppercase tracking-widest font-extrabold text-amber-400">Integrated Platform Pillars</h2>
        <p className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          Built for Scale, Trust & Quality
        </p>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm">
          Combining hardware telemetry, artificial intelligence, and decentralized ledger technology into one unified platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Module {idx + 1}</span>
                <span className="text-amber-500/80">Ready</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
