import { useEffect, useRef, useState } from "react";

import {
  Package,
  Link,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import { api } from "../services/api";


export default function HoneyTraceabilityPage() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [batches, setBatches] = useState([]);

  const [selectedBatch, setSelectedBatch] =
    useState("");

  const [chain, setChain] =
    useState([]);

  const [verification, setVerification] =
    useState(null);

  const [qrData, setQrData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const requestIdRef =
    useRef(0);


  // ==========================================================
  // CURRENT USER
  // ==========================================================

  const storedUser =
    localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    currentUser = null;
  }

  const isBeekeeper =
    currentUser?.role === "beekeeper";

  const isCustomer =
    currentUser?.role === "customer";


  // ==========================================================
  // LOAD HONEY BATCHES
  // ==========================================================

  const loadBatches = async () => {

    try {

      setError("");

      const data =
        await api.getHoneyBatches();

      console.log(
        "HONEY BATCHES:",
        data
      );

      const batchList =
        Array.isArray(data)
          ? data
          : [];

      setBatches(batchList);

      if (batchList.length > 0) {

        setSelectedBatch(
          (current) => {

            const currentExists =
              batchList.some(
                (batch) =>
                  String(batch.id) ===
                  String(current)
              );

            if (
              current &&
              currentExists
            ) {
              return current;
            }

            return String(
              batchList[0].id
            );
          }
        );

      } else {

        setSelectedBatch("");

        setChain([]);

        setVerification(null);

        setQrData(null);
      }

    } catch (err) {

      console.error(
        "LOAD BATCHES ERROR:",
        err
      );

      setError(
        err.message ||
        "Failed to load honey batches."
      );

    } finally {

      setInitialLoading(false);
    }
  };


  // ==========================================================
  // LOAD BLOCKCHAIN TRACEABILITY
  // ==========================================================

  const loadTraceability =
    async (batchId) => {

      if (!batchId) {

        setChain([]);

        setVerification(null);

        return;
      }

      const currentRequestId =
        ++requestIdRef.current;

      try {

        setLoading(true);

        setError("");

        setMessage("");

        console.log(
          "============================================"
        );

        console.log(
          "LOADING BLOCKCHAIN FOR BATCH:",
          batchId
        );

        console.log(
          "REQUEST ID:",
          currentRequestId
        );


        // ----------------------------------------------------
        // GET CHAIN
        // ----------------------------------------------------

        const chainResponse =
          await api.getBlockchainRecords(
            batchId
          );

        console.log(
          "CHAIN API RESPONSE:",
          chainResponse
        );

        console.log(
          "CHAIN IS ARRAY:",
          Array.isArray(chainResponse)
        );

        console.log(
          "CHAIN LENGTH:",
          Array.isArray(chainResponse)
            ? chainResponse.length
            : "not-array"
        );


        if (
          currentRequestId !==
          requestIdRef.current
        ) {

          console.log(
            "IGNORING STALE CHAIN RESPONSE:",
            currentRequestId
          );

          return;
        }


        let chainData = [];

        if (
          Array.isArray(chainResponse)
        ) {

          chainData =
            chainResponse;

        } else if (
          Array.isArray(
            chainResponse?.records
          )
        ) {

          chainData =
            chainResponse.records;
        }


        console.log(
          "FINAL CHAIN DATA:",
          chainData
        );

        setChain(chainData);


        // ----------------------------------------------------
        // VERIFY CHAIN
        // ----------------------------------------------------

        const verifyResponse =
          await api.verifyBlockchainBatch(
            batchId
          );

        console.log(
          "VERIFY API RESPONSE:",
          verifyResponse
        );


        if (
          currentRequestId !==
          requestIdRef.current
        ) {

          console.log(
            "IGNORING STALE VERIFY RESPONSE:",
            currentRequestId
          );

          return;
        }


        setVerification(
          verifyResponse
        );

        console.log(
          "BLOCKCHAIN TRACEABILITY LOADED SUCCESSFULLY"
        );

        console.log(
          "RECORDS:",
          chainData.length
        );

        console.log(
          "VERIFIED:",
          verifyResponse?.verified
        );

      } catch (err) {

        console.error(
          "BLOCKCHAIN TRACEABILITY ERROR:",
          err
        );


        if (
          currentRequestId !==
          requestIdRef.current
        ) {
          return;
        }


        setChain([]);

        setVerification(null);

        setError(
          err.message ||
          "Failed to load blockchain traceability data."
        );

      } finally {

        if (
          currentRequestId ===
          requestIdRef.current
        ) {

          setLoading(false);
        }
      }
    };


  // ==========================================================
  // GENERATE QR
  // BEEKEEPER ONLY
  // ==========================================================

  const generateQR =
    async () => {

      if (!selectedBatch) {
        return;
      }

      try {

        setLoading(true);

        setError("");

        setMessage("");


        const data =
          await api.generateQRCode(
            selectedBatch
          );

        console.log(
          "QR RESPONSE:",
          data
        );


        setQrData(data);


        setMessage(
          "QR verification record generated successfully."
        );

      } catch (err) {

        console.error(
          "QR ERROR:",
          err
        );

        setError(
          err.message ||
          "Failed to generate QR code."
        );

      } finally {

        setLoading(false);
      }
    };


  // ==========================================================
  // LOAD EXISTING QR
  // BEEKEEPER + CUSTOMER
  // ==========================================================

  const loadExistingQR =
    async (batchId) => {

      if (!batchId) {

        setQrData(null);

        return;
      }

      try {

        const data =
          await api.getQRCode(
            batchId
          );

        console.log(
          "EXISTING QR:",
          data
        );

        setQrData(data);

      } catch (err) {

        // 404 simply means that the
        // beekeeper has not generated
        // a QR for this batch yet.

        console.log(
          "NO EXISTING QR FOR BATCH:",
          batchId
        );

        setQrData(null);
      }
    };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshPage =
    async () => {

      setMessage("");

      setError("");

      await loadBatches();
    };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadBatches();

  }, []);


  // ==========================================================
  // LOAD DATA WHEN BATCH CHANGES
  // ==========================================================

  useEffect(() => {

    if (!selectedBatch) {

      setChain([]);

      setVerification(null);

      setQrData(null);

      return;
    }


    // Clear old batch information.

    setChain([]);

    setVerification(null);

    setQrData(null);


    // Load blockchain.

    loadTraceability(
      selectedBatch
    );


    // Load existing QR.

    loadExistingQR(
      selectedBatch
    );

  }, [selectedBatch]);


  // ==========================================================
  // SELECTED BATCH
  // ==========================================================

  const selectedBatchData =
    batches.find(
      (batch) =>
        String(batch.id) ===
        String(selectedBatch)
    );


  // ==========================================================
  // INITIAL LOADING
  // ==========================================================

  if (initialLoading) {

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">

        <div className="text-center">

          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">

            <Package className="w-7 h-7 text-amber-400 animate-pulse" />

          </div>


          <h2 className="text-lg font-bold text-slate-100">

            Loading honey traceability

          </h2>


          <p className="text-sm text-slate-500 mt-1">

            Connecting to the Honey Chain ledger...

          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (

    <div className="min-h-full bg-slate-950 text-slate-100">

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 space-y-6">


        {/* ==================================================
            HERO
        ================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl">

          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="absolute right-20 bottom-0 w-56 h-56 rounded-full bg-yellow-400/5 blur-3xl" />


          <div className="relative p-7 md:p-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

              <div className="max-w-3xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-[0.16em]">

                  <Link className="w-3.5 h-3.5" />

                  Supply Chain Ledger

                </div>


                <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white">

                  Honey Traceability

                </h1>


                <p className="mt-3 text-sm md:text-base leading-7 text-slate-300 max-w-2xl">

                  Track registered honey batches from harvest through
                  processing, packaging, blockchain verification, and
                  consumer QR verification.

                </p>


                <div className="flex flex-wrap gap-3 mt-6">

                  <div className="flex items-center gap-2 text-xs text-slate-300">

                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                    Batch records

                  </div>


                  <div className="flex items-center gap-2 text-xs text-slate-300">

                    <ShieldCheck className="w-4 h-4 text-amber-400" />

                    Blockchain verification

                  </div>


                  <div className="flex items-center gap-2 text-xs text-slate-300">

                    <QrCode className="w-4 h-4 text-yellow-400" />

                    Consumer QR identity

                  </div>

                </div>

              </div>


              <button
                onClick={refreshPage}
                disabled={loading}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-all"
              >

                <RefreshCw
                  className={`w-4 h-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh

              </button>

            </div>

          </div>

        </section>


        {/* ==================================================
            MESSAGES
        ================================================== */}

        {message && (

          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-300">

            <CheckCircle2 className="w-5 h-5 shrink-0" />

            <span>{message}</span>

          </div>

        )}


        {error && (

          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300">

            <AlertCircle className="w-5 h-5 shrink-0" />

            <span>{error}</span>

          </div>

        )}


        {/* ==================================================
            BATCH SELECTOR
        ================================================== */}

        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <Package className="w-5 h-5 text-amber-400" />

            <div>

              <h2 className="text-lg font-semibold text-slate-100">

                Select Honey Batch

              </h2>

              <p className="text-xs text-slate-500 mt-0.5">

                Choose a registered batch to inspect its traceability record.

              </p>

            </div>

          </div>


          {batches.length > 0 ? (

            <select
              value={selectedBatch}
              onChange={(event) =>
                setSelectedBatch(
                  event.target.value
                )
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-amber-500"
            >

              {batches.map(
                (batch) => (

                  <option
                    key={batch.id}
                    value={batch.id}
                  >

                    {batch.batch_code ||
                      `Batch #${batch.id}`}{" "}

                    —{" "}

                    {batch.quantity_kg ?? 0}

                    {" "}kg

                  </option>

                )
              )}

            </select>

          ) : (

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-5">

              <p className="text-slate-400">

                No honey batches have been registered yet.

              </p>

              <p className="text-xs text-slate-600 mt-1">

                Create a honey batch first to display traceability information.

              </p>

            </div>

          )}

        </section>


        {/* ==================================================
            SELECTED BATCH
        ================================================== */}

        {selectedBatchData && (

          <>


            {/* ==================================================
                BATCH OVERVIEW
            ================================================== */}

            <section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">


                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Batch Code

                  </p>

                  <p className="text-lg font-bold text-slate-100 mt-2">

                    {selectedBatchData.batch_code ||
                      `Batch #${selectedBatchData.id}`}

                  </p>

                </div>


                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Quantity

                  </p>

                  <p className="text-lg font-bold text-slate-100 mt-2">

                    {selectedBatchData.quantity_kg ?? 0}

                    {" "}kg

                  </p>

                </div>


                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Processing

                  </p>

                  <p className="text-lg font-bold text-slate-100 mt-2">

                    {selectedBatchData.processing_status ||
                      "Not recorded"}

                  </p>

                </div>


                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Packaging

                  </p>

                  <p className="text-lg font-bold text-slate-100 mt-2">

                    {selectedBatchData.packaging_status ||
                      "Not recorded"}

                  </p>

                </div>


              </div>

            </section>


            {/* ==================================================
                BLOCKCHAIN
            ================================================== */}

            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">


              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">


                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">

                    <Link className="w-5 h-5 text-amber-400" />

                  </div>


                  <div>

                    <h2 className="text-lg font-semibold text-slate-100">

                      Blockchain Traceability

                    </h2>


                    <p className="text-sm text-slate-400">

                      Tamper-evident history of recorded batch events.

                    </p>

                  </div>

                </div>


                {verification && (

                  verification.verified ? (

                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm">

                      <CheckCircle2 className="w-5 h-5" />

                      Chain Verified

                    </div>

                  ) : (

                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm">

                      <AlertCircle className="w-5 h-5" />

                      Verification Failed

                    </div>

                  )

                )}

              </div>


              {chain.length > 0 ? (

                <div className="space-y-4">

                  {chain.map(
                    (record, index) => (

                      <div
                        key={
                          record.id ??
                          index
                        }
                        className="bg-slate-950/70 border border-slate-800 rounded-xl p-4"
                      >


                        <div className="flex items-center justify-between gap-4 mb-4">


                          <div className="flex items-center gap-3">


                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">

                              <span className="text-amber-400 font-bold">

                                {index + 1}

                              </span>

                            </div>


                            <div>

                              <p className="text-slate-100 font-semibold">

                                {record.event_type ||
                                  "Traceability Event"}

                              </p>


                              <p className="text-xs text-slate-500">

                                Record #{record.id ?? "—"}

                              </p>

                            </div>

                          </div>


                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />

                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">


                          <div>

                            <p className="text-slate-500">

                              Previous Hash

                            </p>


                            <p className="text-slate-400 break-all mt-1 font-mono">

                              {record.previous_hash ||
                                "Genesis record"}

                            </p>

                          </div>


                          <div>

                            <p className="text-slate-500">

                              Current Hash

                            </p>


                            <p className="text-slate-400 break-all mt-1 font-mono">

                              {record.current_hash ||
                                "Not available"}

                            </p>

                          </div>


                        </div>


                        {/* EVENT DATA */}

                        {record.event_data && (

                          <div className="mt-4 pt-4 border-t border-slate-800">

                            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">

                              Event Details

                            </p>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">


                              {(() => {

                                let eventData = {};

                                try {

                                  eventData =
                                    typeof record.event_data ===
                                    "string"

                                      ? JSON.parse(
                                          record.event_data
                                        )

                                      : record.event_data;

                                } catch {

                                  eventData = {
                                    description:
                                      record.event_data,
                                  };

                                }


                                return Object.entries(
                                  eventData
                                ).map(
                                  ([key, value]) => (

                                    <div
                                      key={key}
                                      className="bg-slate-900/70 rounded-lg p-3"
                                    >

                                      <p className="text-[11px] text-slate-500 uppercase">

                                        {key.replace(
                                          /_/g,
                                          " "
                                        )}

                                      </p>

                                      <p className="text-sm text-slate-300 mt-1">

                                        {String(
                                          value
                                        )}

                                      </p>

                                    </div>

                                  )
                                );

                              })()}

                            </div>

                          </div>

                        )}


                        {/* TIMESTAMP */}

                        {record.recorded_at && (

                          <div className="mt-4 text-xs text-slate-600">

                            Recorded:{" "}

                            {new Date(
                              record.recorded_at
                            ).toLocaleString()}

                          </div>

                        )}

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-6 text-center">

                  <Link className="w-8 h-8 text-slate-600 mx-auto mb-3" />

                  <p className="text-slate-400 font-medium">

                    No blockchain records found for this batch.

                  </p>

                  <p className="text-xs text-slate-600 mt-1">

                    Blockchain events will appear here once they are recorded.

                  </p>

                </div>

              )}

            </section>


            {/* ==================================================
                QR VERIFICATION
            ================================================== */}

            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">


              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">

                  <QrCode className="w-5 h-5 text-yellow-400" />

                </div>


                <div>

                  <h2 className="text-lg font-semibold text-slate-100">

                    Consumer QR Verification

                  </h2>


                  <p className="text-sm text-slate-400">

                    Verify the identity and traceability of this honey batch.

                  </p>

                </div>

              </div>


              {/* ==================================================
                  BEEKEEPER ACTION
              ================================================== */}

              {isBeekeeper && (

                <button
                  onClick={generateQR}
                  disabled={
                    !selectedBatch ||
                    loading
                  }
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-50 transition-all"
                >

                  <QrCode className="w-5 h-5" />

                  {loading
                    ? "Processing..."
                    : qrData
                    ? "Refresh QR Verification"
                    : "Generate QR Verification"}

                </button>

              )}


              {/* ==================================================
                  CUSTOMER - QR NOT AVAILABLE
              ================================================== */}

              {isCustomer &&
                !qrData && (

                  <div className="rounded-xl bg-slate-950/70 border border-amber-500/20 p-5">

                    <div className="flex items-start gap-3">

                      <QrCode className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />

                      <div>

                        <p className="text-slate-200 font-semibold">

                          QR verification is not available yet

                        </p>


                        <p className="text-sm text-slate-500 mt-1">

                          The beekeeper has not generated a consumer QR
                          identity for this honey batch yet.

                        </p>

                      </div>

                    </div>

                  </div>

                )}


              {/* ==================================================
                  QR DATA
              ================================================== */}

              {qrData && (

                <div className="mt-5 bg-slate-950/70 border border-emerald-500/20 rounded-xl p-5">


                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-5">

                    <CheckCircle2 className="w-5 h-5" />

                    QR Verification Ready

                  </div>


                  <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">


                    {/* QR IMAGE */}

                    <div className="flex flex-col items-center">

                      {(qrData.qr_token ||
                        qrData.token) && (

                        <img
                          src={api.getQRCodeImage(
                            qrData.qr_token ||
                            qrData.token
                          )}
                          alt="Honey batch verification QR code"
                          className="w-52 h-52 bg-white p-3 rounded-xl"
                        />

                      )}

                    </div>


                    {/* QR INFORMATION */}

                    <div className="space-y-4">


                      <div>

                        <p className="text-xs text-slate-500 uppercase tracking-wider">

                          QR Token

                        </p>


                        <p className="text-slate-300 break-all mt-1 font-mono text-xs">

                          {qrData.qr_token ||
                            qrData.token ||
                            "Not available"}

                        </p>

                      </div>


                      <div>

                        <p className="text-xs text-slate-500 uppercase tracking-wider">

                          Verification URL

                        </p>


                        <p className="text-amber-400 break-all mt-1 text-xs">

                          {qrData.verification_url ||
                            "Not available"}

                        </p>

                      </div>


                      {/* OPEN VERIFICATION */}

                      {qrData.verification_url && (

                        <a
                          href={
                            qrData.verification_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-all"
                        >

                          <ShieldCheck className="w-4 h-4" />

                          Open Verification Page

                          <ExternalLink className="w-4 h-4" />

                        </a>

                      )}


                      {/* CUSTOMER INFORMATION */}

                      {isCustomer && (

                        <p className="text-xs text-slate-500 leading-5">

                          This QR was generated by the beekeeper.
                          You can scan it or open the verification
                          page to independently verify this honey batch.

                        </p>

                      )}

                    </div>

                  </div>

                </div>

              )}

            </section>


            {/* ==================================================
                TRUST CARDS
            ================================================== */}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">


              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />

                <h3 className="font-semibold text-slate-100">

                  Blockchain Protected

                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-6">

                  Recorded traceability events can be checked against
                  the blockchain ledger.

                </p>

              </div>


              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

                <QrCode className="w-6 h-6 text-amber-400 mb-3" />

                <h3 className="font-semibold text-slate-100">

                  Unique QR Identity

                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-6">

                  Each generated QR token identifies the selected
                  registered honey batch.

                </p>

              </div>


              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">

                <CheckCircle2 className="w-6 h-6 text-yellow-400 mb-3" />

                <h3 className="font-semibold text-slate-100">

                  Supply Chain Record

                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-6">

                  Batch information can be followed through the recorded
                  Honey Chain supply-chain events.

                </p>

              </div>


            </section>


            {/* ==================================================
                TRACEABILITY NOTE
            ================================================== */}

            <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">

              <div className="flex items-start gap-3">

                <ShieldCheck className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />


                <div>

                  <h3 className="font-semibold text-amber-300">

                    Traceability Note

                  </h3>


                  <p className="text-sm text-slate-400 mt-1 leading-6">

                    Blockchain verification confirms the integrity of
                    the recorded traceability events. QR verification
                    identifies the corresponding registered batch.
                    Chemical purity or adulteration still requires
                    appropriate laboratory testing.

                  </p>

                </div>

              </div>

            </section>


          </>

        )}

      </div>

    </div>

  );
}