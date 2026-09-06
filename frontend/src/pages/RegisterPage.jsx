import React, { useState } from "react";
import { api } from "../services/api";

export default function RegisterPage({ onRegistered, onGoToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("beekeeper");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await api.registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      setSuccess(
        data.message ||
          "Registration successful. You can now sign in."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Give the user a moment to see the success message.
      setTimeout(() => {
        onRegistered();
      }, 1200);

    } catch (error) {
      setError(
        error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1df] via-[#fffaf0] to-[#ead7a7] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="text-center mb-7">

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

        {/* REGISTRATION CARD */}

        <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 p-8">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-900">
              Create your account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Join the MadhuSathya ecosystem
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ROLE */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                I am registering as
              </label>

              <div className="grid grid-cols-2 gap-3">

                {/* BEEKEEPER */}

                <button
                  type="button"
                  onClick={() => setRole("beekeeper")}
                  disabled={loading}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    role === "beekeeper"
                      ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                      : "border-slate-200 bg-slate-50 hover:border-amber-300"
                  }`}
                >

                  <div className="text-2xl mb-1">
                    🐝
                  </div>

                  <div className="font-bold text-slate-900">
                    Beekeeper
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    Manage hives & honey
                  </div>

                </button>

                {/* CUSTOMER */}

                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  disabled={loading}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    role === "customer"
                      ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                      : "border-slate-200 bg-slate-50 hover:border-amber-300"
                  }`}
                >

                  <div className="text-2xl mb-1">
                    👤
                  </div>

                  <div className="font-bold text-slate-900">
                    Customer
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    Explore & verify honey
                  </div>

                </button>

              </div>

            </div>

            {/* NAME */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:opacity-60"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:opacity-60"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            {/* CONFIRM PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm password
              </label>

              <div className="relative">

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-amber-700 hover:text-amber-900"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>

          {/* LOGIN LINK */}

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">

            <p className="text-sm text-slate-500">
              Already have an account?
            </p>

            <button
              type="button"
              onClick={onGoToLogin}
              className="mt-2 font-bold text-amber-700 hover:text-amber-900"
            >
              Sign in
            </button>

          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          AI • IoT • Honey Traceability • Blockchain
        </p>

      </div>
    </div>
  );
}