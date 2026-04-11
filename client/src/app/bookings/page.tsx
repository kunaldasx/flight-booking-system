/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { flightService } from "@/services/flightService";

interface BookingRecord {
  _id: string;
  bookingId: string;
  searchId: string;
  flightKey: string;
  lockedPrice: string;
  traveller: {
    name: string;
    email: string;
    phone: string;
    dob?: string;
    gender?: string;
    passport?: string;
  };
  flightData: any;
  fareData: any;
  createdAt: string;
}

const formatDateTime = (iso: string) => {
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
};

const StatusBadge = ({ label, color }: { label: string; color: string }) => (
  <span className={`text-xs px-2 py-0.5 rounded font-medium ${color}`}>
    {label}
  </span>
);

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchBookings = useCallback(async (p: number) => {
    setLoading(true);

    try {
      const data = await flightService.getAllBookings(p, LIMIT);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.log("Failed to load bookings.", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(page);
  }, [page, fetchBookings]);

  const totalPages = Math.ceil(total / LIMIT);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">All Bookings</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <p className="text-gray-400">Loading bookings…</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">No bookings yet.</p>

          <a
            href="/flights"
            className="inline-block mt-4 text-blue-600 hover:underline text-sm"
          >
            Search and book a flight →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const isExpanded = expandedId === booking._id;
            const price = parseFloat(booking.lockedPrice) || 0;

            return (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(booking._id)}
                  className="w-full text-left px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded shrink-0">
                      {booking.bookingId}
                    </span>

                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {booking.traveller.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {booking.traveller.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge
                      label="Confirmed"
                      color="bg-green-100 text-green-800"
                    />
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ₹{price.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-400">per adult</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-500">
                        {formatDateTime(booking.createdAt)}
                      </p>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                        Passenger
                      </h4>
                      <table className="text-sm w-full">
                        <tbody>
                          {[
                            ["Name", booking.traveller.name],
                            ["Email", booking.traveller.email],
                            ["Phone", booking.traveller.phone],
                            ["DOB", booking.traveller.dob || "—"],
                            ["Gender", booking.traveller.gender || "—"],
                            [
                              "Passport",
                              booking.traveller.passport || "Not provided",
                            ],
                          ].map(([label, value]) => (
                            <tr key={label}>
                              <td className="py-1 pr-4 text-gray-400 w-24">
                                {label}
                              </td>
                              <td className="py-1 text-gray-900 font-medium">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                        Booking Info
                      </h4>
                      <table className="text-sm w-full">
                        <tbody>
                          {[
                            ["Booking ID", booking.bookingId],
                            ["Search ID", booking.searchId],
                            ["Flight Key", booking.flightKey],
                            [
                              "Price Locked",
                              `₹${price.toLocaleString("en-IN")}`,
                            ],
                            ["Created", formatDateTime(booking.createdAt)],
                          ].map(([label, value]) => (
                            <tr key={label}>
                              <td className="py-1 pr-4 text-gray-400 w-28">
                                {label}
                              </td>
                              <td className="py-1 text-gray-900 font-medium font-mono break-all">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
