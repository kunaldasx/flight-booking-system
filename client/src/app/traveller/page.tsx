"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { flightService } from "@/services/flightService";
import { TravellerData, Flight, FareTier } from "@/types";

export default function TravellerPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TravellerData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searchId, setSearchId] = useState<string>("");

  useEffect(() => {
    const flight = localStorage.getItem("selectedFlight");
    const search = localStorage.getItem("searchId");
    if (flight) setSelectedFlight(JSON.parse(flight));
    if (search) setSearchId(search);
    else if (!flight) router.push("/flights");
  }, [router]);

  const onSubmit = async (data: TravellerData) => {
    setLoading(true);
    setError(null);
    try {
      if (selectedFlight) {
        await flightService.selectFlight(
          searchId,
          selectedFlight.flightKey,
          selectedFlight.fareId,
        );
      }
      const bookingResult = await flightService.createBooking(searchId, data);
      if (bookingResult.success) {
        localStorage.setItem("booking", JSON.stringify(bookingResult.booking));
        // Also persist the full flight so confirmation page can show details
        localStorage.setItem("bookedFlight", JSON.stringify(selectedFlight));
        router.push(
          `/confirmation?bookingId=${bookingResult.booking.bookingId}`,
        );
      } else {
        setError("Failed to create booking");
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFlight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  // Find the fare the user actually selected
  const selectedFare: FareTier | undefined =
    selectedFlight.fares?.find((f) => f.fareId === selectedFlight.fareId) ??
    selectedFlight.fares?.[0];

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

  const baggageLabel = (
    fare: FareTier | undefined,
    type: "cabin" | "checkin",
  ) => {
    if (!fare) return "—";
    const b = type === "cabin" ? fare.cabinBaggage : fare.checkInBaggage;
    if (!b || b.quantity === 0) {
      return type === "checkin" && fare.checkInBaggageAllowed
        ? "Included"
        : "Not included";
    }
    return `${b.piece}pc · ${b.quantity}${b.unit}`;
  };

  const price = selectedFare
    ? parseFloat(selectedFare.pricePerAdult)
    : parseFloat(selectedFlight.price);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold">✈️ Flight Booking System</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ── Selected Flight Summary ──────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Selected Flight
            </h2>
            {selectedFlight.journeyLabel && (
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  selectedFlight.journeyLabel === "Return"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {selectedFlight.journeyLabel}
              </span>
            )}
          </div>

          <div className="px-6 py-5">
            {/* Airline + flight number */}
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-blue-600 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v5.5L2 16v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {selectedFlight.airlineName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedFlight.flightNumber}
                </p>
              </div>
            </div>

            {/* Route */}
            <p className="text-sm text-gray-600 mb-1">{selectedFlight.route}</p>
            <p className="text-xs text-gray-400 mb-5">
              {selectedFlight.routeWithNames}
            </p>

            {/* Times grid */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Departure
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatTime(selectedFlight.departureTime)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedFlight.departureTime)}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {selectedFlight.departureAirportName}
                </p>
              </div>

              <div className="text-center self-center">
                <p className="text-xs text-gray-500 mb-1">
                  {selectedFlight.duration}
                </p>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {selectedFlight.stops === 0
                      ? "Non-stop"
                      : `${selectedFlight.stops} Stop${selectedFlight.stops > 1 ? "s" : ""}`}
                  </span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase mb-1">Arrival</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatTime(selectedFlight.arrivalTime)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedFlight.arrivalTime)}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {selectedFlight.arrivalAirportName}
                </p>
              </div>
            </div>

            {/* Fare details strip */}
            {selectedFare && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Fare: </span>
                  <span className="font-medium text-gray-800">
                    {selectedFare.brandName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">🎒 Cabin: </span>
                  <span className="font-medium text-gray-800">
                    {baggageLabel(selectedFare, "cabin")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">🧳 Check-in: </span>
                  <span className="font-medium text-gray-800">
                    {baggageLabel(selectedFare, "checkin")}
                  </span>
                </div>
                {selectedFare.benefits.map((b) => (
                  <div key={b.benefitType}>
                    <span className="text-gray-500">
                      {b.benefitType === "MEAL" ? "🍽 Meal: " : "💺 Seat: "}
                    </span>
                    <span
                      className={`font-medium ${
                        b.value === "FREE" ? "text-green-600" : "text-amber-500"
                      }`}
                    >
                      {b.value === "FREE" ? "Free" : "Paid"}
                    </span>
                  </div>
                ))}
                <div>
                  <span className="text-gray-500">↩ Refund: </span>
                  <span
                    className={`font-medium ${
                      selectedFare.refundable
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {selectedFare.refundable ? "Refundable" : "Non-refundable"}
                  </span>
                </div>
                <div className="ml-auto">
                  <span className="text-gray-500">Price: </span>
                  <span className="font-bold text-green-600 text-base">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-400 text-xs"> /adult</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Traveller Form ───────────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Enter Traveller Details
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Phone number must be 10 digits",
                    },
                  })}
                  type="tel"
                  placeholder="9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  {...register("dob", {
                    required: "Date of birth is required",
                  })}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dob.message}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  {...register("gender", { required: "Gender is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Passport */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  {...register("passport")}
                  type="text"
                  placeholder="ABC123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push("/flights")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                {loading
                  ? "Creating Booking…"
                  : `Confirm Booking · ₹${price.toLocaleString("en-IN")}`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
