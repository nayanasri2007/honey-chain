import { useEffect, useState } from "react";
import {
  Brain,
  RefreshCw,
  Thermometer,
  Droplets,
  Clock,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  FlaskConical,
  BarChart3,
  Database,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { api } from "../services/api";

export default function HoneyQualityPage() {
  const [hives, setHives] = useState([]);
  const [selectedHive, setSelectedHive] = useState("");

  const [temperature, setTemperature] = useState(24);
  const [moisture, setMoisture] = useState(17.5);
  const [exposureHours, setExposureHours] = useState(2);

  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DATASET HIVES
  // ============================================================

  useEffect(() => {
    loadHives();
  }, []);

  useEffect(() => {
    if (selectedHive) {
      loadQualityData(selectedHive);
    }
  }, [selectedHive]);

  async function loadHives() {
    try {
      setInitialLoading(true);
      setError("");

      const data = await api.getHives();

      // Only use the six dataset hives
      const datasetHives = data.filter((hive) =>
        /^HV-2026-00[1-6]$/.test(hive.hive_code || "")
      );

      setHives(datasetHives);

      if (datasetHives.length > 0) {
        setSelectedHive(String(datasetHives[0].id));
      } else {
        setSelectedHive("");
        setError("No dataset hives are available.");
      }
    } catch (err) {
      setError(err.message || "Failed to load hives.");
    } finally {
      setInitialLoading(false);
    }
  }

  // ============================================================
  // LOAD QUALITY DATA
  // ============================================================

  async function loadQualityData(hiveId) {
    if (!hiveId) return;

    try {
      setError("");

      const [latestResult, historyResult] = await Promise.allSettled([
        api.getLatestHoneyQuality(hiveId),
        api.getHoneyQualityHistory(hiveId),
      ]);

      // Latest analysis
      if (latestResult.status === "fulfilled") {
        const latestData = latestResult.value;

        setAnalysis(latestData);

        setTemperature(
          latestData.average_temperature ?? 24
        );

        setMoisture(
          latestData.moisture_percent ?? 17.5
        );

        setExposureHours(
          latestData.exposure_hours ?? 2
        );
      } else {
        setAnalysis(null);
      }

      // History
      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setError(
        err.message || "Failed to load honey quality data."
      );
    }
  }

  // ============================================================
  // RUN QUALITY ANALYSIS
  // ============================================================

  async function generateAnalysis() {
    if (!selectedHive) {
      setError("Please select a hive first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const tempValue = Number(temperature);
      const moistureValue = Number(moisture);
      const exposureValue = Number(exposureHours);

      if (!Number.isFinite(tempValue)) {
        throw new Error("Please enter a valid temperature.");
      }

      if (
        !Number.isFinite(moistureValue) ||
        moistureValue < 0 ||
        moistureValue > 100
      ) {
        throw new Error(
          "Moisture must be between 0% and 100%."
        );
      }

      if (
        !Number.isFinite(exposureValue) ||
        exposureValue < 0
      ) {
        throw new Error(
          "Exposure duration cannot be negative."
        );
      }

      const result = await api.analyzeHoneyQuality(
        selectedHive,
        tempValue,
        moistureValue,
        exposureValue
      );

      setAnalysis(result);

      // Refresh latest analysis + history
      await loadQualityData(selectedHive);
    } catch (err) {
      setError(
        err.message || "Honey quality analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // RISK FACTORS
  // ============================================================

  let riskFactors = [];

  if (analysis?.risk_factors) {
    try {
      const parsed = JSON.parse(analysis.risk_factors);

      if (Array.isArray(parsed)) {
        riskFactors = parsed;
      } else {
        riskFactors = [String(parsed)];
      }
    } catch {
      riskFactors = [analysis.risk_factors];
    }
  }

  // ============================================================
  // HISTORY CHART
  // ============================================================

  const historyChartData = [...history]
    .reverse()
    .map((item) => ({
      time: item.analyzed_at
        ? new Date(item.analyzed_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",

      score: Number(item.quality_score || 0),
    }));

  // ============================================================
  // QUALITY CONFIGURATION
  // ============================================================

  const qualityConfig = {
    Excellent: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      dot: "bg-emerald-500",
    },

    Good: {
      text: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      dot: "bg-green-500",
    },

    Acceptable: {
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600",
      dot: "bg-amber-500",
    },

    "At Risk": {
      text: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      dot: "bg-orange-500",
    },

    Poor: {
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      dot: "bg-red-500",
    },
  };

  // ============================================================
  // RISK CONFIGURATION
  // ============================================================

  const riskConfig = {
    Low: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      dot: "bg-emerald-500",
    },

    Medium: {
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600",
      dot: "bg-amber-500",
    },

    High: {
      text: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      dot: "bg-orange-500",
    },

    Critical: {
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      dot: "bg-red-500",
    },
  };

  const qualityStyle =
    qualityConfig[analysis?.quality_level] || {
      text: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: "text-slate-600",
      dot: "bg-slate-500",
    };

  const riskStyle =
    riskConfig[analysis?.risk_level] || {
      text: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: "text-slate-600",
      dot: "bg-slate-500",
    };

  const qualityScore = Number(
    analysis?.quality_score || 0
  );

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f7f1e3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-7 h-7 text-amber-600 animate-pulse" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            Loading honey quality dashboard
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Preparing quality analysis and storage intelligence...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f7f1e3] px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-[#172033] shadow-xl">
          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-amber-400/10" />

          <div className="absolute right-28 -bottom-28 w-64 h-64 rounded-full bg-orange-300/10" />

          <div className="relative px-6 sm:px-8 py-7 sm:py-9">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-300/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Honey Intelligence Layer
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg">
                    <FlaskConical className="w-6 h-6 text-slate-950" />
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      AI Honey Quality
                    </h1>

                    <p className="text-slate-300 text-sm mt-1">
                      Quality and storage risk assessment for every hive.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-5">

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Thermometer className="w-4 h-4 text-amber-400" />
                    Temperature analysis
                  </div>

                  <div className="w-1 h-1 rounded-full bg-slate-600" />

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Droplets className="w-4 h-4 text-amber-400" />
                    Moisture monitoring
                  </div>

                  <div className="w-1 h-1 rounded-full bg-slate-600" />

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Exposure assessment
                  </div>

                </div>
              </div>

              {/* HIVE SELECTOR */}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                <select
                  value={selectedHive}
                  onChange={(e) =>
                    setSelectedHive(e.target.value)
                  }
                  className="min-w-[190px] bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  {hives.length === 0 && (
                    <option value="">
                      No hives available
                    </option>
                  )}

                  {hives.map((hive) => (
                    <option
                      key={hive.id}
                      value={hive.id}
                      className="text-slate-900"
                    >
                      {hive.hive_code ||
                        hive.hive_number ||
                        `Hive #${hive.id}`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={generateAnalysis}
                  disabled={
                    loading || !selectedHive
                  }
                  className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  {loading
                    ? "Analyzing..."
                    : "Analyze Quality"}
                </button>

              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />

            <div>
              <p className="font-bold text-sm">
                Quality analysis error
              </p>

              <p className="text-sm mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            INPUT PARAMETERS
        ====================================================== */}

        <section className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">

                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-amber-600" />
                </div>

                <h2 className="text-lg font-black text-slate-900">
                  Quality Analysis Inputs
                </h2>

              </div>

              <p className="text-sm text-slate-500 mt-2">
                Adjust the parameters below and run the AI quality assessment.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500">
              <Database className="w-3.5 h-3.5" />
              Analysis parameters
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            <InputParameter
              icon={<Thermometer className="w-5 h-5" />}
              title="Average Temperature"
              unit="°C"
              value={temperature}
              onChange={setTemperature}
              step="0.1"
              iconClass="bg-orange-50 text-orange-600"
              description="Average honey temperature during storage."
            />

            <InputParameter
              icon={<Droplets className="w-5 h-5" />}
              title="Honey Moisture"
              unit="%"
              value={moisture}
              onChange={setMoisture}
              step="0.1"
              iconClass="bg-blue-50 text-blue-600"
              description="Moisture content of the honey sample."
            />

            <InputParameter
              icon={<Clock className="w-5 h-5" />}
              title="Temperature Exposure"
              unit="hours"
              value={exposureHours}
              onChange={setExposureHours}
              step="0.1"
              min="0"
              iconClass="bg-purple-50 text-purple-600"
              description="Duration of exposure to the recorded temperature."
            />

          </div>
        </section>

        {/* ======================================================
            NO ANALYSIS
        ====================================================== */}

        {!analysis ? (
          <section className="bg-white border border-amber-100 rounded-3xl p-10 sm:p-16 text-center shadow-sm">

            <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10 text-amber-500" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mt-6">
              No quality analysis yet
            </h2>

            <p className="text-slate-500 max-w-lg mx-auto mt-2">
              Enter the honey quality parameters above and generate an
              AI-assisted quality and storage risk assessment.
            </p>

            <button
              onClick={generateAnalysis}
              disabled={
                !selectedHive || loading
              }
              className="mt-6 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold px-5 py-3 rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              Run Quality Analysis
            </button>

          </section>
        ) : (
          <>
            {/* ==================================================
                QUALITY SUMMARY
            ================================================== */}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* SCORE */}

              <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Quality Score
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Overall assessment
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>

                </div>

                <div className="mt-5 flex items-end gap-2">

                  <span className="text-5xl font-black text-slate-900">
                    {analysis.quality_score}
                  </span>

                  <span className="text-sm font-semibold text-slate-400 mb-2">
                    / 100
                  </span>

                </div>

                <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          qualityScore,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

                <div className="flex justify-between mt-2 text-[11px] text-slate-400">
                  <span>Higher risk</span>
                  <span>Better quality</span>
                </div>

              </div>

              {/* QUALITY LEVEL */}

              <div
                className={`rounded-2xl border p-6 shadow-sm ${qualityStyle.bg} ${qualityStyle.border}`}
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Quality Level
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Current honey condition
                    </p>
                  </div>

                  <TrendingUp
                    className={`w-6 h-6 ${qualityStyle.icon}`}
                  />

                </div>

                <div
                  className={`text-3xl sm:text-4xl font-black mt-6 ${qualityStyle.text}`}
                >
                  {analysis.quality_level}
                </div>

                <div
                  className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full border ${qualityStyle.border} bg-white/50`}
                >

                  <span
                    className={`w-2 h-2 rounded-full ${qualityStyle.dot}`}
                  />

                  <span
                    className={`text-xs font-bold ${qualityStyle.text}`}
                  >
                    Quality classification
                  </span>

                </div>

              </div>

              {/* RISK */}

              <div
                className={`rounded-2xl border p-6 shadow-sm ${riskStyle.bg} ${riskStyle.border}`}
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Quality Risk
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Storage and degradation risk
                    </p>
                  </div>

                  <AlertTriangle
                    className={`w-6 h-6 ${riskStyle.icon}`}
                  />

                </div>

                <div
                  className={`text-3xl sm:text-4xl font-black mt-6 ${riskStyle.text}`}
                >
                  {analysis.risk_level}
                </div>

                <div
                  className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full border ${riskStyle.border} bg-white/50`}
                >

                  <span
                    className={`w-2 h-2 rounded-full ${riskStyle.dot}`}
                  />

                  <span
                    className={`text-xs font-bold ${riskStyle.text}`}
                  >
                    Estimated risk level
                  </span>

                </div>

              </div>

            </section>

            {/* ==================================================
                ANALYZED PARAMETERS
            ================================================== */}

            <section>

              <div className="mb-4">

                <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                  Quality Signals
                </p>

                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Analyzed Parameters
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Values used by the quality assessment engine.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <ParameterCard
                  icon={<Thermometer className="w-6 h-6" />}
                  title="Temperature"
                  value={`${analysis.average_temperature}°C`}
                  description="Average honey temperature"
                  iconClass="bg-orange-50 text-orange-600"
                />

                <ParameterCard
                  icon={<Droplets className="w-6 h-6" />}
                  title="Moisture"
                  value={`${analysis.moisture_percent}%`}
                  description="Honey moisture content"
                  iconClass="bg-blue-50 text-blue-600"
                />

                <ParameterCard
                  icon={<Clock className="w-6 h-6" />}
                  title="Exposure"
                  value={`${analysis.exposure_hours} hrs`}
                  description="Temperature exposure duration"
                  iconClass="bg-purple-50 text-purple-600"
                />

              </div>

            </section>

            {/* ==================================================
                CHART + FACTORS
            ================================================== */}

            <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">

              {/* HISTORY */}

              <div className="xl:col-span-3 bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 shadow-sm">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                      </div>

                      <h2 className="text-lg font-black text-slate-900">
                        Quality Score History
                      </h2>

                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Historical quality scores for the selected hive.
                    </p>

                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Recent analyses
                  </div>

                </div>

                {historyChartData.length > 0 ? (
                  <div className="h-72">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={historyChartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -15,
                          bottom: 0,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                        />

                        <XAxis
                          dataKey="time"
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          domain={[0, 100]}
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "#172033",
                            border: "none",
                            borderRadius: "12px",
                            color: "#fff",
                            boxShadow:
                              "0 10px 30px rgba(15,23,42,0.18)",
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                            fill: "#10b981",
                          }}
                          activeDot={{
                            r: 6,
                          }}
                          name="Quality Score"
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 text-sm">
                    No quality history available.
                  </div>
                )}

              </div>

              {/* FACTORS */}

              <div className="xl:col-span-2 bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 shadow-sm">

                <div className="flex items-center gap-2">

                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>

                  <div>

                    <h2 className="text-lg font-black text-slate-900">
                      Quality Factors
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      Conditions affecting the quality assessment.
                    </p>

                  </div>

                </div>

                <div className="space-y-3 mt-5">

                  {riskFactors.length > 0 ? (
                    riskFactors.map(
                      (factor, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 bg-[#faf7ef] border border-amber-100 rounded-xl p-4"
                        >

                          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">

                            <span className="text-xs font-black text-amber-700">
                              {index + 1}
                            </span>

                          </div>

                          <p className="text-sm leading-6 text-slate-600">
                            {factor}
                          </p>

                        </div>
                      )
                    )
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                      No specific risk factors were recorded.
                    </div>
                  )}

                </div>

                <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">

                  <div className="flex items-start gap-3">

                    <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />

                    <div>

                      <p className="text-sm font-bold text-amber-800">
                        Important quality note
                      </p>

                      <p className="text-xs leading-5 text-amber-700 mt-1">
                        This system estimates quality risk from
                        temperature, moisture, and exposure duration.
                        It does not prove honey purity or detect
                        adulteration. Laboratory testing is required
                        for chemical verification.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* ==================================================
                RECOMMENDATION
            ================================================== */}

            <section className="bg-white border border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-sm">

              <div className="flex flex-col md:flex-row md:items-start gap-4">

                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>

                <div className="flex-1">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        AI Guidance
                      </p>

                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        Quality Recommendation
                      </h2>

                    </div>

                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      Assessment complete

                    </div>

                  </div>

                  <div className="mt-4 bg-[#f8fbf9] border border-emerald-100 rounded-2xl p-5">

                    <p className="text-sm sm:text-base leading-7 text-slate-600">
                      {analysis.recommendation}
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* ==================================================
                PROCESS
            ================================================== */}

            <section className="bg-[#172033] rounded-3xl p-6 sm:p-8 shadow-xl">

              <div>

                <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest">

                  <Brain className="w-4 h-4" />

                  Quality Intelligence Pipeline

                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  From Storage Conditions to Quality Risk
                </h2>

                <p className="text-sm text-slate-400 mt-2 max-w-3xl">
                  Honey Chain evaluates key storage and honey parameters
                  to provide an explainable quality assessment for
                  operational decision support.
                </p>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7">

                <PipelineStep
                  number="01"
                  title="Measure"
                  description="Collect temperature, moisture and exposure-duration inputs."
                />

                <PipelineStep
                  number="02"
                  title="Assess"
                  description="Evaluate the combined conditions using the quality risk engine."
                />

                <PipelineStep
                  number="03"
                  title="Recommend"
                  description="Generate a quality classification, risk level and storage guidance."
                />

              </div>

            </section>

            {/* ==================================================
                LAST ANALYSIS
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">

              <div className="flex items-center gap-2 text-xs text-slate-500">

                <Clock className="w-3.5 h-3.5" />

                Last analysis:{" "}

                {analysis.analyzed_at
                  ? new Date(
                      analysis.analyzed_at
                    ).toLocaleString()
                  : "Not available"}

              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">

                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />

                AI quality assessment • Decision support

              </div>

            </div>
          </>
        )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="pt-5 pb-3 border-t border-amber-200/70">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">

            <p>
              Honey Chain • AI-powered smart beekeeping
            </p>

            <p>
              Smart India Hackathon 2026
            </p>

          </div>

        </footer>

      </div>
    </div>
  );
}

/* =============================================================
   INPUT PARAMETER
============================================================= */

function InputParameter({
  icon,
  title,
  unit,
  value,
  onChange,
  step,
  min,
  iconClass,
  description,
}) {
  return (
    <div className="bg-[#fafafa] border border-slate-100 rounded-2xl p-4">

      <div className="flex items-center gap-3 mb-4">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm font-bold text-slate-800">
            {title}
          </p>

          <p className="text-xs text-slate-400">
            {unit}
          </p>

        </div>

      </div>

      <div className="relative">

        <input
          type="number"
          step={step}
          min={min}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />

        <span className="absolute right-4 top-3.5 text-xs font-semibold text-slate-400">
          {unit}
        </span>

      </div>

      <p className="text-xs leading-5 text-slate-400 mt-3">
        {description}
      </p>

    </div>
  );
}

/* =============================================================
   PARAMETER CARD
============================================================= */

function ParameterCard({
  icon,
  title,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-center gap-4">

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-black text-slate-900 mt-1">
            {value}
          </p>

        </div>

      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">

        <p className="text-xs text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =============================================================
   PIPELINE STEP
============================================================= */

function PipelineStep({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">

          <span className="text-xs font-black text-slate-950">
            {number}
          </span>

        </div>

        <div className="flex items-center gap-2">

          <h3 className="text-base font-bold text-white">
            {title}
          </h3>

          {number !== "03" && (
            <ArrowRight className="w-4 h-4 text-amber-400 hidden sm:block" />
          )}

        </div>

      </div>

      <p className="text-xs leading-5 text-slate-400 mt-4">
        {description}
      </p>

    </div>
  );
}