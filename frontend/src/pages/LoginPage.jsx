import React, { useState } from "react";
import { api } from "../services/api";

export default function LoginPage({ onLogin, onGoToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await api.loginUser(email.trim(), password);

      // Store authentication information
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type || "bearer");
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1df] via-[#fffaf0] to-[#ead7a7] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="text-center mb-8">

          <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-amber-500 flex items-center justify-center shadow-xl">
            <span className="text-4xl">🍯</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            MadhuSathya
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Smart Beekeeping & Honey Traceability Platform
          </p>

        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 p-8">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to continue to MadhuSathya
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="beekeeper@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:opacity-60"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-2">

                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>

              </div>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-amber-700 hover:text-amber-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* REGISTER */}
          <div className="mt-7 border-t border-slate-100 pt-6 text-center">

            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={onGoToRegister}
              className="mt-2 font-bold text-amber-700 hover:text-amber-900"
            >
              Create an account
            </button>

          </div>

        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-xs text-slate-500">
          AI • IoT • Honey Traceability • Blockchain
        </p>

      </div>
    </div>
  );
}