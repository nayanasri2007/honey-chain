import React, { useEffect, useMemo, useState } from "react";
import {
  Cpu,
  RefreshCw,
  Thermometer,
  Droplets,
  Scale,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Play,
  Box,
  ShieldCheck,
  Hexagon,
  Radio,
  TrendingUp,
  Clock3,
  Activity,
  MapPin,
  Gauge,
  Wifi,
  Database,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { api } from "../services/api";

export default function IoTPage() {
  const [hives, setHives] = useState([]);
  const [selectedHiveId, setSelectedHiveId] = useState("");
  const [overview, setOverview] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // LOAD HIVES + IOT OVERVIEW
  // ============================================================

  const fetchOverviewAndHives = async () => {
  try {
    setLoading(true);
    setError(null);

    const [hivesData, overviewData] = await Promise.all([
      api.getHives(),
      api.getIoTOverview(),
    ]);

    setHives(hivesData);
    setOverview(overviewData);

    // Prefer the MadhuSathya dataset hives (HV-2026-001 to HV-2026-006)
    // instead of the old test hives.
    const datasetHives = hivesData.filter((hive) =>
      /^HV-2026-00[1-6]$/.test(hive.hive_code)
    );

    if (datasetHives.length > 0 && !selectedHiveId) {
      setSelectedHiveId(String(datasetHives[0].id));
    } else if (hivesData.length > 0 && !selectedHiveId) {
      setSelectedHiveId(String(hivesData[0].id));
    }
  } catch (err) {
    setError(err.message || "Failed to load IoT telemetry.");
  } finally {
    setLoading(false);
  }
};

  // ============================================================
  // LOAD SELECTED HIVE TELEMETRY
  // ============================================================

  const fetchHiveTelemetry = async (hiveId) => {
  if (!hiveId) return;

  setError(null);

  try {
    const latest = await api.getLatestReading(Number(hiveId));
    setLatestReading(latest);
  } catch (err) {
    console.error("Error fetching latest hive telemetry:", err);
    setLatestReading(null);
  }

  try {
    const historyData = await api.getReadingHistory(
      Number(hiveId),
      100
    );

    setHistory(historyData || []);
  } catch (err) {
    console.error("Error fetching hive telemetry history:", err);
    setHistory([]);
  }
};

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchOverviewAndHives();
  }, []);

  // ============================================================
  // HIVE CHANGE
  // ============================================================

  useEffect(() => {
    if (selectedHiveId) {
      fetchHiveTelemetry(selectedHiveId);
    }
  }, [selectedHiveId]);

  // ============================================================
  // SIMULATE SENSOR READING
  // ============================================================

  const handleSimulate = async () => {
    if (!selectedHiveId) return;

    try {
      setSimulating(true);
      setError(null);

      await api.simulateReading(Number(selectedHiveId));

      await Promise.all([
        fetchHiveTelemetry(selectedHiveId),
        api.getIoTOverview().then(setOverview),
      ]);
    } catch (err) {
      setError(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  // ============================================================
  // REFRESH EVERYTHING
  // ============================================================

  const handleRefresh = async () => {
    await fetchOverviewAndHives();

    if (selectedHiveId) {
      await fetchHiveTelemetry(selectedHiveId);
    }
  };

  // ============================================================
  // CURRENT HIVE
  // ============================================================

  const currentHive = useMemo(
    () =>
      hives.find(
        (hive) => Number(hive.id) === Number(selectedHiveId)
      ),
    [hives, selectedHiveId]
  );

  // ============================================================
  // CHART DATA
  // ============================================================

  const chartData = useMemo(() => {
    return history.map((item) => {
      const date = new Date(item.timestamp);

      return {
        ...item,
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
    });
  }, [history]);

  return (
    <div className="min-h-full bg-[#f8f4ea] text-slate-800">

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-7">

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-[#102a43] shadow-xl">

          <div className="absolute -right-24 -top-28 w-96 h-96 rounded-full border-[55px] border-amber-400/10" />

          <div className="absolute -left-20 -bottom-36 w-80 h-80 rounded-full border-[45px] border-amber-300/5" />

          <div className="absolute right-32 bottom-0 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative p-7 md:p-9">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

              <div className="max-w-3xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-300/20 text-amber-300 text-[11px] font-bold uppercase tracking-[0.16em]">
                  <Radio className="w-3.5 h-3.5" />
                  IoT Telemetry System
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white">
                  Smart Hive Monitoring
                </h1>

                <p className="mt-3 text-sm md:text-base leading-7 text-slate-300 max-w-2xl">
                  Monitor temperature, humidity, hive weight and
                  colony activity through connected sensor telemetry
                  and historical trend analytics.
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6">

                  <TelemetryFeature
                    icon={<Thermometer className="w-4 h-4" />}
                    text="Temperature"
                  />

                  <TelemetryFeature
                    icon={<Droplets className="w-4 h-4" />}
                    text="Humidity"
                  />

                  <TelemetryFeature
                    icon={<Scale className="w-4 h-4" />}
                    text="Hive Weight"
                  />

                  <TelemetryFeature
                    icon={<Zap className="w-4 h-4" />}
                    text="Bee Activity"
                  />

                </div>

              </div>

              <div className="shrink-0">

                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 min-w-[220px]">

                  <div className="flex items-center gap-3">

                    <div className="relative">

                      <span className="block w-3 h-3 rounded-full bg-emerald-400" />

                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />

                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">
                        Simulator Engine Active
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Live telemetry generation
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">

            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />

            <div>
              <p className="font-bold">
                Telemetry Error
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ======================================================
            OVERVIEW METRICS
        ====================================================== */}

        {overview && (
          <section>

            <div className="flex items-end justify-between mb-4">

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                  Network Overview
                </p>

                <h2 className="text-xl font-black text-[#102a43] mt-1">
                  Hive Monitoring Network
                </h2>
              </div>

              <div className="hidden sm:flex items-center gap-3">

  <div className="flex items-center gap-2 text-xs text-slate-500">
    <Wifi className="w-4 h-4 text-emerald-600" />
    Sensor network online
  </div>

  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
    <Cpu className="w-3.5 h-3.5" />
    Simulator Active
  </div>

</div>

            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

              <MetricSummary
                label="Total Hives"
                value={overview.total_hives}
                description="Registered colonies"
                icon={<Box className="w-5 h-5" />}
              />

              <MetricSummary
                label="Monitored"
                value={overview.monitored_hives}
                description="Receiving telemetry"
                icon={<Radio className="w-5 h-5" />}
                iconClass="text-emerald-600"
                iconBg="bg-emerald-50"
              />

              <MetricSummary
                label="Warnings"
                value={overview.hives_with_warnings}
                description="Need attention"
                icon={<AlertTriangle className="w-5 h-5" />}
                iconClass="text-amber-600"
                iconBg="bg-amber-50"
              />

              <MetricSummary
                label="Avg Temperature"
                value={`${overview.average_temperature}°C`}
                description="Across monitored hives"
                icon={<Thermometer className="w-5 h-5" />}
                iconClass="text-orange-600"
                iconBg="bg-orange-50"
              />

              <MetricSummary
                label="Avg Humidity"
                value={`${overview.average_humidity}%`}
                description="Across monitored hives"
                icon={<Droplets className="w-5 h-5" />}
                iconClass="text-blue-600"
                iconBg="bg-blue-50"
              />

            </div>

          </section>
        )}

        {/* ======================================================
            MONITORING CONTROL
        ====================================================== */}

        <section className="bg-white rounded-3xl border border-amber-100 shadow-sm p-5 md:p-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-amber-700" />
              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                  Monitoring Target
                </p>

                <h2 className="text-lg font-black text-[#102a43]">
                  Select Hive
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Choose the colony whose telemetry you want to monitor.
                </p>

              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <select
                value={selectedHiveId}
                onChange={(event) =>
                  setSelectedHiveId(event.target.value)
                }
                className="bg-[#faf8f2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-semibold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 w-full sm:w-[330px]"
              >
                {hives.length === 0 ? (
                  <option value="">
                    No Hives Available
                  </option>
                ) : (
                  hives.map((hive) => (
                    <option
                      key={hive.id}
                      value={hive.id}
                    >
                      {hive.hive_code} — {hive.bee_species}
                    </option>
                  ))
                )}
              </select>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    fetchHiveTelemetry(selectedHiveId)
                  }
                  disabled={!selectedHiveId || loading}
                  className="w-12 h-12 rounded-xl border border-slate-200 bg-[#faf8f2] hover:bg-amber-50 hover:text-amber-700 text-slate-500 flex items-center justify-center transition-all disabled:opacity-50"
                  title="Refresh Telemetry"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                </button>

                <button
                  onClick={handleSimulate}
                  disabled={simulating || !selectedHiveId}
                  className="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-[#102a43] hover:bg-[#163b5c] text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  <Play className="w-4 h-4 text-amber-300 fill-amber-300" />

                  {simulating
                    ? "Generating..."
                    : "Simulate Reading"}
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            CURRENT HIVE
        ====================================================== */}

        {currentHive && (
          <section className="bg-white rounded-3xl border border-amber-100 shadow-sm p-5 md:p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-13 h-13 rounded-2xl bg-[#102a43] flex items-center justify-center">
                  <Hexagon className="w-6 h-6 text-amber-300" />
                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                    Currently Monitoring
                  </p>

                  <h2 className="text-xl font-black text-[#102a43] mt-1">
                    {currentHive.hive_code}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 mt-1">

                    <span className="text-xs text-slate-500">
                      {currentHive.bee_species}
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {currentHive.location}
                    </span>

                  </div>

                </div>

              </div>

              <div className="inline-flex items-center gap-2 self-start md:self-center px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">

                <span className="relative flex w-2.5 h-2.5">

                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-50 animate-ping" />

                  <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500" />

                </span>

                Telemetry Connected

              </div>

            </div>

          </section>
        )}

        {/* ======================================================
            LIVE SENSOR FEED
        ====================================================== */}

        {latestReading ? (

          <div className="space-y-7">

            <section>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                    Live Sensor Feed
                  </p>

                  <h2 className="text-2xl font-black text-[#102a43] mt-1">
                    Current Hive Conditions
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Historical and latest telemetry from the selected colony.
                  </p>

                </div>

                <div className="inline-flex items-center gap-2 self-start px-3 py-2 rounded-full bg-white border border-amber-100 text-xs text-slate-500">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live reading
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                <SensorCard
                  title="Internal Temperature"
                  value={latestReading.temperature}
                  unit="°C"
                  status={latestReading.temperature_status}
                  icon={<Thermometer className="w-5 h-5" />}
                  iconClass="text-orange-600"
                  iconBg="bg-orange-50"
                  borderClass="border-t-orange-400"
                  note="Normal range: 32°C – 36°C"
                />

                <SensorCard
                  title="Internal Humidity"
                  value={latestReading.humidity}
                  unit="%"
                  status={latestReading.humidity_status}
                  icon={<Droplets className="w-5 h-5" />}
                  iconClass="text-blue-600"
                  iconBg="bg-blue-50"
                  borderClass="border-t-blue-400"
                  note="Normal range: 55% – 75%"
                />

                <SensorCard
                  title="Total Hive Weight"
                  value={latestReading.weight}
                  unit="kg"
                  status={latestReading.weight_status}
                  icon={<Scale className="w-5 h-5" />}
                  iconClass="text-amber-700"
                  iconBg="bg-amber-50"
                  borderClass="border-t-amber-400"
                  note="Tracks colony and honey mass"
                />

                <SensorCard
                  title="Bee Colony Activity"
                  value={latestReading.bee_activity}
                  unit="%"
                  status={latestReading.bee_activity_status}
                  icon={<Zap className="w-5 h-5" />}
                  iconClass="text-emerald-600"
                  iconBg="bg-emerald-50"
                  borderClass="border-t-emerald-400"
                  note="Higher activity indicates healthy movement"
                />

              </div>

            </section>

            {/* ==================================================
                SENSOR PAYLOAD
            ================================================== */}

            <section className="rounded-3xl bg-[#102a43] p-5 md:p-6 text-white relative overflow-hidden">

              <div className="absolute -right-16 -top-20 w-60 h-60 rounded-full bg-amber-400/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-amber-300" />
                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400">
                      Sensor Payload
                    </p>

                    <p className="text-sm font-black mt-1">
                      Reading #{latestReading.id}
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">

  <div className="flex items-center gap-2 text-slate-300">

    <Clock3 className="w-4 h-4 text-amber-300" />

    <span>
      Last update:
    </span>

    <span className="font-bold text-white">
      {new Date(
        latestReading.timestamp
      ).toLocaleString("en-IN")}
    </span>

  </div>

  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">

    <Database className="w-3.5 h-3.5 text-emerald-300" />

    <span className="font-bold text-emerald-300">
      Prototype Telemetry
    </span>

  </div>

</div>

              </div>

            </section>

            {/* ==================================================
                ANALYTICS
            ================================================== */}

            <section>

              <div className="mb-5">

                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                  Historical Analytics
                </p>

                <h2 className="text-2xl font-black text-[#102a43] mt-1">
                  Sensor Trends
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  7-day historical telemetry from the MadhuSathya prototype dataset.
                </p>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* TEMPERATURE */}

                <ChartCard
                  title="Temperature History"
                  unit="°C"
                  icon={<Thermometer className="w-4 h-4" />}
                  iconClass="text-orange-600"
                >

                  <ResponsiveContainer width="100%" height="100%">

                    <AreaChart data={chartData}>

                      <defs>
                        <linearGradient
                          id="temperatureHoneyGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.3}
                          />

                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e9e0cf"
                      />

                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <YAxis
                        domain={[25, 40]}
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fffdf8",
                          borderColor: "#e4dbc9",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#d97706"
                        strokeWidth={2.5}
                        fill="url(#temperatureHoneyGradient)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </ChartCard>

                {/* HUMIDITY */}

                <ChartCard
                  title="Humidity History"
                  unit="%"
                  icon={<Droplets className="w-4 h-4" />}
                  iconClass="text-blue-600"
                >

                  <ResponsiveContainer width="100%" height="100%">

                    <AreaChart data={chartData}>

                      <defs>
                        <linearGradient
                          id="humidityHoneyGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.25}
                          />

                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e9e0cf"
                      />

                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <YAxis
                        domain={[40, 90]}
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fffdf8",
                          borderColor: "#e4dbc9",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="humidity"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fill="url(#humidityHoneyGradient)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </ChartCard>

                {/* WEIGHT */}

                <ChartCard
                  title="Hive Weight History"
                  unit="kg"
                  icon={<Scale className="w-4 h-4" />}
                  iconClass="text-amber-700"
                >

                  <ResponsiveContainer width="100%" height="100%">

                    <LineChart data={chartData}>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e9e0cf"
                      />

                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <YAxis
                        domain={[
                          "dataMin - 2",
                          "dataMax + 2",
                        ]}
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fffdf8",
                          borderColor: "#e4dbc9",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#d97706"
                        strokeWidth={2.5}
                        dot={{
                          r: 3,
                          fill: "#d97706",
                        }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </ChartCard>

                {/* ACTIVITY */}

                <ChartCard
                  title="Bee Activity History"
                  unit="%"
                  icon={<Zap className="w-4 h-4" />}
                  iconClass="text-emerald-600"
                >

                  <ResponsiveContainer width="100%" height="100%">

                    <AreaChart data={chartData}>

                      <defs>
                        <linearGradient
                          id="activityHoneyGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.25}
                          />

                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e9e0cf"
                      />

                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <YAxis
                        domain={[30, 100]}
                        stroke="#94a3b8"
                        fontSize={10}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fffdf8",
                          borderColor: "#e4dbc9",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="bee_activity"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fill="url(#activityHoneyGradient)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </ChartCard>

              </div>

            </section>

          </div>

        ) : (

          <NoTelemetryState
            selectedHiveId={selectedHiveId}
            simulating={simulating}
            onSimulate={handleSimulate}
          />

        )}

        {/* ======================================================
            INTELLIGENCE PIPELINE
        ====================================================== */}

        <section className="bg-white border border-amber-100 rounded-3xl shadow-sm p-5 md:p-7">

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5 text-amber-700" />
            </div>

            <div>

              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                Honey Chain Intelligence
              </p>

              <h2 className="text-xl font-black text-[#102a43] mt-1">
                From Sensors to AI Decisions
              </h2>

              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                IoT telemetry forms the foundation for the project's
                hive-health monitoring, productivity prediction and
                early-warning capabilities.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
<PipelineCard
  icon={Thermometer}
  number="01"
  title="Sense"
  text="Capture temperature, humidity, hive weight and bee activity from connected hive sensors."
/>

<PipelineCard
  icon={Database}
  number="02"
  title="Store"
  text="Store timestamped telemetry for every hive to build a continuous monitoring history."
/>

<PipelineCard
  icon={Activity}
  number="03"
  title="Analyze"
  text="Analyze sensor patterns with Honey Chain AI for hive health and productivity insights."
/>

<PipelineCard
  icon={ShieldCheck}
  number="04"
  title="Alert"
  text="Detect abnormal hive conditions and generate early warnings for beekeeper action."
/>
            

            

          </div>

        </section>

        {/* ======================================================
            SYSTEM INFORMATION
        ====================================================== */}

        <section className="rounded-3xl bg-[#102a43] p-6 md:p-7 text-white relative overflow-hidden">

          <div className="absolute -right-16 -top-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.15em]">
                <ShieldCheck className="w-4 h-4" />
                Honey Chain IoT Layer
              </div>

              <h3 className="text-lg font-black mt-2">
                Connected hive intelligence
              </h3>

              <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-5">
                Sensor telemetry provides the data foundation for
                Honey Chain's AI health analysis, productivity
                prediction and early-warning system.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <SystemPill text="Temperature" />
              <SystemPill text="Humidity" />
              <SystemPill text="Weight" />
              <SystemPill text="Activity" />

            </div>

          </div>

        </section>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="pt-2 pb-4 text-center">

          <p className="text-xs font-bold text-slate-500">
            HONEY CHAIN • SMART BEEKEEPING & IOT TELEMETRY
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            Connected hive monitoring prototype • SIH 2026
          </p>

        </footer>

      </div>

    </div>
  );
}

/* ==============================================================
   TELEMETRY FEATURE
============================================================== */

function TelemetryFeature({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className="text-amber-300">
        {icon}
      </span>

      <span>{text}</span>
    </div>
  );
}

/* ==============================================================
   SUMMARY CARD
============================================================== */

function MetricSummary({
  label,
  value,
  description,
  icon,
  iconClass = "text-amber-700",
  iconBg = "bg-amber-50",
}) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md transition-all">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400">
            {label}
          </p>

          <p className="text-2xl font-black text-[#102a43] mt-2">
            {value}
          </p>

          <p className="text-[11px] text-slate-500 mt-1">
            {description}
          </p>

        </div>

        <div
          className={`w-10 h-10 rounded-xl ${iconBg} ${iconClass} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* ==============================================================
   SENSOR CARD
============================================================== */

function SensorCard({
  title,
  value,
  unit,
  status,
  icon,
  iconClass,
  iconBg,
  borderClass,
  note,
}) {
  return (
    <div
      className={`bg-white rounded-3xl border border-amber-100 border-t-4 ${borderClass} p-6 shadow-sm hover:shadow-lg transition-all`}
    >

      <div className="flex items-center justify-between gap-3">

        <div
          className={`w-11 h-11 rounded-2xl ${iconBg} ${iconClass} flex items-center justify-center`}
        >
          {icon}
        </div>

        {renderStatusBadge(status)}

      </div>

      <div className="mt-6">

        <p className="text-[10px] uppercase tracking-[0.13em] font-bold text-slate-400">
          {title}
        </p>

        <div className="flex items-baseline gap-1 mt-1">

          <span className="text-4xl font-black text-[#102a43]">
            {value}
          </span>

          <span className={`text-lg font-black ${iconClass}`}>
            {unit}
          </span>

        </div>

        <p className="text-[11px] text-slate-500 mt-2 leading-5">
          {note}
        </p>

      </div>

    </div>
  );
}

/* ==============================================================
   STATUS BADGE
============================================================== */

function renderStatusBadge(statusText) {
  let styles =
    "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (
    statusText === "Warning" ||
    statusText === "Reduced"
  ) {
    styles =
      "bg-amber-50 text-amber-700 border-amber-200";
  } else if (
    statusText === "Critical" ||
    statusText === "Very Low"
  ) {
    styles =
      "bg-rose-50 text-rose-700 border-rose-200";
  } else if (statusText === "Increasing") {
    styles =
      "bg-blue-50 text-blue-700 border-blue-200";
  } else if (statusText === "Decreasing") {
    styles =
      "bg-orange-50 text-orange-700 border-orange-200";
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles}`}
    >
      {statusText || "Unknown"}
    </span>
  );
}

