/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Flight, FareTier } from "@/types";
import Image from "next/image";
import AirlineLogo from "@/assets/airLineLogo.jpg";

interface BookingDetails {
  bookingId: string;
  lockedPrice: string;
  traveller: {
    name: string;
    email: string;
    phone: string;
    dob?: string;
    gender?: string;
    passport?: string;
  };
  createdAt: string;
}

export default function ConfirmationPage() {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [bookedFlight, setBookedFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingData = localStorage.getItem("booking");
    const flightData = localStorage.getItem("bookedFlight");
    if (bookingData) {
      try {
        setBooking(JSON.parse(bookingData));
      } catch {}
    }
    if (flightData) {
      try {
        setBookedFlight(JSON.parse(flightData));
      } catch {}
    }
    setLoading(false);
  }, []);

  const formatTime = (iso: string) => {
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
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const baggageLabel = (fare: FareTier, type: "cabin" | "checkin") => {
    const b = type === "cabin" ? fare.cabinBaggage : fare.checkInBaggage;
    if (!b || b.quantity === 0) {
      return type === "checkin" && fare.checkInBaggageAllowed
        ? "Included"
        : "Not included";
    }
    return `${b.piece}pc · ${b.quantity}${b.unit}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  // Resolve selected fare from the saved flight
  const selectedFare: FareTier | undefined =
    bookedFlight?.fares?.find((f) => f.fareId === bookedFlight.fareId) ??
    bookedFlight?.fares?.[0];

  const displayPrice = booking?.lockedPrice
    ? parseFloat(booking.lockedPrice).toLocaleString("en-IN")
    : "—";

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 Booking Confirmed!
        </h2>
        <p className="text-gray-600">
          Your flight has been successfully booked.
        </p>
        {booking && (
          <p className="mt-3 font-mono text-lg font-semibold text-blue-700 inline-block px-4 py-2 rounded-lg">
            {booking.bookingId}
          </p>
        )}
      </div>

      {booking && (
        <>
          {bookedFlight && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-3">
                <h3 className="text-2xl font-medium text-gray-800">
                  Flight Details
                </h3>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={AirlineLogo}
                    alt={bookedFlight.airlineName}
                    width={100}
                    height={100}
                  />

                  <div>
                    <p className="font-medium text-gray-900">
                      {bookedFlight.airlineName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {bookedFlight.flightNumber}
                    </p>
                  </div>

                  {bookedFlight.journeyLabel && (
                    <span className="ml-auto text-xs px-2 py-0.5 border rounded text-gray-600">
                      {bookedFlight.journeyLabel}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-0.5">
                  {bookedFlight.route}
                </p>
                <p className="text-xs text-gray-400 mb-5">
                  {bookedFlight.routeWithNames}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Departure</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTime(bookedFlight.departureTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(bookedFlight.departureTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookedFlight.departureAirportName}
                    </p>
                  </div>

                  <div className="text-center self-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {bookedFlight.duration}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {bookedFlight.stops === 0
                          ? "Non-stop"
                          : `${bookedFlight.stops} Stop${bookedFlight.stops > 1 ? "s" : ""}`}
                      </span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Arrival</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTime(bookedFlight.arrivalTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(bookedFlight.arrivalTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookedFlight.arrivalAirportName}
                    </p>
                  </div>
                </div>

                {selectedFare && (
                  <div className="bg-gray-50 rounded px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Fare: </span>
                      <span className="text-gray-800">
                        {selectedFare.brandName}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Cabin: </span>
                      <span>{baggageLabel(selectedFare, "cabin")}</span>
                    </div>

                    <div>
                      <span className="text-gray-500">Check-in: </span>
                      <span>{baggageLabel(selectedFare, "checkin")}</span>
                    </div>

                    {selectedFare.benefits.map((b) => (
                      <div key={b.benefitType}>
                        <span className="text-gray-500">
                          {b.benefitType === "MEAL" ? "Meal: " : "Seat: "}
                        </span>
                        <span>{b.value === "FREE" ? "Free" : "Paid"}</span>
                      </div>
                    ))}

                    <div>
                      <span className="text-gray-500">Refund: </span>
                      <span>
                        {selectedFare.refundable
                          ? "Refundable"
                          : "Non-refundable"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md mt-4">
            <div className=" px-6 py-3">
              <h3 className="text-2xl font-medium text-gray-800">
                Booking Summary
              </h3>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-500 uppercase">
                  Booking Information
                </h4>

                <div>
                  <p className="text-xs text-gray-500">Booking ID</p>
                  <p className="font-mono font-medium text-gray-900">
                    {booking.bookingId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Price Paid</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{displayPrice}
                  </p>
                  <p className="text-xs text-gray-400">per adult</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Booked On</p>
                  <p className="text-gray-900">
                    {new Date(booking.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-500 uppercase">
                  Passenger
                </h4>

                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">
                    {booking.traveller.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900">{booking.traveller.email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-900">{booking.traveller.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
