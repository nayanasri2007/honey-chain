import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Activity,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Droplets,
  Scale,
  Zap,
  ShieldCheck,
  RefreshCw,
  Play,
  Hexagon,
  TrendingUp,
  Clock3,
  Sparkles,
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



/* ========================================================================== */
/* STATUS BADGE                                                               */
/* ========================================================================== */

function StatusBadge({ status }) {
  let styles =
    "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (
    status === "Critical" ||
    status === "Very Low" ||
    status === "Decreasing"
  ) {
    styles =
      "bg-rose-50 text-rose-700 border-rose-200";
  } else if (
    status === "Warning" ||
    status === "Reduced"
  ) {
    styles =
      "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles}`}
    >
      {status}
    </span>
  );
}

/* ========================================================================== */
/* RISK BADGE                                                                 */
/* ========================================================================== */

function RiskBadge({ risk }) {
  const styles =
    risk === "Critical"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : risk === "High"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : risk === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${styles}`}
    >
      {risk === "Critical" || risk === "High" ? (
        <AlertTriangle className="w-3.5 h-3.5" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5" />
      )}

      {risk} Risk
    </span>
  );
}

/* ========================================================================== */
/* SUMMARY CARD                                                               */
/* ========================================================================== */

function SummaryCard({
  icon,
  label,
  value,
  description,
  iconClass = "text-amber-700",
  iconBg = "bg-amber-50",
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e9e0cf] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400">
            {label}
          </p>

          <p className="text-2xl font-black text-slate-800 mt-2">
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

/* ========================================================================== */
/* TELEMETRY CARD                                                             */
/* ========================================================================== */

function TelemetryCard({
  icon,
  label,
  value,
  unit,
  status,
  iconClass,
  iconBg,
}) {
  return (
    <div className="bg-[#faf8f2] rounded-2xl border border-[#e9e0cf] p-4">

      <div className="flex items-center justify-between gap-2">

        <div
          className={`w-9 h-9 rounded-xl ${iconBg} ${iconClass} flex items-center justify-center`}
        >
          {icon}
        </div>

        <StatusBadge status={status} />

      </div>

      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mt-4">
        {label}
      </p>

      <div className="flex items-baseline gap-1 mt-1">

        <span className="text-2xl font-black text-slate-800">
          {value}
        </span>

        <span className={`text-sm font-black ${iconClass}`}>
          {unit}
        </span>

      </div>

    </div>
  );
}

/* ========================================================================== */
/* CHART CARD                                                                 */
/* ========================================================================== */

function ChartCard({ title, subtitle, icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-[#e9e0cf] shadow-sm p-5 md:p-6">

      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-xl bg-[#faf8f2] text-amber-700 flex items-center justify-center">
            {icon}
          </div>

          <div>

            <h3 className="text-sm font-black text-slate-800">
              {title}
            </h3>

            <p className="text-[10px] text-slate-400 mt-0.5">
              {subtitle}
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

/* ========================================================================== */
/* MAIN PAGE                                                                  */
/* ========================================================================== */

export default function AIHealthPage() {

  const [hives, setHives] = useState([]);
  const [selectedHive, setSelectedHive] = useState("");
  const [latestReading, setLatestReading] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [iotHistory, setIotHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  /* Early warning state */
  const [earlyWarning, setEarlyWarning] = useState(null);

  /* ====================================================================== */
  /* LOAD HIVES                                                             */
  /* ====================================================================== */

  useEffect(() => {
    loadHives();
  }, []);

  async function loadHives() {

    try {

      setPageLoading(true);

      const data = await api.getHives();

      setHives(data);

      const datasetHives = data.filter((hive) =>
        /^HV-2026-00[1-6]$/.test(
          hive.hive_code
        )
      );

      if (datasetHives.length > 0) {

        setSelectedHive(
          String(datasetHives[0].id)
        );

      } else if (data.length > 0) {

        setSelectedHive(
          String(data[0].id)
        );

      }

    } catch (err) {

      setError(err.message);

    } finally {

      setPageLoading(false);

    }

  }

  /* ====================================================================== */
  /* LOAD SELECTED HIVE DATA                                               */
  /* ====================================================================== */

  useEffect(() => {

    if (selectedHive) {
      loadHiveData(selectedHive);
    }

  }, [selectedHive]);

  async function loadHiveData(hiveId) {

    setError("");
    setAnalysis(null);
    setEarlyWarning(null);

    try {

      /* -------------------------------------------------------------- */
      /* LATEST READING                                                */
      /* -------------------------------------------------------------- */

      try {
        const readingData = await api.getLatestReading(hiveId);
        setLatestReading(readingData);
      } catch {
        setLatestReading(null);
      }

      /* -------------------------------------------------------------- */
      /* IOT HISTORY                                                   */
      /* -------------------------------------------------------------- */

      try {
        const iotHistoryData = await api.getReadingHistory(hiveId, 20);
        setIotHistory(iotHistoryData);
      } catch {
        setIotHistory([]);
      }

      /* -------------------------------------------------------------- */
      /* EARLY WARNING EVALUATION                                      */
      /* -------------------------------------------------------------- */

      try {
        const warningData = await api.evaluateHiveHealth(hiveId);
        setEarlyWarning(warningData);
      } catch {
        setEarlyWarning(null);
      }

      /* -------------------------------------------------------------- */
      /* AI HISTORY                                                    */
      /* -------------------------------------------------------------- */

      try {
        const historyData = await api.getHealthHistory(hiveId);
        setHistory(historyData);

        if (historyData.length > 0) {
          setAnalysis(historyData[0]);
        }
      } catch {
        setHistory([]);
      }

    } catch (err) {

      setError(err.message);

    }

  }

  /* ====================================================================== */
  /* RUN AI ANALYSIS                                                       */
  /* ====================================================================== */

  async function runAnalysis() {

    if (!selectedHive) return;

    setLoading(true);
    setError("");

    try {

      const data = await api.analyzeHiveHealth(selectedHive);

      setAnalysis(data);

      /* Refresh AI history */

      try {
        const historyData = await api.getHealthHistory(selectedHive);
        setHistory(historyData);
      } catch {
        // Keep the newly generated analysis visible if history refresh fails.
      }

      /* Refresh early warning */

      try {
        const warningData = await api.evaluateHiveHealth(selectedHive);
        setEarlyWarning(warningData);
      } catch {
        setEarlyWarning(null);
      }

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }

  /* ====================================================================== */
  /* CHART DATA                                                            */
  /* ====================================================================== */

  const score =
    analysis?.health_score ?? 0;

  const healthTrendData =
    [...history]
      .reverse()
      .map((item) => ({
        date: new Date(
          item.analyzed_at
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),

        score:
          item.health_score,
      }));

  const iotTrendData =
    [...iotHistory]
      .reverse()
      .map((item) => ({
        time: new Date(
          item.timestamp
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),

        temperature:
          item.temperature,

        humidity:
          item.humidity,
      }));

  const selectedHiveData =
    hives.find(
      (hive) =>
        String(hive.id) ===
        String(selectedHive)
    );

  const scoreColor =
    score >= 80
      ? "#16a34a"
      : score >= 60
      ? "#d97706"
      : score >= 40
      ? "#ea580c"
      : "#dc2626";

  /* ====================================================================== */
  /* RENDER                                                                */
  /* ====================================================================== */

  return (

    <div className="min-h-full bg-[#f8f4ea] text-slate-800">

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 space-y-7">

        {/* =============================================================== */}
        {/* HERO                                                            */}
        {/* =============================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-[#17231c] shadow-xl">

          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="absolute right-24 bottom-0 w-48 h-48 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative p-7 md:p-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

              <div className="max-w-3xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-[0.16em]">

                  <Brain className="w-3.5 h-3.5" />

                  AI Health Intelligence

                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white">
                  AI Hive Health Dashboard
                </h1>

                <p className="mt-3 text-sm md:text-base leading-7 text-slate-300 max-w-2xl">

                  AI-powered hive health assessment using
                  real-time IoT telemetry to identify
                  abnormal conditions, colony stress and
                  early warning signals.

                </p>

                <div className="flex flex-wrap gap-4 mt-6">

                  <HeroFeature
                    icon={
                      <Thermometer className="w-4 h-4" />
                    }
                    text="Environment"
                  />

                  <HeroFeature
                    icon={
                      <Activity className="w-4 h-4" />
                    }
                    text="Colony Activity"
                  />

                  <HeroFeature
                    icon={
                      <Scale className="w-4 h-4" />
                    }
                    text="Hive Weight"
                  />

                  <HeroFeature
                    icon={
                      <Sparkles className="w-4 h-4" />
                    }
                    text="AI Risk Detection"
                  />

                </div>

              </div>

              <div className="shrink-0">

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[220px]">

                  <div className="flex items-center gap-2 text-emerald-300">

                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />

                    <span className="text-xs font-bold">
                      AI System Online
                    </span>

                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 leading-5">

                    Analysis engine connected to hive
                    telemetry.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =============================================================== */}
        {/* ERROR                                                           */}
        {/* =============================================================== */}

        {error && (

          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-center gap-3 text-sm text-rose-700">

            <AlertTriangle className="w-5 h-5 shrink-0" />

            <span>{error}</span>

          </div>

        )}

        {/* =============================================================== */}
        {/* HIVE SELECTOR                                                   */}
        {/* =============================================================== */}

        <section className="bg-white rounded-2xl border border-[#e9e0cf] shadow-sm p-4">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">

                <Hexagon className="w-5 h-5" />

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400">
                  AI Monitoring Target
                </p>

                <p className="text-sm font-black text-slate-800">
                  Select Hive
                </p>

              </div>

              <select
                value={selectedHive}
                onChange={(e) =>
                  setSelectedHive(
                    e.target.value
                  )
                }
                className="ml-1 bg-[#faf8f2] border border-[#e4dbc9] rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 w-full sm:w-72"
              >

                {hives.length === 0 ? (

                  <option value="">
                    No hives available
                  </option>

                ) : (

                  hives.map((hive) => (

                    <option
                      key={hive.id}
                      value={hive.id}
                    >
                      {hive.hive_code}
                    </option>

                  ))

                )}

              </select>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <ShieldCheck className="w-4 h-4 text-emerald-600" />

              {selectedHiveData ? (

                <span>

                  Monitoring{" "}

                  <strong className="text-slate-800">
                    {selectedHiveData.hive_code}
                  </strong>

                </span>

              ) : (

                <span>
                  Select a hive to begin
                </span>

              )}

            </div>

          </div>

        </section>

        {/* =============================================================== */}
        {/* QUICK SUMMARY                                                   */}
        {/* =============================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <SummaryCard
            icon={
              <Activity className="w-5 h-5" />
            }
            label="Health Score"
            value={`${score}/100`}
            description={
              analysis
                ? `${analysis.risk_level} risk`
                : "Analysis required"
            }
            iconClass="text-emerald-700"
            iconBg="bg-emerald-50"
          />

          <SummaryCard
            icon={
              <Thermometer className="w-5 h-5" />
            }
            label="Temperature"
            value={
              latestReading
                ? `${latestReading.temperature}°C`
                : "--"
            }
            description={
              latestReading?.temperature_status ||
              "No reading"
            }
            iconClass="text-orange-700"
            iconBg="bg-orange-50"
          />

          <SummaryCard
            icon={
              <Droplets className="w-5 h-5" />
            }
            label="Humidity"
            value={
              latestReading
                ? `${latestReading.humidity}%`
                : "--"
            }
            description={
              latestReading?.humidity_status ||
              "No reading"
            }
            iconClass="text-blue-700"
            iconBg="bg-blue-50"
          />

          <SummaryCard
            icon={
              <Zap className="w-5 h-5" />
            }
            label="Bee Activity"
            value={
              latestReading
                ? `${latestReading.bee_activity}%`
                : "--"
            }
            description={
              latestReading?.bee_activity_status ||
              "No reading"
            }
            iconClass="text-amber-700"
            iconBg="bg-amber-50"
          />

        </div>

        {/* =============================================================== */}
        {/* EARLY WARNING INTELLIGENCE                                     */}
        {/* =============================================================== */}

        {earlyWarning && (

          <section
            className={`rounded-3xl border shadow-sm p-6 md:p-7 ${
              earlyWarning.early_warning
                ? earlyWarning.risk_level ===
                  "Critical"
                  ? "bg-rose-50 border-rose-200"
                  : earlyWarning.risk_level ===
                    "High"
                  ? "bg-orange-50 border-orange-200"
                  : "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
            }`}
          >

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

              <div className="flex items-start gap-4">

                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    earlyWarning.early_warning
                      ? earlyWarning.risk_level ===
                        "Critical"
                        ? "bg-rose-100 text-rose-700"
                        : earlyWarning.risk_level ===
                          "High"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >

                  {earlyWarning.early_warning ? (

                    <AlertTriangle className="w-6 h-6" />

                  ) : (

                    <CheckCircle2 className="w-6 h-6" />

                  )}

                </div>

                <div>

                  <p
                    className={`text-[10px] uppercase tracking-[0.16em] font-black ${
                      earlyWarning.early_warning
                        ? earlyWarning.risk_level ===
                          "Critical"
                          ? "text-rose-700"
                          : earlyWarning.risk_level ===
                            "High"
                          ? "text-orange-700"
                          : "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    Early Warning Intelligence
                  </p>

                  <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-1">

                    {earlyWarning.early_warning
                      ? "Early Warning Detected"
                      : "No Early Warning"}

                  </h2>

                  <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-6">

                    {earlyWarning.early_warning
                      ? "The AI health engine has detected one or more abnormal hive conditions that may require beekeeper attention."
                      : "Current hive telemetry is within acceptable operating conditions. No immediate abnormal signal has been detected."}

                  </p>

                </div>

              </div>

              <RiskBadge
                risk={
                  earlyWarning.risk_level
                }
              />

            </div>

            {/* ========================================================= */}
            {/* WARNING DETAILS                                           */}
            {/* ========================================================= */}

            {earlyWarning.early_warning && (

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

                {/* Warning Factors */}

                <div className="bg-white/70 rounded-2xl border border-white p-5">

                  <div className="flex items-center gap-2 mb-4">

                    <AlertTriangle className="w-4 h-4 text-rose-600" />

                    <h3 className="text-sm font-black text-slate-800">
                      Detected Warning Factors
                    </h3>

                  </div>

                  {earlyWarning.warning_factors?.length > 0 ? (

                    <div className="space-y-2.5">

                      {earlyWarning.warning_factors.map(
                        (warning, index) => (

                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-100 p-3"
                          >

                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>

                            <p className="text-xs text-rose-800 leading-5">
                              {warning}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <p className="text-xs text-slate-500">
                      No specific warning factors were returned.
                    </p>

                  )}

                </div>

                {/* AI Recommendation */}

                <div className="bg-white/70 rounded-2xl border border-white p-5">

                  <div className="flex items-center gap-2 mb-4">

                    <Sparkles className="w-4 h-4 text-amber-600" />

                    <h3 className="text-sm font-black text-slate-800">
                      Recommended Action
                    </h3>

                  </div>

                  <div className="rounded-xl bg-[#17231c] p-4">

                    <p className="text-sm text-slate-200 leading-6">

                      {earlyWarning.recommendation}

                    </p>

                  </div>

                  <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500">

                    <ShieldCheck className="w-4 h-4 text-emerald-600" />

                    AI-generated early risk assessment based on
                    available hive telemetry.

                  </div>

                </div>

              </div>

            )}

          </section>

        )}

        {/* =============================================================== */}
        {/* MAIN AI ANALYSIS                                                */}
        {/* =============================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Health Score */}

          <div className="bg-white rounded-3xl border border-[#e9e0cf] shadow-sm p-7">

            <div className="flex items-center gap-2 text-amber-700 text-[10px] uppercase tracking-[0.15em] font-bold">

              <Brain className="w-4 h-4" />

              AI Assessment

            </div>

            <h2 className="text-xl font-black text-slate-800 mt-2">
              Overall Hive Health
            </h2>

            <div className="flex justify-center my-7">

              <div
                className="w-48 h-48 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(
                    ${scoreColor} ${score * 3.6}deg,
                    #eee9dc ${score * 3.6}deg
                  )`,
                }}
              >

                <div className="w-36 h-36 rounded-full bg-[#17231c] flex flex-col items-center justify-center shadow-inner">

                  <span className="text-5xl font-black text-white">
                    {score}
                  </span>

                  <span className="text-xs text-slate-400 mt-1">
                    / 100
                  </span>

                </div>

              </div>

            </div>

            <div className="flex justify-center">

              {analysis ? (

                <RiskBadge
                  risk={analysis.risk_level}
                />

              ) : (

                <span className="inline-flex px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                  Analysis Required
                </span>

              )}

            </div>

            <button
              className="mt-5 w-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black rounded-xl px-5 py-3 text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              onClick={runAnalysis}
              disabled={
                loading ||
                !selectedHive
              }
            >

              {loading ? (

                <RefreshCw className="w-4 h-4 animate-spin" />

              ) : (

                <Play className="w-4 h-4 fill-slate-950" />

              )}

              {loading
                ? "Analyzing Hive..."
                : "Run AI Health Analysis"}

            </button>

          </div>

          {/* Parameter Analysis */}

          <div className="bg-white rounded-3xl border border-[#e9e0cf] shadow-sm p-7">

            <div className="flex items-center gap-2 text-amber-700 text-[10px] uppercase tracking-[0.15em] font-bold">

              <Activity className="w-4 h-4" />

              Parameter Intelligence

            </div>

            <h2 className="text-xl font-black text-slate-800 mt-2 mb-5">
              AI Parameter Analysis
            </h2>

            {analysis ? (

              <div className="space-y-1">

                <ParameterRow
                  label="Temperature"
                  icon={
                    <Thermometer className="w-4 h-4" />
                  }
                  status={
                    analysis.temperature_status
                  }
                />

                <ParameterRow
                  label="Humidity"
                  icon={
                    <Droplets className="w-4 h-4" />
                  }
                  status={
                    analysis.humidity_status
                  }
                />

                <ParameterRow
                  label="Bee Activity"
                  icon={
                    <Zap className="w-4 h-4" />
                  }
                  status={
                    analysis.activity_status
                  }
                />

                <ParameterRow
                  label="Hive Weight"
                  icon={
                    <Scale className="w-4 h-4" />
                  }
                  status={
                    analysis.weight_status
                  }
                />

              </div>

            ) : (

              <EmptyMessage
                text="Run the AI analysis to evaluate hive parameters."
              />

            )}

          </div>

          {/* Warning Factors */}

          <div className="bg-white rounded-3xl border border-[#e9e0cf] shadow-sm p-7">

            <div className="flex items-center gap-2 text-amber-700 text-[10px] uppercase tracking-[0.15em] font-bold">

              <AlertTriangle className="w-4 h-4" />

              Risk Signals

            </div>

            <h2 className="text-xl font-black text-slate-800 mt-2 mb-5">
              Warning Factors
            </h2>

            {analysis?.warning_factors?.length ? (

              <div className="space-y-3">

                {analysis.warning_factors.map(
                  (warning, index) => (

                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-100 p-3"
                    >

                      <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />

                      <p className="text-xs text-rose-800 leading-5">
                        {warning}
                      </p>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3">

                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />

                <div>

                  <p className="text-xs font-black text-emerald-800">
                    No warning factors detected
                  </p>

                  <p className="text-[11px] text-emerald-700 mt-1">

                    The current analysis has not identified
                    significant abnormal signals.

                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* =============================================================== */}
        {/* LATEST TELEMETRY                                               */}
        {/* =============================================================== */}

        <section className="bg-white rounded-3xl border border-[#e9e0cf] shadow-sm p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>

              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                IoT Input Layer
              </p>

              <h2 className="text-xl font-black text-slate-800 mt-1">
                Latest Hive Telemetry
              </h2>

            </div>

            {latestReading && (

              <div className="flex items-center gap-2 text-[11px] text-slate-500">

                <Clock3 className="w-4 h-4" />

                {new Date(
                  latestReading.timestamp
                ).toLocaleString()}

              </div>

            )}

          </div>

          {latestReading ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <TelemetryCard
                label="Temperature"
                value={
                  latestReading.temperature
                }
                unit="°C"
                status={
                  latestReading.temperature_status
                }
                icon={
                  <Thermometer className="w-5 h-5" />
                }
                iconClass="text-orange-700"
                iconBg="bg-orange-50"
              />

              <TelemetryCard
                label="Humidity"
                value={
                  latestReading.humidity
                }
                unit="%"
                status={
                  latestReading.humidity_status
                }
                icon={
                  <Droplets className="w-5 h-5" />
                }
                iconClass="text-blue-700"
                iconBg="bg-blue-50"
              />

              <TelemetryCard
                label="Hive Weight"
                value={
                  latestReading.weight
                }
                unit="kg"
                status={
                  latestReading.weight_status
                }
                icon={
                  <Scale className="w-5 h-5" />
                }
                iconClass="text-amber-700"
                iconBg="bg-amber-50"
              />

              <TelemetryCard
                label="Bee Activity"
                value={
                  latestReading.bee_activity
                }
                unit="%"
                status={
                  latestReading.bee_activity_status
                }
                icon={
                  <Zap className="w-5 h-5" />
                }
                iconClass="text-emerald-700"
                iconBg="bg-emerald-50"
              />

            </div>

          ) : (

            <EmptyMessage
              text="No IoT readings available for this hive."
            />

          )}

        </section>

        {/* =============================================================== */}
        {/* CHARTS                                                          */}
        {/* =============================================================== */}

        <section>

          <div className="mb-5">

            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
              Historical Analytics
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-1">
              Hive Intelligence Trends
            </h2>

            <p className="text-xs text-slate-500 mt-1">

              Compare recent environmental conditions
              with AI health scoring.

            </p>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Temperature / Humidity */}

            <ChartCard
              title="Temperature & Humidity Trend"
              subtitle="Recent IoT environmental readings"
              icon={
                <Thermometer className="w-4 h-4" />
              }
            >

              {iotTrendData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={iotTrendData}
                  >

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
                      stroke="#94a3b8"
                      fontSize={10}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "#fffdf8",
                        borderColor:
                          "#e4dbc9",
                        borderRadius:
                          "12px",
                        fontSize: "12px",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ea580c"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      name="Temperature (°C)"
                    />

                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      name="Humidity (%)"
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <EmptyMessage
                  text="No IoT history available yet."
                />

              )}

            </ChartCard>

            {/* Health Score */}

            <ChartCard
              title="Health Score Trend"
              subtitle="Historical AI assessment scores"
              icon={
                <Brain className="w-4 h-4" />
              }
            >

              {healthTrendData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={healthTrendData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e9e0cf"
                    />

                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={10}
                    />

                    <YAxis
                      domain={[0, 100]}
                      stroke="#94a3b8"
                      fontSize={10}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "#fffdf8",
                        borderColor:
                          "#e4dbc9",
                        borderRadius:
                          "12px",
                        fontSize: "12px",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#d97706"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Health Score"
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <EmptyMessage
                  text="No health analysis history available yet."
                />

              )}

            </ChartCard>

          </div>

        </section>

        {/* =============================================================== */}
        {/* AI RECOMMENDATION                                               */}
        {/* =============================================================== */}

        <section className="rounded-3xl bg-[#17231c] text-white p-6 md:p-7 relative overflow-hidden">

          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-2 text-amber-300 text-[10px] uppercase tracking-[0.15em] font-bold">

              <Sparkles className="w-4 h-4" />

              AI Decision Support

            </div>

            <h2 className="text-xl font-black mt-2">
              AI Recommendation
            </h2>

            {analysis ? (

              <p className="text-sm md:text-base text-slate-300 leading-7 mt-4 max-w-4xl">

                {analysis.recommendation}

              </p>

            ) : (

              <p className="text-sm text-slate-400 leading-6 mt-4">

                AI recommendation will appear after running
                a health analysis for the selected hive.

              </p>

            )}

            <div className="flex items-center gap-2 mt-5 text-[10px] text-slate-400">

              <ShieldCheck className="w-4 h-4 text-emerald-400" />

              AI provides an early risk assessment based on
              available telemetry and should support, not replace,
              beekeeper inspection.

            </div>

          </div>

        </section>

        {/* =============================================================== */}
        {/* HISTORY                                                         */}
        {/* =============================================================== */}

        <section className="bg-white rounded-3xl border border-[#e9e0cf] shadow-sm p-6">

          <div className="mb-5">

            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
              Historical Records
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-1">
              AI Analysis History
            </h2>

          </div>

          {history.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[760px] border-collapse">

                <thead>

                  <tr className="border-b border-[#e9e0cf]">

                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wide font-black text-slate-400">
                      Date & Time
                    </th>

                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wide font-black text-slate-400">
                      Score
                    </th>

                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wide font-black text-slate-400">
                      Risk
                    </th>

                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wide font-black text-slate-400">
                      Recommendation
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {history.map((item) => (

                    <tr
                      key={item.id}
                      className="border-b border-[#f0eadf] hover:bg-[#faf8f2] transition-colors"
                    >

                      <td className="py-4 px-3 text-xs text-slate-600">

                        {new Date(
                          item.analyzed_at
                        ).toLocaleString()}

                      </td>

                      <td className="py-4 px-3">

                        <div className="flex items-center gap-2">

                          <span className="font-black text-slate-800">
                            {item.health_score}
                          </span>

                          <span className="text-[10px] text-slate-400">
                            /100
                          </span>

                        </div>

                      </td>

                      <td className="py-4 px-3">

                        <RiskBadge
                          risk={
                            item.risk_level
                          }
                        />

                      </td>

                      <td className="py-4 px-3 text-xs text-slate-600 max-w-md">

                        {item.recommendation}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (

            <EmptyMessage
              text="No previous analyses available."
            />

          )}

        </section>

        {/* =============================================================== */}
        {/* FOOTER                                                          */}
        {/* =============================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3 text-[10px] text-slate-400">

          <div className="flex items-center gap-2">

            <Brain className="w-4 h-4 text-amber-600" />

            Honey Chain AI Health Intelligence

          </div>

          <div>
            IoT telemetry → AI analysis → early warning
          </div>

        </div>

      </div>

    </div>

  );
}

/* ========================================================================== */
/* HERO FEATURE                                                               */
/* ========================================================================== */

function HeroFeature({ icon, text }) {

  return (

    <div className="flex items-center gap-2 text-xs text-slate-300">

      <span className="text-amber-300">
        {icon}
      </span>

      <span>{text}</span>

    </div>

  );
}

/* ========================================================================== */
/* PARAMETER ROW                                                              */
/* ========================================================================== */

function ParameterRow({
  label,
  icon,
  status,
}) {

  return (

    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-[#eee8dc] last:border-0">

      <div className="flex items-center gap-3">

        <div className="w-8 h-8 rounded-lg bg-[#faf8f2] text-amber-700 flex items-center justify-center">

          {icon}

        </div>

        <span className="text-xs font-semibold text-slate-700">
          {label}
        </span>

      </div>

      <StatusBadge status={status} />

    </div>

  );

}

/* ========================================================================== */
/* EMPTY MESSAGE                                                              */
/* ========================================================================== */

function EmptyMessage({ text }) {

  return (

    <div className="flex flex-col items-center justify-center py-10 text-center">

      <Activity className="w-9 h-9 text-slate-300 mb-3" />

      <p className="text-xs text-slate-400">
        {text}
      </p>

    </div>

  );

}