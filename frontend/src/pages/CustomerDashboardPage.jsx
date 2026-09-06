import React from "react";

export default function CustomerDashboardPage({
  setActiveTab,
}) {
  const handleTraceability = () => {
    setActiveTab("traceability");
  };

  return (
    <div className="min-h-screen bg-[#f7f1df] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* ========================= */}
        {/* HERO */}
        {/* ========================= */}

        <section className="relative overflow-hidden rounded-3xl bg-[#24180d] px-6 py-10 text-white shadow-xl sm:px-10 lg:px-12">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-500/10" />

          <div className="relative z-10 max-w-3xl">

            <div className="mb-4 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-xs font-bold tracking-wider text-amber-200">
              🍯 MADHUSATHYA CONSUMER PORTAL
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Welcome to
              <span className="text-[#d99a2b]">
                {" "}MadhuSathya
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-amber-50/70 sm:text-base">
              Discover authentic honey and explore the journey behind every
              drop — from the hive and beekeeper to the bottle in your hands.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <button
                onClick={handleTraceability}
                className="rounded-xl bg-[#d99a2b] px-5 py-3 text-sm font-black text-[#24180d] shadow-lg transition hover:bg-[#e6aa35]"
              >
                🔍 Verify Honey
              </button>

              <button
                onClick={handleTraceability}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explore Traceability →
              </button>

            </div>
          </div>
        </section>

        {/* ========================= */}
        {/* QUICK ACTIONS */}
        {/* ========================= */}

        <section className="mt-8">

          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
              Consumer tools
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Everything you need to trust your honey
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* Verify */}
            <button
              onClick={handleTraceability}
              className="group rounded-3xl border border-amber-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                🔍
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Verify Honey
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Check the authenticity and registered traceability information
                associated with your honey batch.
              </p>

              <div className="mt-5 text-sm font-bold text-amber-700">
                Verify a batch →
              </div>
            </button>

            {/* Trace */}
            <button
              onClick={handleTraceability}
              className="group rounded-3xl border border-amber-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                🔗
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Trace Your Honey
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Follow the recorded journey of a honey batch through its
                production and traceability events.
              </p>

              <div className="mt-5 text-sm font-bold text-amber-700">
                View journey →
              </div>
            </button>

            {/* QR */}
            <button
              onClick={handleTraceability}
              className="group rounded-3xl border border-amber-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                ▦
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                QR Verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Scan or use a product verification link to inspect the
                registered honey information.
              </p>

              <div className="mt-5 text-sm font-bold text-amber-700">
                Start verification →
              </div>
            </button>

          </div>
        </section>

        {/* ========================= */}
        {/* TRUST FEATURES */}
        {/* ========================= */}

        <section className="mt-8 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">

          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
              Why MadhuSathya?
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Transparency from hive to bottle
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              MadhuSathya connects beekeeping data, honey production and
              traceability records to help consumers make more informed
              choices.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-[#faf6e9] p-5">
              <div className="text-2xl">🐝</div>

              <h3 className="mt-3 font-black text-slate-900">
                Hive Origin
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Know the hive and beekeeper information connected to
                registered production.
              </p>
            </div>

            <div className="rounded-2xl bg-[#faf6e9] p-5">
              <div className="text-2xl">📡</div>

              <h3 className="mt-3 font-black text-slate-900">
                Smart Monitoring
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                IoT-based hive observations support the production journey.
              </p>
            </div>

            <div className="rounded-2xl bg-[#faf6e9] p-5">
              <div className="text-2xl">🧪</div>

              <h3 className="mt-3 font-black text-slate-900">
                Honey Quality
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Quality analysis can be associated with registered honey
                batches.
              </p>
            </div>

            <div className="rounded-2xl bg-[#faf6e9] p-5">
              <div className="text-2xl">🔐</div>

              <h3 className="mt-3 font-black text-slate-900">
                Tamper-Evident Records
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Blockchain records can provide an additional layer of
                traceability.
              </p>
            </div>

          </div>
        </section>

        {/* ========================= */}
        {/* HOW IT WORKS */}
        {/* ========================= */}

        <section className="mt-8">

          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
              Simple verification
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              From hive to your hands
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">

            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-amber-600">
                01
              </div>

              <div className="mt-3 text-2xl">
                🐝
              </div>

              <h3 className="mt-3 font-black">
                Hive
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Honey begins its journey in a monitored hive.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-amber-600">
                02
              </div>

              <div className="mt-3 text-2xl">
                🍯
              </div>

              <h3 className="mt-3 font-black">
                Harvest
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Production information is recorded against a honey batch.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-amber-600">
                03
              </div>

              <div className="mt-3 text-2xl">
                📦
              </div>

              <h3 className="mt-3 font-black">
                Batch
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                A registered batch connects the important traceability
                records.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-amber-600">
                04
              </div>

              <div className="mt-3 text-2xl">
                📱
              </div>

              <h3 className="mt-3 font-black">
                Verify
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Consumers can inspect the registered journey using
                traceability tools.
              </p>
            </div>

          </div>
        </section>

        {/* ========================= */}
        {/* FOOTER MESSAGE */}
        {/* ========================= */}

        <section className="mt-8 rounded-3xl bg-gradient-to-r from-[#ead7a7] to-[#f7f1df] p-6 sm:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">
                The MadhuSathya promise
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#24180d]">
                Truth behind every drop.
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-[#24180d]/60">
                Explore the recorded journey and make every honey purchase
                with greater confidence.
              </p>
            </div>

            <button
              onClick={handleTraceability}
              className="shrink-0 rounded-xl bg-[#24180d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#392515]"
            >
              Open Traceability →
            </button>

          </div>
        </section>

      </div>
    </div>
  );
}