import React, { useState, useEffect } from 'react';
import {
  Box,
  Plus,
  Search,
  MapPin,
  User,
  Activity,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Hexagon,
  Users,
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import { api } from '../services/api';

export default function HivesPage({ initialBeekeeperId = null }) {
  const [hives, setHives] = useState([]);
  const [beekeepers, setBeekeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBeekeeperFilter, setSelectedBeekeeperFilter] = useState(
    initialBeekeeperId ? String(initialBeekeeperId) : ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHive, setEditingHive] = useState(null);

  const [formData, setFormData] = useState({
    hive_code: '',
    beekeeper_id: '',
    location: '',
    bee_species: 'Apis mellifera',
    status: 'active',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ====================================================================== */
  /* FETCH DATA                                                             */
  /* ====================================================================== */

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [hivesData, beekeepersData] = await Promise.all([
        api.getHives(
          selectedBeekeeperFilter
            ? Number(selectedBeekeeperFilter)
            : null
        ),
        api.getBeekeepers(),
      ]);

      setHives(Array.isArray(hivesData) ? hivesData : []);
      setBeekeepers(Array.isArray(beekeepersData) ? beekeepersData : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch hives data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedBeekeeperFilter]);

  /* ====================================================================== */
  /* SEQUENTIAL HIVE CODE GENERATOR                                         */
  /* ====================================================================== */

  const generateHiveCode = () => {
    const usedNumbers = new Set(
      hives
        .map((hive) => {
          const match = String(hive.hive_code || '').match(
            /^HV-2026-(\d{3})$/
          );

          return match ? Number(match[1]) : null;
        })
        .filter((num) => num !== null)
    );

    let nextNumber = 1;

    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }

    return `HV-2026-${String(nextNumber).padStart(3, '0')}`;
  };

  /* ====================================================================== */
  /* CREATE HIVE                                                            */
  /* ====================================================================== */

  const handleOpenCreateModal = () => {
    const defaultBkId =
      selectedBeekeeperFilter ||
      (beekeepers.length > 0 ? String(beekeepers[0].id) : '');

    setFormData({
      hive_code: generateHiveCode(),
      beekeeper_id: defaultBkId,
      location: '',
      bee_species: 'Apis mellifera',
      status: 'active',
    });

    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (
      !formData.hive_code ||
      !formData.beekeeper_id ||
      !formData.location
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);

      await api.createHive({
        hive_code: formData.hive_code,
        beekeeper_id: Number(formData.beekeeper_id),
        location: formData.location,
        bee_species: formData.bee_species,
        status: formData.status,
      });

      setIsCreateModalOpen(false);

      setFormData({
        hive_code: '',
        beekeeper_id: '',
        location: '',
        bee_species: 'Apis mellifera',
        status: 'active',
      });

      await fetchInitialData();
    } catch (err) {
      setFormError(err.message || 'Failed to register hive.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ====================================================================== */
  /* EDIT HIVE                                                              */
  /* ====================================================================== */

  const handleOpenEditModal = (hive) => {
    setEditingHive(hive);

    setFormData({
      hive_code: hive.hive_code || '',
      beekeeper_id:
        hive.beekeeper_id !== null &&
        hive.beekeeper_id !== undefined
          ? String(hive.beekeeper_id)
          : '',
      location: hive.location || '',
      bee_species: hive.bee_species || 'Apis mellifera',
      status: hive.status || 'active',
    });

    setFormError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.location) {
      setFormError('Location is required.');
      return;
    }

    try {
      setSubmitting(true);

      await api.updateHive(editingHive.id, {
        location: formData.location,
        bee_species: formData.bee_species,
        status: formData.status,
      });

      setEditingHive(null);

      await fetchInitialData();
    } catch (err) {
      setFormError(err.message || 'Failed to update hive.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ====================================================================== */
  /* DELETE HIVE                                                            */
  /* ====================================================================== */

  const handleDeleteHive = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this hive?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteHive(id);
      await fetchInitialData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  /* ====================================================================== */
  /* HELPERS                                                                */
  /* ====================================================================== */

  const getBeekeeperName = (bkId) => {
    const bk = beekeepers.find(
      (b) => Number(b.id) === Number(bkId)
    );

    return bk ? bk.name : `Beekeeper #${bkId}`;
  };

  const getSpeciesShortName = (species) => {
    if (species === 'Apis mellifera') {
      return 'Western Honey Bee';
    }

    if (species === 'Apis cerana') {
      return 'Asiatic Honey Bee';
    }

    if (species === 'Apis dorsata') {
      return 'Giant Rock Bee';
    }

    if (species === 'Apis florea') {
      return 'Little Honey Bee';
    }

    return species || 'Not specified';
  };

  /* ====================================================================== */
  /* FILTERING                                                              */
  /* ====================================================================== */

  const filteredHives = hives.filter((h) => {
    const code = String(h.hive_code || '').toLowerCase();
    const location = String(h.location || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesQuery =
      code.includes(query) ||
      location.includes(query);

    const matchesSpecies =
      !speciesFilter ||
      h.bee_species === speciesFilter;

    const matchesStatus =
      !statusFilter ||
      h.status === statusFilter;

    return (
      matchesQuery &&
      matchesSpecies &&
      matchesStatus
    );
  });

  /* ====================================================================== */
  /* SUMMARY COUNTS                                                         */
  /* ====================================================================== */

  const activeCount = hives.filter(
    (h) => h.status === 'active'
  ).length;

  const maintenanceCount = hives.filter(
    (h) => h.status === 'maintenance'
  ).length;

  const inactiveCount = hives.filter(
    (h) => h.status === 'inactive'
  ).length;

  /* ====================================================================== */
  /* PAGE                                                                   */
  /* ====================================================================== */

  return (
    <div className="min-h-full bg-[#f8f4ea] text-slate-800">

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 space-y-7">

        {/* ================================================================ */}
        {/* HERO                                                             */}
        {/* ================================================================ */}

        <section className="relative overflow-hidden rounded-3xl bg-[#17231c] shadow-xl">

          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="absolute right-10 bottom-0 w-48 h-48 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="relative p-7 md:p-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

              <div className="max-w-3xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-[0.16em]">

                  <Hexagon className="w-3.5 h-3.5" />

                  Colony Operations

                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white">
                  Hive Management
                </h1>

                <p className="mt-3 text-sm md:text-base leading-7 text-slate-300 max-w-2xl">
                  Register and manage honey bee colonies, connect
                  every hive to its beekeeper, and maintain reliable
                  field-level traceability across your apiary network.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">

                  <div className="flex items-center gap-2 text-xs text-slate-300">

                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                    Registered colonies

                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">

                    <Activity className="w-4 h-4 text-amber-400" />

                    Operational status

                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">

                    <MapPin className="w-4 h-4 text-yellow-400" />

                    Field traceability

                  </div>

                </div>

              </div>

              <button
                onClick={handleOpenCreateModal}
                disabled={beekeepers.length === 0}
                className={`shrink-0 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  beekeepers.length === 0
                    ? 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 shadow-lg shadow-amber-500/20'
                }`}
              >

                <Plus className="w-5 h-5" />

                Register New Hive

              </button>

            </div>

          </div>

        </section>

        {/* ================================================================ */}
        {/* BEEKEEPER WARNING                                                */}
        {/* ================================================================ */}

        {beekeepers.length === 0 && !loading && (

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center gap-3 text-sm text-amber-800">

            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />

            <span>
              You need to register at least one beekeeper before
              registering a hive.
            </span>

          </div>

        )}

        {/* ================================================================ */}
        {/* SUMMARY CARDS                                                    */}
        {/* ================================================================ */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <SummaryCard
            icon={<Box className="w-5 h-5" />}
            label="Total Hives"
            value={hives.length}
            description="Registered colonies"
          />

          <SummaryCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Active"
            value={activeCount}
            description="Operational colonies"
            iconClass="text-emerald-600"
            iconBg="bg-emerald-50"
          />

          <SummaryCard
            icon={<Activity className="w-5 h-5" />}
            label="Maintenance"
            value={maintenanceCount}
            description="Require attention"
            iconClass="text-amber-600"
            iconBg="bg-amber-50"
          />

          <SummaryCard
            icon={<ShieldCheck className="w-5 h-5" />}
            label="Inactive"
            value={inactiveCount}
            description="Currently offline"
            iconClass="text-slate-500"
            iconBg="bg-slate-100"
          />

        </section>

        {/* ================================================================ */}
        {/* FILTER BAR                                                       */}
        {/* ================================================================ */}

        <section className="rounded-2xl bg-white border border-[#e9e0cf] shadow-sm p-4">

          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">

            <div className="flex flex-wrap gap-3">

              <FilterSelect
                icon={<User className="w-4 h-4" />}
                value={selectedBeekeeperFilter}
                onChange={(e) =>
                  setSelectedBeekeeperFilter(e.target.value)
                }
              >

                <option value="">
                  All Beekeepers
                </option>

                {beekeepers.map((b) => (

                  <option
                    key={b.id}
                    value={String(b.id)}
                  >
                    {b.name} ({b.beekeeper_code})
                  </option>

                ))}

              </FilterSelect>

              <FilterSelect
                icon={<Leaf className="w-4 h-4" />}
                value={speciesFilter}
                onChange={(e) =>
                  setSpeciesFilter(e.target.value)
                }
              >

                <option value="">
                  All Bee Species
                </option>

                <option value="Apis mellifera">
                  Apis mellifera
                </option>

                <option value="Apis cerana">
                  Apis cerana
                </option>

                <option value="Apis dorsata">
                  Apis dorsata
                </option>

                <option value="Apis florea">
                  Apis florea
                </option>

              </FilterSelect>

              <FilterSelect
                icon={<Activity className="w-4 h-4" />}
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >

                <option value="">
                  All Statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="maintenance">
                  Maintenance
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </FilterSelect>

            </div>

            <div className="flex gap-2 w-full xl:w-auto">

              <div className="relative flex-1 xl:w-72">

                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />

                <input
                  type="text"
                  placeholder="Search hive code or location..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full bg-[#faf8f2] border border-[#e4dbc9] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />

              </div>

              <button
                onClick={fetchInitialData}
                className="px-3.5 rounded-xl border border-[#e4dbc9] bg-[#faf8f2] hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors"
                title="Refresh"
              >

                <RefreshCw
                  className={`w-4 h-4 ${
                    loading ? 'animate-spin' : ''
                  }`}
                />

              </button>

            </div>

          </div>

        </section>

        {/* ================================================================ */}
        {/* RESULTS HEADER                                                   */}
        {/* ================================================================ */}

        {!loading && !error && (

          <div className="flex items-center justify-between px-1">

            <div>

              <p className="text-xs uppercase tracking-[0.15em] font-bold text-amber-700">
                Apiary Registry
              </p>

              <h2 className="text-xl font-black text-slate-800 mt-1">
                Registered Hives
              </h2>

            </div>

            <span className="text-xs font-semibold text-slate-500 bg-white border border-[#e9e0cf] px-3 py-2 rounded-full">

              {filteredHives.length} of {hives.length} colonies

            </span>

          </div>

        )}

        {/* ================================================================ */}
        {/* MAIN CONTENT                                                     */}
        {/* ================================================================ */}

        {loading ? (

          <LoadingState />

        ) : error ? (

          <ErrorState
            error={error}
            onRetry={fetchInitialData}
          />

        ) : filteredHives.length === 0 ? (

          <EmptyState />

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredHives.map((hive) => (

              <HiveCard
                key={hive.id}
                hive={hive}
                beekeeperName={getBeekeeperName(
                  hive.beekeeper_id
                )}
                speciesName={getSpeciesShortName(
                  hive.bee_species
                )}
                onEdit={() =>
                  handleOpenEditModal(hive)
                }
                onDelete={() =>
                  handleDeleteHive(hive.id)
                }
              />

            ))}

          </div>

        )}

        {/* ================================================================ */}
        {/* FOOTER                                                           */}
        {/* ================================================================ */}

        <section className="rounded-2xl bg-[#17231c] p-6 md:p-7 text-white overflow-hidden relative">

          <div className="absolute -right-10 -top-20 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.15em]">

                <Hexagon className="w-4 h-4" />

                Honey Chain Registry

              </div>

              <h3 className="text-lg font-bold mt-2">
                Every hive becomes a traceable source of honey.
              </h3>

              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Hive registration connects beekeeper identity,
                colony location and bee species to future IoT
                monitoring, AI analysis and honey-batch traceability.
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-4 py-3 rounded-xl">

              <Users className="w-4 h-4 text-amber-300" />

              {beekeepers.length} registered beekeeper
              {beekeepers.length !== 1 ? 's' : ''}

            </div>

          </div>

        </section>

      </div>

      {/* ================================================================== */}
      {/* CREATE MODAL                                                       */}
      {/* ================================================================== */}

      {isCreateModalOpen && (

        <HiveModalOverlay>

          <div className="w-full max-w-xl bg-[#fffdf8] rounded-3xl shadow-2xl border border-[#e9dfcb] overflow-hidden">

            <ModalHeader
              icon={<Box className="w-5 h-5" />}
              title="Register New Hive"
              subtitle="Add a colony to the Honey Chain registry"
              onClose={() =>
                setIsCreateModalOpen(false)
              }
            />

            <div className="p-6">

              {formError && (
                <FormError message={formError} />
              )}

              <form
                onSubmit={handleCreateSubmit}
                className="space-y-4"
              >

                <FormField
                  label="Hive Code"
                  required
                >

                  <input
                    type="text"
                    required
                    value={formData.hive_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hive_code: e.target.value,
                      })
                    }
                    className="form-input font-mono font-bold text-amber-700"
                  />

                </FormField>

                <FormField
                  label="Owner Beekeeper"
                  required
                >

                  <select
                    required
                    value={formData.beekeeper_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        beekeeper_id: e.target.value,
                      })
                    }
                    className="form-input"
                  >

                    <option value="">
                      Select beekeeper
                    </option>

                    {beekeepers.map((b) => (

                      <option
                        key={b.id}
                        value={String(b.id)}
                      >
                        {b.name} ({b.beekeeper_code}) -{' '}
                        {b.location}
                      </option>

                    ))}

                  </select>

                </FormField>

                <FormField
                  label="Field Location / Sector"
                  required
                >

                  <input
                    type="text"
                    required
                    placeholder="e.g. North Apiary Field, Box #12"
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

                <FormField label="Bee Species">

                  <select
                    value={formData.bee_species}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bee_species: e.target.value,
                      })
                    }
                    className="form-input"
                  >

                    <option value="Apis mellifera">
                      Apis mellifera (Western Honey Bee)
                    </option>

                    <option value="Apis cerana">
                      Apis cerana (Asiatic Honey Bee)
                    </option>

                    <option value="Apis dorsata">
                      Apis dorsata (Giant Rock Bee)
                    </option>

                    <option value="Apis florea">
                      Apis florea (Little Honey Bee)
                    </option>

                  </select>

                </FormField>

                <FormField label="Hive Operational Status">

                  <select
                    value={formData.status}
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

                    <option value="maintenance">
                      Under Maintenance
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                  </select>

                </FormField>

                <ModalActions
                  cancel={() =>
                    setIsCreateModalOpen(false)
                  }
                  submitting={submitting}
                  submitText="Register Hive"
                />

              </form>

            </div>

          </div>

        </HiveModalOverlay>

      )}

      {/* ================================================================== */}
      {/* EDIT MODAL                                                         */}
      {/* ================================================================== */}

      {editingHive && (

        <HiveModalOverlay>

          <div className="w-full max-w-xl bg-[#fffdf8] rounded-3xl shadow-2xl border border-[#e9dfcb] overflow-hidden">

            <ModalHeader
              icon={<Edit3 className="w-5 h-5" />}
              title="Update Hive"
              subtitle={editingHive.hive_code}
              onClose={() =>
                setEditingHive(null)
              }
            />

            <div className="p-6">

              {formError && (
                <FormError message={formError} />
              )}

              <form
                onSubmit={handleEditSubmit}
                className="space-y-4"
              >

                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">

                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-700">
                    Hive Identity
                  </p>

                  <p className="font-mono font-black text-slate-800 mt-1">
                    {editingHive.hive_code}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">

                    Owner:{' '}

                    {getBeekeeperName(
                      editingHive.beekeeper_id
                    )}

                  </p>

                </div>

                <FormField
                  label="Location / Sector"
                  required
                >

                  <input
                    type="text"
                    required
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

                <FormField label="Bee Species">

                  <select
                    value={formData.bee_species}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bee_species: e.target.value,
                      })
                    }
                    className="form-input"
                  >

                    <option value="Apis mellifera">
                      Apis mellifera (Western Honey Bee)
                    </option>

                    <option value="Apis cerana">
                      Apis cerana (Asiatic Honey Bee)
                    </option>

                    <option value="Apis dorsata">
                      Apis dorsata (Giant Rock Bee)
                    </option>

                    <option value="Apis florea">
                      Apis florea (Little Honey Bee)
                    </option>

                  </select>

                </FormField>

                <FormField label="Operational Status">

                  <select
                    value={formData.status}
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

                    <option value="maintenance">
                      Under Maintenance
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                  </select>

                </FormField>

                <ModalActions
                  cancel={() =>
                    setEditingHive(null)
                  }
                  submitting={submitting}
                  submitText="Save Changes"
                />

              </form>

            </div>

          </div>

        </HiveModalOverlay>

      )}

    </div>
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
  iconClass = 'text-amber-700',
  iconBg = 'bg-amber-50',
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e9e0cf] p-5 shadow-sm hover:shadow-md transition-shadow">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-slate-400">
            {label}
          </p>

          <p className="text-3xl font-black text-slate-800 mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl ${iconBg} ${iconClass} flex items-center justify-center`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* ========================================================================== */
