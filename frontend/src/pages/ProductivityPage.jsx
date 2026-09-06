import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  Brain,
  CheckCircle2,
  Clock3,
  Droplets,
  Hexagon,
  Leaf,
  RefreshCw,
  Scale,
  Sparkles,
  Thermometer,
  TrendingUp,
  Zap,
  AlertTriangle,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../services/api";


// ============================================================
// HELPERS
// ============================================================

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}


function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toFixed(digits);
}


function getProductivityStyle(level) {
  const normalized = String(level || "").toLowerCase();

  if (normalized === "high") {
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "text-emerald-600",
    };
  }

  if (normalized === "medium") {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "text-amber-600",
    };
  }

  return {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    icon: "text-rose-600",
  };
}


// ============================================================
// COMPONENT
// ============================================================

export default function ProductivityPage() {
  const [hives, setHives] = useState([]);
  const [selectedHive, setSelectedHive] = useState("");

  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================================================
  // LOAD HIVES
  // ==========================================================

  const loadHives = async () => {
    try {
      setError("");

      const data = await api.getHives();

      const hiveList = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      // Only dataset hives
      const datasetHives = hiveList.filter((hive) =>
        /^HV-2026-00[1-6]$/.test(hive.hive_code)
      );

      setHives(datasetHives);

      if (datasetHives.length > 0) {
        setSelectedHive((current) => {
          if (
            current &&
            datasetHives.some(
              (hive) => String(hive.id) === String(current)
            )
          ) {
            return current;
          }

          return String(datasetHives[0].id);
        });
      }
    } catch (err) {
      console.error("Failed to load hives:", err);

      setError(
        err.message ||
          "Unable to load hive data. Please make sure the backend is running."
      );
    }
  };


  // ==========================================================
  // LOAD PRODUCTIVITY DATA
  // ==========================================================

  const loadPredictionData = async (hiveId) => {
    if (!hiveId) return;

    try {
      setError("");

      const [latestResult, historyResult] =
        await Promise.all([
          api.getLatestProductivity(hiveId),
          api.getProductivityHistory(hiveId),
        ]);

      setPrediction(latestResult || null);

      const historyData = Array.isArray(historyResult)
        ? historyResult
        : Array.isArray(historyResult?.items)
        ? historyResult.items
        : [];

      setHistory(historyData);
    } catch (err) {
      console.error(
        "Failed to load productivity data:",
        err
      );

      // A hive may simply not have a prediction yet.
      if (
        err.message?.toLowerCase().includes("not found") ||
        err.message?.toLowerCase().includes("no prediction")
      ) {
        setPrediction(null);
        setHistory([]);
        return;
      }

      setError(
        err.message ||
          "Unable to load productivity prediction."
      );
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const initialize = async () => {
      setInitialLoading(true);

      await loadHives();

      setInitialLoading(false);
    };

    initialize();
  }, []);


  // ==========================================================
  // LOAD SELECTED HIVE
  // ==========================================================

  useEffect(() => {
    if (!selectedHive) return;

    loadPredictionData(selectedHive);
  }, [selectedHive]);


  // ==========================================================
  // GENERATE NEW PREDICTION
  // ==========================================================

  const generatePrediction = async () => {
    if (!selectedHive) {
      setError("Please select a hive first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await api.predictProductivity(selectedHive);

      setPrediction(result);

      // Refresh history
      const historyResult =
        await api.getProductivityHistory(selectedHive);

      const historyData = Array.isArray(historyResult)
        ? historyResult
        : Array.isArray(historyResult?.items)
        ? historyResult.items
        : [];

      setHistory(historyData);
    } catch (err) {
      console.error(
        "Productivity prediction failed:",
        err
      );

      setError(
        err.message ||
          "Unable to generate productivity prediction."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // CHART DATA
  // ==========================================================

  const chartData = useMemo(() => {
    if (!Array.isArray(history)) return [];

    return [...history]
      .reverse()
      .map((item, index) => ({
        name: `Prediction ${index + 1}`,
        honey: Number(item.predicted_honey_kg || 0),
        confidence: Number(
          item.confidence_score || 0
        ),
        weightTrend: Number(
          item.weight_trend || 0
        ),
        date: formatDate(item.predicted_at),
      }));
  }, [history]);


  // ==========================================================
  // SELECTED HIVE OBJECT
  // ==========================================================

  const selectedHiveObject = useMemo(() => {
    return hives.find(
      (hive) =>
        String(hive.id) === String(selectedHive)
    );
  }, [hives, selectedHive]);


  // ==========================================================
  // PRODUCTIVITY STYLE
  // ==========================================================

  const productivityStyle =
    getProductivityStyle(
      prediction?.productivity_level
    );


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f7f1df] px-6 py-10">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-center min-h-[500px]">

            <div className="text-center">

              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-100 flex items-center justify-center">
                <RefreshCw
                  className="w-8 h-8 text-amber-700 animate-spin"
                />
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                Loading productivity intelligence...
              </h2>

              <p className="mt-2 text-slate-500">
                Connecting to hive productivity data
              </p>

            </div>

          </div>

        </div>
      </div>
    );
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f7f1df] px-4 sm:px-6 lg:px-8 py-8">

      <div className="max-w-7xl mx-auto">


        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-amber-600 to-orange-500 text-white shadow-xl mb-8">

          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -right-24 bottom-[-80px] w-72 h-72 rounded-full bg-white/10" />

          <div className="relative p-7 md:p-9">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

              <div>

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">

                    <Brain className="w-7 h-7" />

                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">
                    AI Productivity Engine
                  </span>

                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  AI Honey Productivity
                </h1>

                <p className="mt-3 max-w-2xl text-amber-50 leading-relaxed">
                  Analyze hive telemetry and estimate
                  potential honey productivity using
                  explainable AI-style intelligence.
                </p>

              </div>


              {/* HIVE SELECTOR */}

              <div className="w-full lg:w-[330px]">

                <label className="block text-sm font-semibold text-amber-50 mb-2">
                  Select Hive
                </label>

                <select
                  value={selectedHive}
                  onChange={(event) =>
                    setSelectedHive(event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/20 bg-white/15 backdrop-blur px-4 py-3 text-white font-semibold outline-none focus:ring-2 focus:ring-white/50"
                >

                  {hives.length === 0 && (
                    <option
                      value=""
                      className="text-slate-900"
                    >
                      No dataset hives available
                    </option>
                  )}

                  {hives.map((hive) => (
                    <option
                      key={hive.id}
                      value={hive.id}
                      className="text-slate-900"
                    >
                      {hive.hive_code}
                    </option>
                  ))}

                </select>

                <button
                  type="button"
                  onClick={generatePrediction}
                  disabled={
                    loading || !selectedHive
                  }
                  className="mt-3 w-full rounded-2xl bg-white text-amber-700 px-5 py-3 font-bold flex items-center justify-center gap-2 hover:bg-amber-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >

                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Prediction
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-7 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-start gap-3">

            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />

            <div>

              <p className="font-bold text-rose-800">
                Productivity system message
              </p>

              <p className="text-sm text-rose-700 mt-1">
                {error}
              </p>

            </div>

          </div>
        )}


        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {!prediction && !loading && (
          <div className="rounded-3xl border border-amber-200 bg-white shadow-sm p-10 text-center mb-8">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-5">

              <Brain className="w-8 h-8 text-amber-700" />

            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              No productivity prediction yet
            </h2>

            <p className="max-w-xl mx-auto mt-3 text-slate-500">
              Select a hive and generate an AI productivity
              prediction using the available hive telemetry.
            </p>

            <button
              type="button"
              onClick={generatePrediction}
              disabled={!selectedHive}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-white font-bold hover:bg-amber-700 transition disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              Generate First Prediction
            </button>

          </div>
        )}


        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        {prediction && (
          <>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">


              {/* HONEY */}

              <div className="rounded-3xl bg-white border border-amber-100 shadow-sm p-6">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-500">
                      Predicted Honey
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-900">
                      {formatNumber(
                        prediction.predicted_honey_kg,
                        2
                      )}
                      <span className="text-lg ml-1 text-slate-500">
                        kg
                      </span>
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-amber-700" />
                  </div>

                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Estimated honey productivity
                </p>

              </div>


              {/* PRODUCTIVITY LEVEL */}

              <div className="rounded-3xl bg-white border border-amber-100 shadow-sm p-6">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-500">
                      Productivity
                    </p>

                    <p
                      className={`mt-2 text-3xl font-black ${productivityStyle.text}`}
                    >
                      {prediction.productivity_level ||
                        "—"}
                    </p>

                  </div>

                  <div
                    className={`w-12 h-12 rounded-2xl ${productivityStyle.bg} flex items-center justify-center`}
                  >
                    <TrendingUp
                      className={`w-6 h-6 ${productivityStyle.icon}`}
                    />
                  </div>

                </div>

                <p className="mt-4 text-xs text-slate-400">
                  AI productivity classification
                </p>

              </div>


              {/* CONFIDENCE */}

              <div className="rounded-3xl bg-white border border-amber-100 shadow-sm p-6">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-500">
                      Confidence
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-900">
                      {formatNumber(
                        prediction.confidence_score,
                        2
                      )}
                      <span className="text-lg ml-1 text-slate-500">
                        %
                      </span>
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>

                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Prediction confidence score
                </p>

              </div>


              {/* WEIGHT TREND */}

              <div className="rounded-3xl bg-white border border-amber-100 shadow-sm p-6">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-500">
                      Weight Trend
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-900">
                      {formatNumber(
                        prediction.weight_trend,
                        3
                      )}
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-blue-600" />
                  </div>

                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Hive weight trend indicator
                </p>

              </div>

            </section>


            {/* =================================================
                CURRENT AI FORECAST
            ================================================= */}

            <section className="rounded-3xl bg-white border border-amber-100 shadow-sm p-7 mb-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

                <div>

                  <div className="flex items-center gap-2">

                    <Brain className="w-5 h-5 text-amber-600" />

                    <h2 className="text-xl font-bold text-slate-900">
                      Current AI Forecast
                    </h2>

                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    Latest productivity prediction for{" "}
                    {selectedHiveObject?.hive_code ||
                      "selected hive"}
                  </p>

                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">

                  <Clock3 className="w-4 h-4" />

                  {formatDate(
                    prediction.predicted_at
                  )}

                </div>

              </div>


              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">


                {/* MAIN FORECAST */}

                <div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-7">

                  <p className="text-sm font-semibold text-slate-500">
                    Expected production
                  </p>

                  <div className="mt-3 flex items-end gap-2">

                    <span className="text-5xl font-black text-amber-700">
                      {formatNumber(
                        prediction.predicted_honey_kg,
                        2
                      )}
                    </span>

                    <span className="text-lg font-bold text-slate-500 mb-2">
                      kg
                    </span>

                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">

                    <Zap className="w-4 h-4 text-amber-600" />

                    <span className="font-bold text-slate-800">
                      {prediction.productivity_level}
                    </span>

                  </div>

                </div>


                {/* TELEMETRY */}

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">


                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">

                        <Thermometer className="w-5 h-5 text-orange-600" />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-500">
                          Average Temperature
                        </p>

                        <p className="text-xl font-black text-slate-900">
                          {formatNumber(
                            prediction.average_temperature,
                            2
                          )}
                          °C
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                        <Droplets className="w-5 h-5 text-blue-600" />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-500">
                          Average Humidity
                        </p>

                        <p className="text-xl font-black text-slate-900">
                          {formatNumber(
                            prediction.average_humidity,
                            2
                          )}
                          %
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">

                        <Activity className="w-5 h-5 text-emerald-600" />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-500">
                          Bee Activity
                        </p>

                        <p className="text-xl font-black text-slate-900">
                          {formatNumber(
                            prediction.average_bee_activity,
                            2
                          )}
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">

                        <Scale className="w-5 h-5 text-violet-600" />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-500">
                          Weight Trend
                        </p>

                        <p className="text-xl font-black text-slate-900">
                          {formatNumber(
                            prediction.weight_trend,
                            3
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                HISTORY CHART
            ================================================= */}

            <section className="rounded-3xl bg-white border border-amber-100 shadow-sm p-7 mb-8">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <div className="flex items-center gap-2">

                    <TrendingUp className="w-5 h-5 text-amber-600" />

                    <h2 className="text-xl font-bold text-slate-900">
                      Prediction History
                    </h2>

                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    Honey productivity estimates generated
                    for this hive
                  </p>

                </div>

                <span className="text-sm font-semibold text-slate-500">
                  {history.length} prediction
                  {history.length === 1 ? "" : "s"}
                </span>

              </div>


              {chartData.length > 0 ? (
                <div className="h-[330px] w-full">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                      />

                      <YAxis
                        tick={{ fontSize: 12 }}
                      />

                      <Tooltip
                        formatter={(value, name) => {
                          if (
                            name === "Honey"
                          ) {
                            return [
                              `${Number(value).toFixed(
                                2
                              )} kg`,
                              name,
                            ];
                          }

                          if (
                            name ===
                            "Confidence"
                          ) {
                            return [
                              `${Number(value).toFixed(
                                2
                              )}%`,
                              name,
                            ];
                          }

                          return [
                            Number(value).toFixed(
                              3
                            ),
                            name,
                          ];
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="honey"
                        name="Honey"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="confidence"
                        name="Confidence"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  No prediction history available.
                </div>
              )}

            </section>


            {/* =================================================
                INFLUENCING FACTORS
            ================================================= */}

            <section className="rounded-3xl bg-white border border-amber-100 shadow-sm p-7 mb-8">

              <div className="flex items-center gap-2 mb-5">

                <Sparkles className="w-5 h-5 text-amber-600" />

                <h2 className="text-xl font-bold text-slate-900">
                  Influencing Factors
                </h2>

              </div>


              {prediction.influencing_factors ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {(() => {
                    let factors = [];

                    try {
                      factors = JSON.parse(
                        prediction.influencing_factors
                      );
                    } catch {
                      factors = [
                        prediction.influencing_factors,
                      ];
                    }

                    if (!Array.isArray(factors)) {
                      factors = [String(factors)];
                    }

                    return factors.map(
                      (factor, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex items-start gap-3"
                        >

                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />

                          <p className="text-sm font-medium text-slate-700">
                            {factor}
                          </p>

                        </div>
                      )
                    );
                  })()}

                </div>
              ) : (
                <p className="text-slate-500">
                  No influencing factors were returned
                  by the productivity engine.
                </p>
              )}

            </section>


            {/* =================================================
                AI EXPLANATION
            ================================================= */}

            <section className="rounded-3xl bg-slate-900 text-white shadow-xl p-7 mb-8">

              <div className="flex items-start gap-4">

                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">

                  <Brain className="w-6 h-6 text-amber-300" />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Explainable AI Prototype
                  </h2>

                  <p className="mt-2 text-slate-300 leading-relaxed">
                    This productivity engine combines hive
                    telemetry indicators such as weight trend,
                    temperature, humidity, and bee activity to
                    estimate potential honey production.
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <p className="text-sm font-semibold text-amber-300 mb-2">
                      Important prototype note
                    </p>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      The current implementation is a
                      deterministic AI-style decision engine,
                      not a trained machine-learning model.
                      It is designed to provide explainable
                      productivity intelligence for the
                      prototype platform.
                    </p>

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                AI DECISION PIPELINE
            ================================================= */}

            <section className="rounded-3xl bg-white border border-amber-100 shadow-sm p-7 mb-8">

              <div className="flex items-center gap-2 mb-7">

                <Hexagon className="w-5 h-5 text-amber-600" />

                <h2 className="text-xl font-bold text-slate-900">
                  AI Decision Pipeline
                </h2>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Step 01
                  </div>

                  <h3 className="font-bold text-slate-900 mt-2">
                    IoT Telemetry
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Temperature, humidity, weight and bee
                    activity readings.
                  </p>

                </div>


                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Step 02
                  </div>

                  <h3 className="font-bold text-slate-900 mt-2">
                    Feature Analysis
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Analyze hive weight trends and colony
                    activity.
                  </p>

                </div>


                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Step 03
                  </div>

                  <h3 className="font-bold text-slate-900 mt-2">
                    Productivity Engine
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Generate honey production estimate and
                    confidence score.
                  </p>

                </div>


                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Step 04
                  </div>

                  <h3 className="font-bold text-slate-900 mt-2">
                    Explainable Result
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Show productivity level and influencing
                    factors.
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                LAST PREDICTION
            ================================================= */}

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 mb-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <p className="text-sm font-semibold text-amber-700">
                    Last prediction
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatDate(
                      prediction.predicted_at
                    )}
                  </p>

                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">

                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />

                  Productivity analysis completed

                </div>

              </div>

            </section>

          </>
        )}


        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="text-center py-5">

          <p className="text-sm text-slate-500">
            IoT telemetry → AI productivity analysis →
            honey production forecast
          </p>

        </div>

      </div>

    </div>
  );
}