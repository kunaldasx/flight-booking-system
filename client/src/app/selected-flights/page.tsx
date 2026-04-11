"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { flightService } from "@/services/flightService";
import { Flight } from "@/types";

interface SelectedFlightRecord {
  _id: string;
  searchId: string;
  flightKey: string;
  fareId: string;
  processedFlightData: Flight | null;
  selectedFareData: any;
  createdAt: string;
}

const navLinkClass =
  "text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors";

const paginationBtnClass =
  "px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

function formatTime(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function formatDateTime(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function SelectedFlightsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<SelectedFlightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchRecords = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await flightService.getSelectedFlights(p, LIMIT);
      setRecords(data.selectedFlights || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load selected flights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(page);
  }, [page, fetchRecords]);

  const handleBook = (record: SelectedFlightRecord) => {
    const flight = record.processedFlightData;
    if (!flight) {
      alert("Flight details unavailable for this record.");
      return;
    }
    localStorage.setItem("selectedFlight", JSON.stringify(flight));
    localStorage.setItem("searchId", record.searchId);
    router.push("/traveller");
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">✈️ Flight Booking System</h1>
          <nav className="flex items-center gap-2">
            <a href="/flights" className={navLinkClass}>
              Search Flights
            </a>
            <a href="/bookings" className={navLinkClass}>
              All Bookings
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Selected Flights
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {total} selection{total !== 1 ? "s" : ""} recorded
            </p>
          </div>
          <button
            onClick={() => fetchRecords(page)}
            className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400">Loading selected flights…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No selected flights yet.</p>

            <a
              href="/flights"
              className="inline-block mt-4 text-blue-600 hover:underline text-sm"
            >
              Go search for flights →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const flight = record.processedFlightData;
              const fare =
                flight?.fares?.find((f) => f.fareId === record.fareId) ??
                flight?.fares?.[0];

              const journeyColor =
                flight?.journeyLabel === "Return"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-indigo-100 text-indigo-800";

              return (
                <div
                  key={record._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* ── Flight details ─────────────────────────────── */}
                    <div className="flex-1">
                      {flight ? (
                        <>
                          {/* Airline row */}
                          <div className="flex items-center gap-2 mb-3">
                            <svg
                              className="w-5 h-5 text-blue-600 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v5.5L2 16v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                            </svg>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {flight.airlineName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {flight.flightNumber}
                              </p>
                            </div>
                            {flight.journeyLabel && (
                              <span
                                className={`ml-1 text-xs px-2 py-0.5 rounded font-medium ${journeyColor}`}
                              >
                                {flight.journeyLabel}
                              </span>
                            )}
                          </div>

                          {/* Route */}
                          <p className="text-xs text-gray-500 mb-3">
                            {flight.routeWithNames}
                          </p>

                          {/* Times */}
                          <div className="flex items-center gap-4 mb-3">
                            <div>
                              <p className="text-base font-bold text-gray-900">
                                {formatTime(flight.departureTime)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {flight.departureAirportName}
                              </p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-xs text-gray-400">
                                {flight.duration}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400">
                                  {flight.stops === 0
                                    ? "Non-stop"
                                    : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                                </span>
                                <div className="flex-1 h-px bg-gray-200" />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-gray-900">
                                {formatTime(flight.arrivalTime)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {flight.arrivalAirportName}
                              </p>
                            </div>
                          </div>

                          {/* Fare strip */}
                          {fare && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 bg-gray-50 rounded px-3 py-2">
                              <span>
                                <span className="text-gray-400">Fare: </span>
                                {fare.brandName}
                              </span>
                              <span>
                                <span className="text-gray-400">
                                  🎒 Cabin:{" "}
                                </span>
                                {fare.cabinBaggage?.quantity
                                  ? `${fare.cabinBaggage.piece}pc · ${fare.cabinBaggage.quantity}${fare.cabinBaggage.unit}`
                                  : "Not included"}
                              </span>
                              <span>
                                <span className="text-gray-400">
                                  🧳 Check-in:{" "}
                                </span>
                                {fare.checkInBaggageAllowed &&
                                fare.checkInBaggage?.quantity
                                  ? `${fare.checkInBaggage.piece}pc · ${fare.checkInBaggage.quantity}${fare.checkInBaggage.unit}`
                                  : fare.checkInBaggageAllowed
                                    ? "Included"
                                    : "Not included"}
                              </span>
                              <span
                                className={
                                  fare.refundable
                                    ? "text-green-600"
                                    : "text-red-500"
                                }
                              >
                                ↩{" "}
                                {fare.refundable
                                  ? "Refundable"
                                  : "Non-refundable"}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Flight details unavailable (legacy record)
                        </p>
                      )}
                    </div>

                    {/* ── Right panel ───────────────────────────────── */}
                    <div className="md:w-48 flex flex-col items-end gap-3 shrink-0">
                      {fare && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ₹
                            {parseFloat(fare.pricePerAdult).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                          <p className="text-xs text-gray-400">per adult</p>
                        </div>
                      )}

                      <div className="text-right text-xs text-gray-400 space-y-0.5">
                        <p className="font-mono text-gray-500 truncate max-w-[11rem]">
                          {record.searchId}
                        </p>
                        <p>{formatDateTime(record.createdAt)}</p>
                      </div>

                      <button
                        onClick={() => handleBook(record)}
                        disabled={!flight}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={paginationBtnClass}
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={paginationBtnClass}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