/* FILTER SELECT                                                              */
/* ========================================================================== */

function FilterSelect({
  icon,
  value,
  onChange,
  children,
}) {
  return (
    <div className="flex items-center gap-2 bg-[#faf8f2] border border-[#e4dbc9] rounded-xl px-3 py-2">

      <span className="text-amber-700">
        {icon}
      </span>

      <select
        value={value}
        onChange={onChange}
        className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none max-w-[210px]"
      >
        {children}
      </select>

    </div>
  );
}

/* ========================================================================== */
/* HIVE CARD                                                                  */
/* ========================================================================== */

function HiveCard({
  hive,
  beekeeperName,
  speciesName,
  onEdit,
  onDelete,
}) {
  const isActive = hive.status === 'active';
  const isMaintenance = hive.status === 'maintenance';

  return (
    <article className="group bg-white rounded-3xl border border-[#e9e0cf] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">

      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

      <div className="p-6">

        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">

              <Box className="w-5 h-5" />

            </div>

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400">
                Hive ID
              </p>

              <h3 className="font-mono font-black text-lg text-slate-800 truncate">
                {hive.hive_code}
              </h3>

            </div>

          </div>

          <StatusBadge status={hive.status} />

        </div>

        <div className="mt-6 rounded-2xl bg-[#faf8f2] border border-[#eee6d7] p-4">

          <div className="flex items-center gap-2 mb-2">

            <User className="w-4 h-4 text-amber-700" />

            <span className="text-[10px] uppercase tracking-[0.13em] font-bold text-slate-400">
              Registered Beekeeper
            </span>

          </div>

          <p className="font-bold text-slate-800">
            {beekeeperName}
          </p>

        </div>

        <div className="mt-4 space-y-3">

          <DetailRow
            icon={<Leaf className="w-4 h-4" />}
            label="Bee Species"
            value={speciesName}
            accent
          />

          <DetailRow
            icon={<MapPin className="w-4 h-4" />}
            label="Field Location"
            value={hive.location}
          />

        </div>

        <div className="mt-5 flex items-center gap-2 text-xs">

          {isActive ? (

            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              <span className="text-emerald-700 font-semibold">
                Colony operational
              </span>
            </>

          ) : isMaintenance ? (

            <>
              <Activity className="w-4 h-4 text-amber-600" />

              <span className="text-amber-700 font-semibold">
                Maintenance required
              </span>
            </>

          ) : (

            <>
              <ShieldCheck className="w-4 h-4 text-slate-400" />

              <span className="text-slate-500 font-semibold">
                Colony inactive
              </span>
            </>

          )}

        </div>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#eee6d7]">

          <span className="text-[10px] font-mono text-slate-400">
            Registry #{hive.id}
          </span>

          <div className="flex gap-2">

            <button
              onClick={onEdit}
              className="w-9 h-9 rounded-xl border border-[#e4dbc9] bg-[#faf8f2] hover:bg-amber-50 hover:border-amber-200 text-slate-500 hover:text-amber-700 flex items-center justify-center transition-colors"
              title="Edit Hive"
            >

              <Edit3 className="w-4 h-4" />

            </button>

            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-xl border border-[#e4dbc9] bg-[#faf8f2] hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
              title="Delete Hive"
            >

              <Trash2 className="w-4 h-4" />

            </button>

          </div>

        </div>

      </div>

    </article>
  );
}

/* ========================================================================== */
/* DETAIL ROW                                                                 */
/* ========================================================================== */

function DetailRow({
  icon,
  label,
  value,
  accent = false,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-amber-700 shrink-0">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-400">
          {label}
        </p>

        <p
          className={`text-xs font-semibold mt-1 ${
            accent
              ? 'text-amber-800'
              : 'text-slate-700'
          }`}
        >
          {value || 'Not specified'}
        </p>

      </div>

    </div>
  );
}

/* ========================================================================== */
/* STATUS BADGE                                                               */
/* ========================================================================== */

function StatusBadge({ status }) {
  const active = status === 'active';
  const maintenance = status === 'maintenance';

  return (
    <span
      className={`shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
        active
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : maintenance
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-slate-100 text-slate-500 border border-slate-200'
      }`}
    >
      {status || 'unknown'}
    </span>
  );
}

/* ========================================================================== */
/* LOADING STATE                                                              */
/* ========================================================================== */

function LoadingState() {
  return (
    <div className="bg-white rounded-3xl border border-[#e9e0cf] p-14 text-center shadow-sm">

      <div className="w-14 h-14 rounded-2xl bg-amber-50 mx-auto flex items-center justify-center">

        <RefreshCw className="w-7 h-7 text-amber-600 animate-spin" />

      </div>

      <h3 className="font-bold text-slate-800 mt-4">
        Loading Registered Hives
      </h3>

      <p className="text-xs text-slate-500 mt-1">
        Synchronizing colony registry data...
      </p>

    </div>
  );
}

/* ========================================================================== */
/* ERROR STATE                                                                */
/* ========================================================================== */

function ErrorState({
  error,
  onRetry,
}) {
  return (
    <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center shadow-sm">

      <div className="w-14 h-14 rounded-2xl bg-rose-50 mx-auto flex items-center justify-center">

        <AlertCircle className="w-7 h-7 text-rose-500" />

      </div>

      <h3 className="font-bold text-slate-800 mt-4">
        Unable to Load Hives
      </h3>

      <p className="text-sm text-rose-600 mt-2">
        {error}
      </p>

      <button
        onClick={onRetry}
        className="mt-5 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
      >
        Try Again
      </button>

    </div>
  );
}

/* ========================================================================== */
/* EMPTY STATE                                                                */
/* ========================================================================== */

function EmptyState() {
  return (
    <div className="bg-white rounded-3xl border border-[#e9e0cf] p-14 text-center shadow-sm">

      <div className="w-16 h-16 rounded-2xl bg-amber-50 mx-auto flex items-center justify-center">

        <Box className="w-8 h-8 text-amber-600" />

      </div>

      <h3 className="font-black text-xl text-slate-800 mt-5">
        No Hives Found
      </h3>

      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        No registered hives match the selected search and filter
        criteria.
      </p>

    </div>
  );
}

/* ========================================================================== */
/* MODAL OVERLAY                                                              */
/* ========================================================================== */

function HiveModalOverlay({
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {children}
    </div>
  );
}

/* ========================================================================== */
/* MODAL HEADER                                                               */
/* ========================================================================== */

function ModalHeader({
  icon,
  title,
  subtitle,
  onClose,
}) {
  return (
    <div className="px-6 py-5 border-b border-[#eee6d7] bg-[#faf8f2] flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
          {icon}
        </div>

        <div>

          <h3 className="font-black text-slate-800">
            {title}
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>

        </div>

      </div>

      <button
        onClick={onClose}
        className="w-9 h-9 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
      >

        <X className="w-5 h-5" />

      </button>

    </div>
  );
}

/* ========================================================================== */
/* FORM FIELD                                                                 */
/* ========================================================================== */

function FormField({
  label,
  required,
  children,
}) {
  return (
    <div>

      <label className="block text-xs font-bold text-slate-700 mb-1.5">

        {label}

        {required && (
          <span className="text-amber-600 ml-1">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

/* ========================================================================== */
/* FORM ERROR                                                                 */
/* ========================================================================== */

function FormError({
  message,
}) {
  return (
    <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-xs text-rose-700">

      <AlertCircle className="w-4 h-4 shrink-0" />

      <span>
        {message}
      </span>

    </div>
  );
}

/* ========================================================================== */
/* MODAL ACTIONS                                                              */
/* ========================================================================== */

function ModalActions({
  cancel,
  submitting,
  submitText,
}) {
  return (
    <div className="pt-5 flex justify-end gap-3 border-t border-[#eee6d7] mt-6">

      <button
        type="button"
        onClick={cancel}
        className="px-5 py-2.5 rounded-xl border border-[#e1d8c7] text-slate-600 hover:bg-[#faf8f2] text-xs font-bold transition-colors"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 text-xs font-black shadow-md shadow-amber-500/10 transition-all disabled:opacity-60"
      >

        {submitting
          ? 'Saving...'
          : submitText}

      </button>

    </div>
  );
}