/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { flightService } from "@/services/flightService";
import { TravellerData, Flight, FareTier } from "@/types";
import Image from "next/image";
import AirlineLogo from "@/assets/airLineLogo.jpg";

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
      const bookingResult = await flightService.createBooking(searchId, data);
      if (bookingResult.success) {
        localStorage.setItem("booking", JSON.stringify(bookingResult.booking));
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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold">Selected Flight</h2>

          {selectedFlight.journeyLabel && (
            <span className="text-xs px-2 py-0.5 border rounded text-gray-600">
              {selectedFlight.journeyLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Image
            src={AirlineLogo}
            alt={selectedFlight.airlineName}
            width={100}
            height={100}
          />
          <div className="mb-3">
            <div className="text-sm font-medium">
              {selectedFlight.airlineName}
            </div>
            <div className="text-xs text-gray-500">
              {selectedFlight.flightNumber}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-700">{selectedFlight.route}</div>
        <div className="text-xs text-gray-400 mb-3">
          {selectedFlight.routeWithNames}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Departure</div>
            <div className="text-lg font-semibold">
              {formatTime(selectedFlight.departureTime)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(selectedFlight.departureTime)}
            </div>
            <div className="text-xs text-gray-600">
              {selectedFlight.departureAirportName}
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 self-center">
            <div className="mb-1">{selectedFlight.duration}</div>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-px bg-gray-300" />
              <span>
                {selectedFlight.stops === 0
                  ? "Non-stop"
                  : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? "s" : ""}`}
              </span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Arrival</div>
            <div className="text-lg font-semibold">
              {formatTime(selectedFlight.arrivalTime)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(selectedFlight.arrivalTime)}
            </div>
            <div className="text-xs text-gray-600">
              {selectedFlight.arrivalAirportName}
            </div>
          </div>
        </div>

        {selectedFare && (
          <div className="border rounded p-3 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
              <div>
                <span className="text-gray-500">Fare:</span>{" "}
                {selectedFare.brandName}
              </div>

              <div>
                <span className="text-gray-500">Cabin:</span>{" "}
                {baggageLabel(selectedFare, "cabin")}
              </div>

              <div>
                <span className="text-gray-500">Check-in:</span>{" "}
                {baggageLabel(selectedFare, "checkin")}
              </div>

              {selectedFare.benefits.map((b) => (
                <div key={b.benefitType}>
                  <span className="text-gray-500">{b.benefitType}:</span>{" "}
                  {b.value === "FREE" ? "Free" : "Paid"}
                </div>
              ))}

              <div>
                <span className="text-gray-500">Refund:</span>{" "}
                {selectedFare.refundable ? "Yes" : "No"}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <div className="font-semibold">
                ₹{price.toLocaleString("en-IN")}
                <span className="text-xs text-gray-500 ml-1">/adult</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
              {loading ? "Creating Booking…" : `Confirm Booking`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
