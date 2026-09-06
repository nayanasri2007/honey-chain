import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Brain,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Droplets,
  Activity,
  Target,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "/api/v1";

export default function ProductivityPage() {
  const [hives, setHives] = useState([]);
  const [selectedHive, setSelectedHive] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHives();
  }, []);

  useEffect(() => {
    if (selectedHive) {
      loadPredictionData(selectedHive);
    }
  }, [selectedHive]);

  async function loadHives() {
    try {
      setInitialLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/hives/`);

      if (!response.ok) {
        throw new Error("Failed to load hives");
      }

      const data = await response.json();
      setHives(data);

      if (data.length > 0) {
        setSelectedHive(String(data[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  }

  async function loadPredictionData(hiveId) {
    try {
      setError("");

      const [latestResponse, historyResponse] = await Promise.all([
        fetch(
          `${API_BASE}/productivity/hives/${hiveId}/productivity/latest`
        ),
        fetch(
          `${API_BASE}/productivity/hives/${hiveId}/productivity/history`
        ),
      ]);

      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        setPrediction(latestData);
      } else {
        setPrediction(null);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function generatePrediction() {
    if (!selectedHive) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/productivity/hives/${selectedHive}/productivity/predict`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed");
      }

      setPrediction(data);

      await loadPredictionData(selectedHive);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const historyChartData = [...history]
    .reverse()
    .map((item) => ({
      time: new Date(item.predicted_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      honey: item.predicted_honey_kg,
      confidence: item.confidence_score,
    }));

  let influencingFactors = [];

  if (prediction?.influencing_factors) {
    try {
      influencingFactors = JSON.parse(prediction.influencing_factors);
    } catch {
      influencingFactors = [prediction.influencing_factors];
    }
  }

  const productivityClass =
    prediction?.productivity_level === "High"
      ? "text-emerald-400"
      : prediction?.productivity_level === "Medium"
        ? "text-amber-400"
        : prediction?.productivity_level === "Low"
          ? "text-orange-400"
          : "text-red-400";

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading productivity dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl font-bold text-white">
                AI Honey Productivity
              </h1>
            </div>

            <p className="text-slate-400 mt-2">
              AI-powered honey yield prediction based on hive telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedHive}
              onChange={(e) => setSelectedHive(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
            >
              {hives.map((hive) => (
                <option key={hive.id} value={hive.id}>
                  {hive.hive_code || hive.hive_number || `Hive #${hive.id}`}
                </option>
              ))}
            </select>

            <button
              onClick={generatePrediction}
              disabled={loading || !selectedHive}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2.5 rounded-lg transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Predicting..." : "Generate Prediction"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4">
            {error}
          </div>
        )}

        {!prediction ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <Brain className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">
              No productivity prediction yet
            </h2>
            <p className="text-slate-400 mt-2">
              Generate a prediction using the latest hive telemetry.
            </p>
          </div>
        ) : (
          <>
            {/* Main Prediction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Honey */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">
                    Predicted Honey
                  </span>
                  <span className="text-2xl">🍯</span>
                </div>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {prediction.predicted_honey_kg}
                  </span>
                  <span className="text-slate-400 ml-2">kg</span>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Expected production under current conditions
                </p>
              </div>

              {/* Productivity */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">
                    Productivity Level
                  </span>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>

                <div
                  className={`text-3xl font-bold mt-5 ${productivityClass}`}
                >
                  {prediction.productivity_level}
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Based on recent hive conditions
                </p>
              </div>

              {/* Confidence */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">
                    Confidence
                  </span>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>

                <div className="text-3xl font-bold text-white mt-5">
                  {prediction.confidence_score}%
                </div>

                <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{
                      width: `${prediction.confidence_score}%`,
                    }}
                  />
                </div>
              </div>

              {/* Weight Trend */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">
                    Weight Trend
                  </span>

                  {prediction.weight_trend >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>

                <div
                  className={`text-3xl font-bold mt-5 ${
                    prediction.weight_trend >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {prediction.weight_trend > 0 ? "+" : ""}
                  {prediction.weight_trend}
                  <span className="text-base text-slate-400 ml-1">
                    kg
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Change across recent readings
                </p>
              </div>
            </div>

            {/* Environmental Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Telemetry Factors
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-6 h-6 text-orange-400" />
                    <div>
                      <p className="text-slate-400 text-sm">
                        Average Temperature
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {prediction.average_temperature}°C
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-slate-400 text-sm">
                        Average Humidity
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {prediction.average_humidity}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    <div>
                      <p className="text-slate-400 text-sm">
                        Bee Activity
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {prediction.average_bee_activity}%
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Chart + Factors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Prediction History */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Prediction History
                  </h2>
                </div>

                {historyChartData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                        />

                        <XAxis
                          dataKey="time"
                          stroke="#94a3b8"
                          fontSize={12}
                        />

                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                        />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="honey"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          name="Honey kg"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-500">
                    No history available
                  </div>
                )}
              </div>

              {/* Influencing Factors */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Influencing Factors
                  </h2>
                </div>

                <div className="space-y-3">
                  {influencingFactors.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-slate-800/60 rounded-xl p-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        {factor}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-300">
                    <strong>Prototype note:</strong> This AI prediction is
                    an explainable rule-based estimate using recent hive
                    telemetry. It is not a guaranteed harvest quantity.
                  </p>
                </div>
              </div>

            </div>

            {/* Timestamp */}
            <div className="text-right text-xs text-slate-500">
              Last prediction:{" "}
              {new Date(prediction.predicted_at).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}