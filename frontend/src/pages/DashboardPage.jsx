import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Blocks,
  CheckCircle2,
  Cpu,
  Database,
  Droplets,
  ExternalLink,
  Hexagon,
  Home,
  Leaf,
  Package,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      const response = await fetch(
        `${API_BASE}/dashboards/overview`
      );

      if (!response.ok) {
        throw new Error("Unable to load dashboard data");
      }

      const data = await response.json();

      setStats(data);
      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to connect to the dashboard service.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      label: "Beekeepers",
      value: stats?.beekeepers ?? 0,
      description: "Registered producers",
      icon: Users,
      accent: "amber",
    },
    {
      label: "Hives",
      value: stats?.hives ?? 0,
      description: "Managed colonies",
      icon: Hexagon,
      accent: "green",
    },
    {
      label: "IoT Readings",
      value: stats?.sensor_readings ?? 0,
      description: "Sensor observations",
      icon: Cpu,
      accent: "blue",
    },
    {
      label: "AI Health Analyses",
      value: stats?.health_analyses ?? 0,
      description: "Hive health checks",
      icon: Activity,
      accent: "purple",
    },
    {
      label: "Productivity Predictions",
      value: stats?.productivity_predictions ?? 0,
      description: "AI predictions",
      icon: Sparkles,
      accent: "orange",
    },
    {
      label: "Honey Quality Analyses",
      value: stats?.honey_quality_analyses ?? 0,
      description: "Quality assessments",
      icon: Droplets,
      accent: "yellow",
    },
    {
      label: "Honey Batches",
      value: stats?.honey_batches ?? 0,
      description: "Traceable batches",
      icon: Package,
      accent: "rose",
    },
    {
      label: "Blockchain Records",
      value: stats?.blockchain_records ?? 0,
      description: "Tamper-evident records",
      icon: Blocks,
      accent: "indigo",
    },
    {
      label: "QR Codes",
      value: stats?.qr_codes ?? 0,
      description: "Consumer verification",
      icon: QrCode,
      accent: "teal",
    },
  ];

  const chartData = [
    {
      name: "Beekeepers",
      value: stats?.beekeepers ?? 0,
    },
    {
      name: "Hives",
      value: stats?.hives ?? 0,
    },
    {
      name: "IoT",
      value: stats?.sensor_readings ?? 0,
    },
    {
      name: "AI Health",
      value: stats?.health_analyses ?? 0,
    },
    {
      name: "Productivity",
      value: stats?.productivity_predictions ?? 0,
    },
    {
      name: "Quality",
      value: stats?.honey_quality_analyses ?? 0,
    },
    {
      name: "Batches",
      value: stats?.honey_batches ?? 0,
    },
    {
      name: "Blockchain",
      value: stats?.blockchain_records ?? 0,
    },
    {
      name: "QR",
      value: stats?.qr_codes ?? 0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f1df] text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#24180d] via-[#3b2410] to-[#6b4215]" />

        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[60px] border-amber-300/20" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full border-[50px] border-yellow-300/10" />
        </div>

        <div className="relative max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            {/* LEFT */}
            <div className="text-white">
              {/* BRAND TAGLINE */}
              <div className="mb-5">
                <p className="text-amber-300 text-xs md:text-sm font-extrabold tracking-[0.28em] uppercase">
                  Truth behind every drop
                </p>
              </div>

              {/* BADGE */}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-5">
                <ShieldCheck className="w-4 h-4 text-amber-300" />

                <span className="text-xs font-bold tracking-wide text-amber-100">
                  MadhuSathya • SIH 2026
                </span>
              </div>

              {/* TITLE */}
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                From Healthy Hives
                <span className="block text-amber-300">
                  to Trusted Honey.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg text-amber-50/80 leading-relaxed">
                MadhuSathya connects smart beekeeping, IoT monitoring,
                AI-powered insights, blockchain traceability and QR-based
                consumer verification into one intelligent honey ecosystem.
              </p>

              {/* FEATURE PILLS */}
              <div className="flex flex-wrap gap-2 mt-7">
                <FeaturePill
                  icon={Cpu}
                  text="IoT Monitoring"
                />

                <FeaturePill
                  icon={Sparkles}
                  text="AI Analytics"
                />

                <FeaturePill
                  icon={Blocks}
                  text="Blockchain"
                />

                <FeaturePill
                  icon={QrCode}
                  text="QR Verification"
                />
              </div>

              {/* BRAND */}
              <div className="mt-8 flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-xl flex items-center justify-center">
                  <img
                    src="/images/madhusathya-logo.png"
                    alt="MadhuSathya"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    MadhuSathya
                  </h2>

                  <p className="text-sm text-amber-300 font-semibold">
                    Truth behind every drop
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">
              <div className="absolute -inset-4 bg-amber-300/10 rounded-[2rem] blur-2xl" />

              <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl">
                <img
                  src="/images/beekeeper.jpg"
                  alt="Beekeeper working with honey bees"
                  className="w-full h-[340px] lg:h-[430px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute left-5 right-5 bottom-5">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-slate-950" />
                      </div>

                      <div>
                        <p className="text-white font-bold">
                          Smart Beekeeping Ecosystem
                        </p>

                        <p className="text-white/65 text-xs mt-1">
                          Better insights • Better traceability • Better trust
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VISUAL FEATURE CARDS
      ====================================================== */}
      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 py-10">
        <div className="grid md:grid-cols-3 gap-5">
          <VisualCard
            image="/images/beekeeper-team.jpg"
            icon={Users}
            title="Empowering Beekeepers"
            text="Manage producers, apiaries and hive information from one platform."
          />

          <VisualCard
            image="/images/bees-honeycomb.jpg"
            icon={Hexagon}
            title="Healthy Hives"
            text="Monitor hive conditions using IoT telemetry and AI-based health analysis."
          />

          <VisualCard
            image="/images/honey-jar.jpg"
            icon={Droplets}
            title="Trusted Honey"
            text="Track honey batches from harvest to consumer through blockchain and QR verification."
          />
        </div>
      </section>

      {/* =====================================================
          DASHBOARD HEADER
      ====================================================== */}
      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />

              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-amber-700">
                Live System Overview
              </p>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              MadhuSathya Dashboard
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Real-time overview of the smart beekeeping and honey
              traceability platform.
            </p>
          </div>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#24180d] text-white text-sm font-bold hover:bg-[#3a2512] transition disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <section className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 mt-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />

            <div>
              <p className="font-bold text-red-800">
                Dashboard connection issue
              </p>

              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          METRICS
      ====================================================== */}
      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 py-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {metricCards.map((card) => (
            <MetricCard
              key={card.label}
              {...card}
              loading={loading}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          ANALYTICS
      ====================================================== */}
      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 pb-10">
        <div className="grid xl:grid-cols-[1.4fr_0.6fr] gap-6">
          {/* CHART */}
          <div className="rounded-3xl bg-white border border-amber-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] uppercase text-amber-700">
                  Platform Activity
                </p>

                <h3 className="text-xl font-black text-slate-900 mt-1">
                  System Data Overview
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live API Data
              </div>
            </div>

            <div className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="activityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#d97706"
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="95%"
                          stopColor="#d97706"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#eadfca"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid #eadfca",
                        boxShadow:
                          "0 10px 30px rgba(0,0,0,0.08)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#d97706"
                      strokeWidth={3}
                      fill="url(#activityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div className="rounded-3xl bg-[#24180d] text-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center">
                <Database className="w-5 h-5 text-slate-950" />
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.16em] uppercase text-amber-300">
                  Infrastructure
                </p>

                <h3 className="text-xl font-black mt-1">
                  System Status
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <StatusRow
                label="Backend API"
                status="Online"
              />

              <StatusRow
                label="Database"
                status="Healthy"
              />

              <StatusRow
                label="IoT Monitoring"
                status="Active"
              />

              <StatusRow
                label="AI Analytics"
                status="Available"
              />

              <StatusRow
                label="Blockchain Ledger"
                status="Verified"
              />

              <StatusRow
                label="QR Verification"
                status="Ready"
              />
            </div>

            <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-bold">
                    MadhuSathya is operational
                  </p>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Dashboard data automatically refreshes every
                    10 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FROM HIVE TO CONSUMER
      ====================================================== */}
      <section className="bg-white border-y border-amber-100">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 py-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-amber-700">
              End-to-End Traceability
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
              From Hive to Consumer
            </h2>

            <p className="text-sm md:text-base text-slate-500 mt-3">
              Every important step is connected to create a transparent
              honey journey.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <ProcessStep
              number="01"
              icon={Users}
              title="Beekeeper"
              text="Producer registration"
            />

            <ProcessStep
              number="02"
              icon={Hexagon}
              title="Hive"
              text="Smart hive monitoring"
            />

            <ProcessStep
              number="03"
              icon={Droplets}
              title="Honey Batch"
              text="Harvest and quality"
            />

            <ProcessStep
              number="04"
              icon={Blocks}
              title="Blockchain"
              text="Tamper-evident history"
            />

            <ProcessStep
              number="05"
              icon={QrCode}
              title="Consumer"
              text="QR verification"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          INTELLIGENCE PIPELINE
      ====================================================== */}
      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-[#fffaf0] to-[#f5ead0] border border-amber-200 p-6 md:p-8">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2">
                <Sparkles className="w-4 h-4 text-amber-700" />

                <span className="text-xs font-bold text-amber-800">
                  Intelligent Honey Ecosystem
                </span>
              </div>

              <h2 className="text-3xl font-black mt-4 text-slate-900">
                Data becomes actionable insight.
              </h2>

              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                MadhuSathya combines field data, IoT telemetry,
                AI-assisted analysis and blockchain traceability to
                help beekeepers make better decisions and help consumers
                understand where their honey came from.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <PipelineCard
                icon={Cpu}
                title="Collect"
                text="Temperature, humidity, weight and bee activity."
              />

              <PipelineCard
                icon={Sparkles}
                title="Analyze"
                text="Hive health, productivity and honey quality insights."
              />

              <PipelineCard
                icon={Blocks}
                title="Record"
                text="Honey-batch events linked through cryptographic hashes."
              />

              <PipelineCard
                icon={QrCode}
                title="Verify"
                text="Consumers scan a unique QR code to view provenance."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SIH SECTION
      ====================================================== */}
      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#24180d] text-white p-7 md:p-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-amber-400" />

                <span className="text-xs font-extrabold tracking-[0.2em] uppercase text-amber-300">
                  Smart India Hackathon 2026
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black">
                MadhuSathya
              </h2>

              <p className="text-amber-300 font-semibold mt-2">
                Truth behind every drop
              </p>

              <p className="text-slate-400 text-sm max-w-2xl mt-4 leading-relaxed">
                AI + IoT + Blockchain + QR-powered smart beekeeping
                and honey traceability platform designed to improve
                rural beekeeper productivity and consumer trust.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <InfoBadge
                label="Project"
                value="MadhuSathya"
              />

              <InfoBadge
                label="Platform"
                value="Smart Honey Ecosystem"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER BRAND
      ====================================================== */}
      <section className="border-t border-amber-200 bg-[#f0e6cd]">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-sm">
                <img
                  src="/images/madhusathya-logo.png"
                  alt="MadhuSathya"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h3 className="font-black text-lg text-slate-900">
                  MadhuSathya
                </h3>

                <p className="text-sm text-amber-700 font-semibold">
                  Truth behind every drop
                </p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500">
                Smart India Hackathon 2026
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Smart Beekeeping • Honey Traceability • Consumer Trust
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   FEATURE PILL
============================================================ */