/* ==============================================================
   CHART CARD
============================================================== */

function ChartCard({
  title,
  unit,
  icon,
  iconClass,
  children,
}) {
  return (
    <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-5 md:p-6">

      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-3">

          <div
            className={`w-9 h-9 rounded-xl bg-[#faf8f2] ${iconClass} flex items-center justify-center`}
          >
            {icon}
          </div>

          <div>

            <h3 className="text-sm font-black text-[#102a43]">
              {title}
            </h3>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Recent telemetry • {unit}
            </p>

          </div>

        </div>

        <TrendingUp className="w-4 h-4 text-slate-300" />

      </div>

      <div className="h-64 w-full">
        {children}
      </div>

    </div>
  );
}

/* ==============================================================
   NO TELEMETRY
============================================================== */

function NoTelemetryState({
  selectedHiveId,
  simulating,
  onSimulate,
}) {
  return (
    <div className="bg-white rounded-3xl border border-amber-100 p-12 md:p-16 text-center shadow-sm">

      <div className="w-16 h-16 rounded-2xl bg-amber-100 mx-auto flex items-center justify-center">
        <Cpu className="w-8 h-8 text-amber-700" />
      </div>

      <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700 mt-6">
        Sensor Feed
      </p>

      <h3 className="text-2xl font-black text-[#102a43] mt-2">
        No Telemetry Recorded
      </h3>

      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-6">
        Hive #{selectedHiveId || "—"} does not have a sensor
        reading yet. Generate a simulated reading to start the
        monitoring feed.
      </p>

      <button
        onClick={onSimulate}
        disabled={simulating || !selectedHiveId}
        className="mt-6 inline-flex items-center gap-2 bg-[#102a43] text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md hover:bg-[#163b5c] disabled:opacity-50 transition-all"
      >
        <Play className="w-4 h-4 text-amber-300 fill-amber-300" />

        {simulating
          ? "Generating..."
          : "Generate First Reading"}
      </button>

    </div>
  );
}

/* ==============================================================
   PIPELINE CARD
============================================================== */

function PipelineCard({
  icon: Icon,
  number,
  title,
  text,
}) {
  return (
    <div className="bg-[#faf8f2] border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-amber-700" />
        </div>

        <span className="text-[11px] font-black text-amber-600">
          {number}
        </span>

      </div>

      <h3 className="font-black text-[#102a43] mt-4">
        {title}
      </h3>

      <p className="text-xs text-slate-500 leading-5 mt-2">
        {text}
      </p>

    </div>
  );
}

/* ==============================================================
   SYSTEM PILL
============================================================== */

function SystemPill({ text }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">

      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

      <span className="text-[10px] font-semibold text-slate-300">
        {text}
      </span>

    </div>
  );
}