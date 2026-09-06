import React from 'react';
import { Hexagon, Shield, Cpu, Database, Network } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-20 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-gradient-honey">HONEY CHAIN</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Smart India Hackathon (SIH) 2026 Project. An integrated AI + IoT + Blockchain platform for precision beekeeping and tamper-proof honey supply chain verification.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Architecture</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center space-x-2"><Cpu className="w-3.5 h-3.5 text-amber-400" /> <span>IoT Sensor Array (ESP32)</span></li>
            <li className="flex items-center space-x-2"><Database className="w-3.5 h-3.5 text-amber-400" /> <span>FastAPI + PostgreSQL</span></li>
            <li className="flex items-center space-x-2"><Network className="w-3.5 h-3.5 text-amber-400" /> <span>Private Blockchain Ledger</span></li>
            <li className="flex items-center space-x-2"><Shield className="w-3.5 h-3.5 text-amber-400" /> <span>scikit-learn AI Analytics</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Core Modules</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>Hive Registration & Health</li>
            <li>Real-time IoT Telemetry</li>
            <li>Disease Risk Assessment</li>
            <li>Batch QR Verification</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Governance</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Designed for KVIC (Khadi and Village Industries Commission), Beekeeper Cooperatives, and End Consumers across India.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            © 2026 Honey Chain. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