function FeaturePill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10">
      <Icon className="w-4 h-4 text-amber-300" />

      <span className="text-xs font-semibold text-white/90">
        {text}
      </span>
    </div>
  );
}

/* ============================================================
   VISUAL CARD
============================================================ */

function VisualCard({
  image,
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border border-amber-100 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute bottom-4 left-4">
          <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg">
            <Icon className="w-5 h-5 text-slate-950" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-black text-lg text-slate-900">
          {title}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed mt-2">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent,
  loading,
}) {
  const accentClasses = {
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    yellow: "bg-yellow-100 text-yellow-700",
    rose: "bg-rose-100 text-rose-700",
    indigo: "bg-indigo-100 text-indigo-700",
    teal: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="group rounded-3xl bg-white border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-300 p-5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            accentClasses[accent] || accentClasses.amber
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 opacity-70" />
      </div>

      <div className="mt-5">
        <p className="text-sm font-bold text-slate-600">
          {label}
        </p>

        {loading ? (
          <div className="h-10 w-20 bg-slate-100 rounded-lg animate-pulse mt-1" />
        ) : (
          <p className="text-3xl font-black text-slate-900 mt-1">
            {value}
          </p>
        )}

        <p className="text-xs text-slate-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS ROW
============================================================ */

function StatusRow({ label, status }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />

        <span className="text-sm font-semibold text-slate-200">
          {label}
        </span>
      </div>

      <span className="text-xs font-bold text-emerald-300">
        {status}
      </span>
    </div>
  );
}

/* ============================================================
   PROCESS STEP
============================================================ */

function ProcessStep({
  number,
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="relative rounded-2xl border border-amber-100 bg-[#fffaf0] p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-black text-amber-600">
          {number}
        </span>

        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-amber-700" />
        </div>
      </div>

      <h3 className="font-black text-slate-900">
        {title}
      </h3>

      <p className="text-xs text-slate-500 mt-1">
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   PIPELINE CARD
============================================================ */

function PipelineCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl bg-white border border-amber-100 p-5">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-700" />
      </div>

      <h3 className="font-black text-slate-900 mt-4">
        {title}
      </h3>

      <p className="text-xs text-slate-500 leading-relaxed mt-1">
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   INFO BADGE
============================================================ */

function InfoBadge({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 min-w-[190px]">
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500">
        {label}
      </p>

      <p className="text-sm font-bold text-white mt-1">
        {value}
      </p>
    </div>
  );
}