import React from 'react';
import { UserCheck, Shield, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

export default function EcosystemSection() {
  const portals = [
    {
      role: "Beekeepers",
      icon: UserCheck,
      badge: "Producer Portal",
      points: [
        "Register apiaries and individual hives",
        "Monitor real-time temperature & weight telemetry",
        "Receive automated pest & disease risk alerts",
        "Log harvests & request lab testing"
      ],
      border: "border-amber-500/30"
    },
    {
      role: "KVIC / Admin",
      icon: Shield,
      badge: "Governance Dashboard",
      points: [
        "National honey production overview",
        "Quality audit compliance & adulteration tracking",
        "Beekeeper subsidy distribution tracking",
        "Regional yield maps & disease heatmaps"
      ],
      border: "border-yellow-500/30"
    },
    {
      role: "Consumers",
      icon: ShoppingBag,
      badge: "Public Verification",
      points: [
        "Instant QR scan verification on honey jars",
        "View verified floral origin & harvest date",
        "Review lab quality purity certificate",
        "Verify blockchain cryptographic hash proof"
      ],
      border: "border-emerald-500/30"
    }
  ];

  return (
    <section id="ecosystem" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-xs uppercase tracking-widest font-extrabold text-amber-400">Target Ecosystem</h2>
        <p className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          Tailored Portals for Every Stakeholder
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {portals.map((portal, i) => {
          const Icon = portal.icon;
          return (
            <div key={i} className={`glass-card p-8 rounded-2xl flex flex-col justify-between border ${portal.border}`}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full font-semibold">
                    {portal.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-100">{portal.role}</h3>
                </div>

                <ul className="space-y-3">
                  {portal.points.map((pt, j) => (
                    <li key={j} className="flex items-start space-x-3 text-xs text-slate-300">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2">
                  <span>View Interface Spec</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
