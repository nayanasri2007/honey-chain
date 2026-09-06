import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Package,
  RefreshCw,
  MapPin,
  CalendarDays,
  Scale,
  Factory,
  Link2,
  UserRound,
  FlaskConical,
  Phone,
  Hexagon,
  Activity,
} from "lucide-react";

const API_BASE = "/api/v1";

export default function QRVerificationPage({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const qrToken =
    token ||
    window.location.pathname.split("/verify/")[1] ||
    new URLSearchParams(window.location.search).get("token");

  const verifyBatch = async () => {
    if (!qrToken) {
      setError("No QR verification token was provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/qr/verify/${qrToken}`
      );

      if (!response.ok) {
        throw new Error("Verification failed.");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Unable to verify this QR code.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyBatch();
  }, [qrToken]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />

          <p className="text-slate-300 text-lg">
            Verifying honey batch...
          </p>

          <p className="text-slate-500 text-sm mt-2">
            Checking beekeeper, hive and traceability records
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !data?.verified) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-slate-900 border border-rose-500/20 rounded-3xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-5" />

          <h1 className="text-3xl font-bold text-white mb-3">
            Verification Failed
          </h1>

          <p className="text-slate-400 mb-7">
            {error || "This QR code could not be verified."}
          </p>

          <button
            onClick={verifyBatch}
            className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const batch = data.batch || {};
  const beekeeper = data.beekeeper || {};
  const hive = data.hive || {};

  const harvestDate = batch.harvest_date
    ? new Date(batch.harvest_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  const installationDate = hive.installation_date
    ? new Date(hive.installation_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-5 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-14 h-14 text-emerald-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Honey Verified
          </h1>

          <p className="text-slate-400 mt-3">
            Honey Chain Consumer Verification
          </p>

          <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            Blockchain Traceability Verified
          </div>
        </div>


        {/* ==================================================
            BEEKEEPER DETAILS
        ================================================== */}

        <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl overflow-hidden shadow-xl">

          <div className="bg-gradient-to-r from-emerald-500/15 to-green-500/5 border-b border-emerald-500/20 px-6 py-6">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <UserRound className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                  Registered Beekeeper
                </p>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  {beekeeper.name || "Not available"}
                </h2>
              </div>

            </div>

          </div>


          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Info
              icon={<UserRound className="w-5 h-5" />}
              label="Beekeeper Code"
              value={beekeeper.beekeeper_code || "Not available"}
            />

            <Info
              icon={<Phone className="w-5 h-5" />}
              label="Contact"
              value={beekeeper.phone || "Not available"}
            />

            <Info
              icon={<MapPin className="w-5 h-5" />}
              label="Location"
              value={beekeeper.location || "Not available"}
            />

            <Info
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Status"
              value={beekeeper.status || "Not available"}
            />

          </div>
        </div>


        {/* ==================================================
            HIVE DETAILS
        ================================================== */}

        <div className="mt-6 bg-slate-900 border border-amber-500/20 rounded-3xl overflow-hidden shadow-xl">

          <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/5 border-b border-amber-500/20 px-6 py-6">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                <Hexagon className="w-7 h-7 text-amber-400" />
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                  Source Hive
                </p>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  {hive.hive_code || "Not available"}
                </h2>
              </div>

            </div>

          </div>


          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Info
              icon={<Hexagon className="w-5 h-5" />}
              label="Hive Code"
              value={hive.hive_code || "Not available"}
            />

            <Info
              icon={<Activity className="w-5 h-5" />}
              label="Bee Species"
              value={hive.bee_species || "Not available"}
            />

            <Info
              icon={<MapPin className="w-5 h-5" />}
              label="Hive Location"
              value={hive.location || "Not available"}
            />

            <Info
              icon={<CalendarDays className="w-5 h-5" />}
              label="Installation Date"
              value={installationDate}
            />

            <Info
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Hive Status"
              value={hive.status || "Not available"}
            />

          </div>
        </div>


        {/* ==================================================
            HONEY BATCH
        ================================================== */}

        <div className="mt-6 bg-slate-900 border border-amber-500/20 rounded-3xl overflow-hidden shadow-xl">

          <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/5 border-b border-amber-500/20 px-6 py-6">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                <Package className="w-7 h-7 text-amber-400" />
              </div>

              <div>

                <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                  Verified Honey Batch
                </p>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  {batch.batch_code || "Verified Batch"}
                </h2>

              </div>

            </div>

          </div>


          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Info
              icon={<Scale className="w-5 h-5" />}
              label="Quantity"
              value={
                batch.quantity_kg !== undefined &&
                batch.quantity_kg !== null
                  ? `${batch.quantity_kg} kg`
                  : "Not available"
              }
            />

            <Info
              icon={<CalendarDays className="w-5 h-5" />}
              label="Harvest Date"
              value={harvestDate}
            />

            <Info
              icon={<Factory className="w-5 h-5" />}
              label="Processing"
              value={batch.processing_status || "Not available"}
            />

            <Info
              icon={<Package className="w-5 h-5" />}
              label="Packaging"
              value={batch.packaging_status || "Not available"}
            />

            <Info
              icon={<MapPin className="w-5 h-5" />}
              label="Storage Location"
              value={batch.storage_location || "Not available"}
            />

            <Info
              icon={<Factory className="w-5 h-5" />}
              label="Extraction Method"
              value={batch.extraction_method || "Not available"}
            />

          </div>
        </div>


        {/* ==================================================
            SUPPLY CHAIN CONNECTION
        ================================================== */}

        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <Link2 className="w-6 h-6 text-amber-400" />

            <div>
              <h3 className="text-xl font-bold">
                Supply Chain Traceability
              </h3>

              <p className="text-sm text-slate-500">
                Verified connection from beekeeper to honey batch
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

            <ChainStep
              number="01"
              title="Beekeeper"
              value={beekeeper.name || "Verified"}
            />

            <ChainStep
              number="02"
              title="Hive"
              value={hive.hive_code || "Verified"}
            />

            <ChainStep
              number="03"
              title="Honey Batch"
              value={batch.batch_code || "Verified"}
            />

            <ChainStep
              number="04"
              title="QR Verification"
              value="Verified"
            />

          </div>

        </div>


        {/* ==================================================
            VERIFICATION TIMELINE
        ================================================== */}

        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <Link2 className="w-6 h-6 text-amber-400" />

            <div>

              <h3 className="text-xl font-bold">
                Traceability Timeline
              </h3>

              <p className="text-sm text-slate-500">
                Recorded supply-chain events
              </p>

            </div>

          </div>


          <TimelineItem
            icon={<UserRound className="w-5 h-5" />}
            title="Beekeeper Registered"
            description={
              beekeeper.name
                ? `${beekeeper.name} • ${beekeeper.beekeeper_code || "Registered beekeeper"}`
                : "Beekeeper information recorded"
            }
            active
          />

          <TimelineItem
            icon={<Hexagon className="w-5 h-5" />}
            title="Hive Registered"
            description={
              hive.hive_code
                ? `${hive.hive_code} • ${hive.bee_species || "Bee colony"}`
                : "Hive information recorded"
            }
            active
          />

          <TimelineItem
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="Honey Harvested"
            description={`Batch ${batch.batch_code || ""} registered`}
            active
          />

          <TimelineItem
            icon={<Factory className="w-5 h-5" />}
            title="Processing Recorded"
            description={
              batch.processing_status ||
              "Processing status recorded"
            }
            active
          />

          <TimelineItem
            icon={<Package className="w-5 h-5" />}
            title="Packaging Status"
            description={
              batch.packaging_status ||
              "Packaging status recorded"
            }
            active
          />

          <TimelineItem
            icon={<MapPin className="w-5 h-5" />}
            title="Storage Location"
            description={
              batch.storage_location ||
              "Storage location recorded"
            }
            active
            last
          />

        </div>


        {/* ==================================================
            TRUST INFORMATION
        ================================================== */}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

          <TrustCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Blockchain Protected"
            text="Recorded traceability events can be verified against the blockchain ledger."
          />

          <TrustCard
            icon={<QrCodeIcon />}
            title="Unique QR Identity"
            text="This QR token is linked to a specific registered honey batch."
          />

          <TrustCard
            icon={<FlaskConical className="w-6 h-6" />}
            title="Quality Testing"
            text="Chemical purity and adulteration require appropriate laboratory testing."
          />

        </div>


        {/* ==================================================
            WHAT VERIFICATION MEANS
        ================================================== */}

        <div className="mt-6 bg-slate-900/80 border border-emerald-500/10 rounded-3xl p-6">

          <h3 className="text-xl font-bold mb-5">
            What does this verification mean?
          </h3>

          <div className="space-y-4">

            <VerificationPoint>
              This QR code is linked to a registered Honey Chain batch.
            </VerificationPoint>

            <VerificationPoint>
              The batch is connected to a registered hive.
            </VerificationPoint>

            <VerificationPoint>
              The hive is connected to the registered beekeeper.
            </VerificationPoint>

            <VerificationPoint>
              The recorded blockchain traceability history has been verified.
            </VerificationPoint>

            <VerificationPoint>
              The batch information can be traced through the recorded supply chain.
            </VerificationPoint>

            <VerificationPoint>
              The displayed information comes from the registered digital record.
            </VerificationPoint>

          </div>

        </div>


        {/* ==================================================
            DISCLAIMER
        ================================================== */}

        <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">

          <div className="flex gap-3">

            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

            <p className="text-sm text-slate-400 leading-relaxed">

              <span className="font-semibold text-amber-400">
                Important:
              </span>{" "}

              QR and blockchain verification confirm the recorded
              traceability information. They do not independently prove
              chemical purity or absence of adulteration. Appropriate
              laboratory testing is required for those claims.

            </p>

          </div>

        </div>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="text-center mt-10 pb-6">

          <div className="text-amber-400 font-black tracking-[0.25em] text-lg">
            HONEY CHAIN
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Smart India Hackathon 2026
          </p>

          <p className="text-xs text-slate-600 mt-1">
            AI • IoT • Blockchain • QR Traceability
          </p>

        </div>

      </div>
    </div>
  );
}


// ============================================================
// INFO CARD
// ============================================================

function Info({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-5">

      <div className="flex items-center gap-3 mb-2">

        <div className="text-amber-400">
          {icon}
        </div>

        <p className="text-xs text-slate-500 uppercase tracking-wider">
          {label}
        </p>

      </div>

      <p className="text-white font-semibold text-lg break-words">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// SUPPLY CHAIN STEP
// ============================================================

function ChainStep({ number, title, value }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4">

      <div className="flex items-center gap-3 mb-3">

        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
          {number}
        </div>

        <p className="text-sm font-semibold text-slate-300">
          {title}
        </p>

      </div>

      <p className="text-white font-bold break-words">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// TIMELINE ITEM
// ============================================================

function TimelineItem({
  icon,
  title,
  description,
  active,
  last,
}) {
  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            active
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {icon}
        </div>

        {!last && (
          <div className="w-px h-10 bg-slate-800 mt-1" />
        )}

      </div>

      <div className="pb-5">

        <h4 className="font-bold text-white">
          {title}
        </h4>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>

      </div>

    </div>
  );
}


// ============================================================
// TRUST CARD
// ============================================================

function TrustCard({ icon, title, text }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h4 className="font-bold text-white mb-2">
        {title}
      </h4>

      <p className="text-sm text-slate-500 leading-relaxed">
        {text}
      </p>

    </div>
  );
}


// ============================================================
// VERIFICATION POINT
// ============================================================

function VerificationPoint({ children }) {
  return (
    <div className="flex gap-3">

      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />

      <p className="text-sm text-slate-400 leading-relaxed">
        {children}
      </p>

    </div>
  );
}


// ============================================================
// QR ICON
// ============================================================

function QrCodeIcon() {
  return (
    <div className="grid grid-cols-2 gap-1 w-5 h-5">

      <div className="border-2 border-current rounded-sm" />

      <div className="bg-current rounded-sm" />

      <div className="bg-current rounded-sm" />

      <div className="border-2 border-current rounded-sm" />

    </div>
  );
}