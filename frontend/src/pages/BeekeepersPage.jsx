import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Hexagon,
  RefreshCw,
  Box,
  Calendar,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { api } from "../services/api";

export default function BeekeepersPage({ onNavigateToHives }) {
  const [beekeepers, setBeekeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBeekeeper, setSelectedBeekeeper] = useState(null);
  const [beekeeperDetail, setBeekeeperDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    beekeeper_code: "",
    name: "",
    phone: "",
    location: "",
    status: "active",
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // FETCH BEEKEEPERS
  // =========================================================

  const fetchBeekeepers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.getBeekeepers();

      setBeekeepers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch beekeepers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeekeepers();
  }, []);

  // =========================================================
  // GENERATE SEQUENTIAL BEEKEEPER CODE
  // =========================================================

  const generateBeekeeperCode = () => {
    const usedNumbers = new Set(
      beekeepers
        .map((b) => {
          const match = String(b.beekeeper_code || "").match(
            /^BK-2026-(\d+)$/
          );

          return match ? Number(match[1]) : null;
        })
        .filter((n) => n !== null)
    );

    // Start from 001
    let nextNumber = 1;

    // Find the first unused number
    while (usedNumbers.has(nextNumber)) {
      nextNumber += 1;
    }

    return `BK-2026-${String(nextNumber).padStart(3, "0")}`;
  };

  // =========================================================
  // CREATE MODAL
  // =========================================================

  const handleOpenCreateModal = () => {
    setFormData({
      beekeeper_code: generateBeekeeperCode(),
      name: "",
      phone: "",
      location: "",
      status: "active",
    });

    setFormError("");
    setIsCreateModalOpen(true);
  };

  // =========================================================
  // CREATE BEEKEEPER
  // =========================================================

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.location.trim() ||
      !formData.beekeeper_code.trim()
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      await api.createBeekeeper({
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        beekeeper_code: formData.beekeeper_code.trim(),
      });

      setIsCreateModalOpen(false);

      await fetchBeekeepers();
    } catch (err) {
      console.error(err);
      setFormError(
        err.message || "Failed to register beekeeper."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleViewDetail = async (id) => {
    try {
      setSelectedBeekeeper(id);
      setBeekeeperDetail(null);
      setLoadingDetail(true);

      const data = await api.getBeekeeper(id);

      setBeekeeperDetail(data);
    } catch (err) {
      console.error(err);

      alert(`Error fetching details: ${err.message}`);

      setSelectedBeekeeper(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredBeekeepers = beekeepers.filter((b) => {
    const query = searchQuery.toLowerCase().trim();

    return (
      (b.name || "").toLowerCase().includes(query) ||
      (b.beekeeper_code || "").toLowerCase().includes(query) ||
      (b.location || "").toLowerCase().includes(query)
    );
  });

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalHives = beekeepers.reduce(
    (acc, b) => acc + Number(b.hives_count || 0),
    0
  );

  const activeBeekeepers = beekeepers.filter(
    (b) => b.status === "active"
  ).length;

  const activeRate =
    beekeepers.length > 0
      ? Math.round(
          (activeBeekeepers / beekeepers.length) * 100
        )
      : 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7f1df] text-slate-800">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <section className="relative overflow-hidden bg-slate-900">

        <div className="absolute inset-0 opacity-20">

          <div className="absolute -right-20 -top-32 w-96 h-96 rounded-full bg-amber-400 blur-3xl" />

          <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full bg-orange-500 blur-3xl" />

        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            <div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-300/20 text-amber-300 text-xs font-bold uppercase tracking-widest">

                <Users className="w-4 h-4" />

                Producer Registry

              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white mt-5 tracking-tight">

                Beekeeper Management

              </h1>

              <p className="text-slate-300 mt-4 max-w-2xl text-base leading-relaxed">

                Register, monitor and manage rural beekeepers across
                Honey Chain's connected apiary network.

              </p>

              <div className="flex flex-wrap gap-3 mt-6">

                <HeaderPill
                  icon={<ShieldCheck />}
                  text="Verified Producers"
                />

                <HeaderPill
                  icon={<Box />}
                  text="Hive Management"
                />

                <HeaderPill
                  icon={<MapPin />}
                  text="Regional Tracking"
                />

              </div>

            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 shrink-0"
            >

              <UserPlus className="w-5 h-5" />

              Register New Beekeeper

            </button>

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <SummaryCard
            title="Total Beekeepers"
            value={beekeepers.length}
            description="Registered rural producers"
            icon={<Users />}
          />

          <SummaryCard
            title="Registered Hives"
            value={totalHives}
            description="Hives connected to producers"
            icon={<Box />}
          />

          <SummaryCard
            title="Active Status Rate"
            value={`${activeRate}%`}
            description="Currently active producers"
            icon={<CheckCircle2 />}
            positive
          />

        </section>

        {/* ================================================= */}
        {/* SEARCH TOOLBAR */}
        {/* ================================================= */}

        <section className="mt-8 bg-white rounded-2xl border border-amber-100 shadow-sm p-5">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <p className="text-xs uppercase tracking-widest font-black text-amber-700">
                Beekeeper Directory
              </p>

              <h2 className="text-xl font-black text-slate-900 mt-1">
                Registered Producers
              </h2>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <div className="relative w-full sm:w-80">

                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search name, code or location..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full bg-[#fffaf0] border border-amber-100 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />

              </div>

              <button
                onClick={fetchBeekeepers}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-slate-700 font-bold text-sm transition"
              >

                <RefreshCw
                  className={`w-4 h-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                Refresh

              </button>

            </div>

          </div>

          {searchQuery && (
            <div className="mt-4 text-xs text-slate-500">

              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredBeekeepers.length}
              </span>{" "}
              matching beekeeper
              {filteredBeekeepers.length !== 1
                ? "s"
                : ""}.

            </div>
          )}

        </section>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="mt-6 bg-white rounded-2xl border border-amber-100 shadow-sm p-16 text-center">

            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">

              <RefreshCw className="w-7 h-7 text-amber-600 animate-spin" />

            </div>

            <h3 className="text-lg font-black text-slate-900 mt-5">
              Loading Beekeeper Registry
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Connecting to the Honey Chain backend...
            </p>

          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {!loading && error && (
          <div className="mt-6 bg-white rounded-2xl border border-red-200 shadow-sm p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">

              <AlertCircle className="w-7 h-7 text-red-500" />

            </div>

            <h3 className="text-lg font-black text-slate-900 mt-5">
              Unable to Load Registry
            </h3>

            <p className="text-sm text-red-600 mt-2">
              {error}
            </p>

            <button
              onClick={fetchBeekeepers}
              className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredBeekeepers.length === 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-amber-100 shadow-sm p-16 text-center">

              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">

                <Users className="w-8 h-8 text-amber-600" />

              </div>

              <h3 className="text-xl font-black text-slate-900 mt-5">
                No Beekeepers Found
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">

                {searchQuery
                  ? "No registered beekeeper matches your search."
                  : "Start building the producer registry by registering your first beekeeper."}

              </p>

              {!searchQuery && (
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition"
                >

                  <UserPlus className="w-4 h-4" />

                  Register First Beekeeper

                </button>
              )}

            </div>
          )}

        {/* ================================================= */}
        {/* BEEKEEPER CARDS */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredBeekeepers.length > 0 && (

            <section className="mt-6">

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                {filteredBeekeepers.map((b) => (
                  <BeekeeperCard
                    key={b.id}
                    beekeeper={b}
                    onView={() => handleViewDetail(b.id)}
                  />
                ))}

              </div>

            </section>

          )}

      </main>

      {/* ================================================= */}
      {/* CREATE BEEKEEPER MODAL */}
      {/* ================================================= */}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

            {/* Modal Header */}

            <div className="bg-slate-900 px-6 py-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center">

                  <UserPlus className="w-5 h-5 text-slate-950" />

                </div>

                <div>

                  <p className="text-xs uppercase tracking-widest font-bold text-amber-300">
                    Producer Registration
                  </p>

                  <h3 className="text-xl font-black text-white mt-1">
                    Register New Beekeeper
                  </h3>

                </div>

              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleCreateSubmit}
              className="p-6 space-y-5"
            >

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">

                  <AlertCircle className="w-4 h-4 shrink-0" />

                  <span>{formError}</span>

                </div>
              )}

              {/* BEEKEEPER CODE */}

              <FormField label="Beekeeper Unique Code">

                <input
                  type="text"
                  required
                  value={formData.beekeeper_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      beekeeper_code: e.target.value,
                    })
                  }
                  className="form-input"
                />

              </FormField>

              {/* NAME */}

              <FormField label="Full Name *">

                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="form-input"
                />

              </FormField>

              {/* PHONE */}

              <FormField label="Phone Number *">

                <input
                  type="text"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="form-input"
                />

              </FormField>

              {/* LOCATION */}

              <FormField label="Apiary Location / District *">

                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Telangana"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value,
                    })
                  }
                  className="form-input"
                />

              </FormField>

              {/* STATUS */}

              <FormField label="Status">

                <select
                  value={formData.status || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="form-input"
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="pending">
                    Pending Audit
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

              </FormField>

              {/* ACTIONS */}

              <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setIsCreateModalOpen(false)
                  }
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-black text-sm transition inline-flex items-center justify-center gap-2"
                >

                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />

                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />

                      Register Beekeeper
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* BEEKEEPER DETAIL MODAL */}
      {/* ================================================= */}

      {selectedBeekeeper && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* Detail Header */}

            <div className="bg-slate-900 px-6 py-6 flex items-center justify-between sticky top-0 z-10">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center">

                  <Hexagon className="w-5 h-5 text-slate-950" />

                </div>

                <div>

                  <p className="text-xs uppercase tracking-widest font-bold text-amber-300">
                    Producer Profile
                  </p>

                  <h3 className="text-xl font-black text-white mt-1">
                    Beekeeper & Apiary Details
                  </h3>

                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedBeekeeper(null)
                }
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* Detail Content */}

            {loadingDetail ? (
              <div className="p-16 text-center">

                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />

                <p className="text-sm font-semibold text-slate-500 mt-4">
                  Loading beekeeper details...
                </p>

              </div>
            ) : beekeeperDetail ? (
              <div className="p-6 space-y-7">

                {/* PROFILE */}

                <div className="bg-[#fffaf0] border border-amber-100 rounded-2xl p-5">

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">

                    <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center shrink-0">

                      <Users className="w-8 h-8 text-slate-950" />

                    </div>

                    <div>

                      <h4 className="text-2xl font-black text-slate-900">
                        {beekeeperDetail.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-2">

                        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                          {beekeeperDetail.beekeeper_code}
                        </span>

                        <StatusBadge
                          status={beekeeperDetail.status}
                        />

                      </div>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <DetailItem
                      icon={<Phone />}
                      label="Phone"
                      value={beekeeperDetail.phone}
                    />

                    <DetailItem
                      icon={<MapPin />}
                      label="Location"
                      value={beekeeperDetail.location}
                    />

                  </div>

                </div>

                {/* HIVES */}

                <div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                    <div>

                      <p className="text-xs uppercase tracking-widest font-black text-amber-700">
                        Apiary Network
                      </p>

                      <h4 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">

                        <Box className="w-5 h-5 text-amber-600" />

                        Registered Hives (
                        {beekeeperDetail.hives?.length || 0}
                        )

                      </h4>

                    </div>

                    {onNavigateToHives && (
                      <button
                        onClick={() => {
                          setSelectedBeekeeper(null);

                          onNavigateToHives(
                            beekeeperDetail.id
                          );
                        }}
                        className="inline-flex items-center justify-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl transition"
                      >

                        Add Hive

                        <ArrowRight className="w-4 h-4" />

                      </button>
                    )}

                  </div>

                  {!beekeeperDetail.hives ||
                  beekeeperDetail.hives.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">

                      <Box className="w-10 h-10 text-slate-300 mx-auto" />

                      <h5 className="font-black text-slate-700 mt-3">
                        No Hives Registered
                      </h5>

                      <p className="text-sm text-slate-500 mt-1">
                        This beekeeper does not currently
                        have any registered hives.
                      </p>

                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {beekeeperDetail.hives.map((h) => (
                        <div
                          key={h.id}
                          className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <span className="font-mono font-black text-amber-700">
                              {h.hive_code}
                            </span>

                            <StatusBadge
                              status={h.status}
                            />

                          </div>

                          <div className="mt-5 space-y-3">

                            <div>

                              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                                Bee Species
                              </p>

                              <p className="text-sm font-bold text-slate-800 mt-1">
                                {h.bee_species}
                              </p>

                            </div>

                            <div className="flex items-start gap-2">

                              <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />

                              <p className="text-sm text-slate-500">
                                {h.location}
                              </p>

                            </div>

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>

              </div>
            ) : null}

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="border-t border-amber-200 bg-[#efe6ce] mt-10">

        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">

          <div className="flex items-center gap-2 font-black text-slate-800">

            <Hexagon className="w-5 h-5 text-amber-600" />

            Honey Chain

          </div>

          <p className="text-sm text-slate-500">
            Smart Beekeeping • Producer Registry • Hive Management
          </p>

        </div>

      </footer>

    </div>
  );
}

/* ================================================= */
/* HEADER PILL */
/* ================================================= */

function HeaderPill({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold">

      <span className="text-amber-300">

        {React.cloneElement(icon, {
          className: "w-4 h-4",
        })}

      </span>

      {text}

    </div>
  );
}

/* ================================================= */
/* SUMMARY CARD */
/* ================================================= */

function SummaryCard({
  title,
  value,
  description,
  icon,
  positive = false,
}) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 hover:shadow-md transition">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs uppercase tracking-widest font-black text-slate-400">
            {title}
          </p>

          <p
            className={`text-4xl font-black mt-2 ${
              positive
                ? "text-emerald-600"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p className="text-sm text-slate-500 mt-2">
            {description}
          </p>

        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-100 text-amber-700"
          }`}
        >

          {React.cloneElement(icon, {
            className: "w-6 h-6",
          })}

        </div>

      </div>

    </div>
  );
}

/* ================================================= */
/* BEEKEEPER CARD */
/* ================================================= */

function BeekeeperCard({ beekeeper, onView }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

      <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />

      <div className="p-6">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">

              <Users className="w-7 h-7 text-amber-700" />

            </div>

            <div>

              <h3 className="text-xl font-black text-slate-900">
                {beekeeper.name}
              </h3>

              <p className="font-mono text-xs font-bold text-amber-700 mt-1">
                {beekeeper.beekeeper_code}
              </p>

            </div>

          </div>

          <StatusBadge status={beekeeper.status} />

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

          <InfoRow
            icon={<Phone />}
            label="Contact"
            value={beekeeper.phone}
          />

          <InfoRow
            icon={<MapPin />}
            label="Region"
            value={beekeeper.location}
          />

          <InfoRow
            icon={<Box />}
            label="Hives Owned"
            value={`${beekeeper.hives_count || 0} Hives`}
          />

          <InfoRow
            icon={<Calendar />}
            label="Registry"
            value="Honey Chain"
          />

        </div>

        <div className="border-t border-slate-100 mt-6 pt-5 flex items-center justify-between">

          <div className="flex items-center gap-2 text-xs text-slate-500">

            <CheckCircle2 className="w-4 h-4 text-emerald-500" />

            Registered Producer

          </div>

          <button
            onClick={onView}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >

            <Eye className="w-4 h-4" />

            View Hives

            <ArrowRight className="w-3.5 h-3.5" />

          </button>

        </div>

      </div>

    </div>
  );
}

/* ================================================= */
/* STATUS BADGE */
/* ================================================= */

function StatusBadge({ status }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black capitalize ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-100 text-slate-600 border border-slate-200"
      }`}
    >

      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {status || "unknown"}

    </span>
  );
}

/* ================================================= */
/* INFO ROW */
/* ================================================= */

function InfoRow({ icon, label, value }) {
  return (
    <div className="bg-[#fffaf0] rounded-xl p-3.5">

      <div className="flex items-center gap-2">

        <span className="text-amber-600">

          {React.cloneElement(icon, {
            className: "w-4 h-4",
          })}

        </span>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>

      </div>

      <p className="text-sm font-bold text-slate-700 mt-2 break-words">
        {value || "—"}
      </p>

    </div>
  );
}

/* ================================================= */
/* DETAIL ITEM */
/* ================================================= */

function DetailItem({ icon, label, value }) {
  return (
    <div className="bg-white border border-amber-100 rounded-xl p-4">

      <div className="flex items-center gap-2">

        <span className="text-amber-600">

          {React.cloneElement(icon, {
            className: "w-4 h-4",
          })}

        </span>

        <span className="text-xs uppercase tracking-wider font-black text-slate-400">
          {label}
        </span>

      </div>

      <p className="text-sm font-bold text-slate-800 mt-2 break-words">
        {value || "—"}
      </p>

    </div>
  );
}

/* ================================================= */
/* FORM FIELD */
/* ================================================= */

function FormField({ label, children }) {
  return (
    <div>

      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      {React.cloneElement(children, {
        className: `${
          children.props.className || ""
        } w-full bg-[#fffaf0] border border-amber-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300`,
      })}

    </div>
  );
}