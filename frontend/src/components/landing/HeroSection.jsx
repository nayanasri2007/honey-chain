import React from "react";
import {
  Hexagon,
  Cpu,
  Brain,
  Link,
  QrCode,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[590px] overflow-hidden">

      {/* =========================================================
          BACKGROUND IMAGE
      ========================================================== */}

      <div className="absolute inset-0">
        <img
          src="/images/beekeeper.jpg"
          alt="Smart beekeeping"
          className="w-full h-full object-cover"
        />

        {/* Dark green overlay */}
        <div className="absolute inset-0 bg-[#26351f]/75" />

        {/* Extra gradient for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#26351f]/95 via-[#26351f]/75 to-[#26351f]/35" />
      </div>


      {/* =========================================================
          HERO CONTENT
      ========================================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 py-12 min-h-[590px] flex items-center">

        <div className="max-w-4xl w-full">

          {/* =====================================================
              TAGLINE
          ====================================================== */}

          <div className="mb-6">

            <p className="text-amber-300/90 text-xs md:text-sm font-extrabold tracking-[0.28em] uppercase">
              Smart Hives • Intelligent Insights • Trusted Honey
            </p>

          </div>


          {/* =====================================================
              PRODUCT BADGE
          ====================================================== */}

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400/10 border border-amber-400/50 backdrop-blur-sm shadow-lg shadow-amber-500/10">

            <Hexagon
              className="w-4 h-4 text-amber-300"
              strokeWidth={2.5}
            />

            <span className="text-sm md:text-base font-bold text-amber-200">
              Smart Beekeeping & Honey Traceability
            </span>

          </div>


          {/* =====================================================
              MAIN HEADING
          ====================================================== */}

          <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.98]">

            <span className="block text-white">
              From Healthy Hives
            </span>

            <span className="block text-amber-400">
              to Trusted Honey.
            </span>

          </h1>


          {/* =====================================================
              DESCRIPTION
          ====================================================== */}

          <p className="mt-7 max-w-3xl text-lg md:text-xl leading-relaxed text-white/90">

            Honey Chain combines IoT monitoring, AI insights,
            blockchain traceability and QR verification to create
            a transparent journey from beekeeper to consumer.

          </p>


          {/* =====================================================
              FEATURE BUTTONS
          ====================================================== */}

          <div className="mt-9 flex flex-wrap gap-3">

            {/* IoT */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all duration-200"
            >
              <Cpu className="w-4 h-4 text-amber-300" />
              <span>IoT Monitoring</span>
            </button>


            {/* AI */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all duration-200"
            >
              <Brain className="w-4 h-4 text-amber-300" />
              <span>AI Analytics</span>
            </button>


            {/* Blockchain */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all duration-200"
            >
              <Link className="w-4 h-4 text-amber-300" />
              <span>Blockchain</span>
            </button>


            {/* QR */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all duration-200"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>QR Verification</span>
            </button>

          </div>

        </div>

      </div>


      {/* =========================================================
          BOTTOM FADE
      ========================================================== */}

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f7f1df] to-transparent pointer-events-none" />

    </section>
  );
}