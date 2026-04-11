"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { flightService } from "@/services/flightService";
import { TravellerData, Flight } from "@/types";

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
    // Load selected flight and search ID from localStorage
    const flight = localStorage.getItem("selectedFlight");
    const search = localStorage.getItem("searchId");

    if (flight) {
      setSelectedFlight(JSON.parse(flight));
    }
    if (search) {
      setSearchId(search);
    } else if (!flight) {
      // Redirect to flights page if no flight selected
      router.push("/flights");
    }
  }, [router]);

  const onSubmit = async (data: TravellerData) => {
    setLoading(true);
    setError(null);

    try {
      // First, select the flight
      if (selectedFlight) {
        await flightService.selectFlight(
          searchId,
          selectedFlight.flightKey,
          selectedFlight.fareId,
        );
      }

      // Create booking
      const bookingResult = await flightService.createBooking(searchId, data);

      if (bookingResult.success) {
        // Store booking details
        localStorage.setItem("booking", JSON.stringify(bookingResult.booking));
        // Redirect to confirmation
        router.push(
          `/confirmation?bookingId=${bookingResult.booking.bookingId}`,
        );
      } else {
        setError("Failed to create booking");
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFlight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold">✈️ Flight Booking System</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Selected Flight Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Selected Flight
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Airline</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedFlight.airline.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Departure</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(selectedFlight.departureTime).toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit", hour12: true },
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedFlight.duration}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Price</p>
              <p className="text-lg font-semibold text-green-600">
                ₹{parseFloat(selectedFlight.price).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Traveller Form */}
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
            {/* Name */}
            <div>
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
                {...register("dob", { required: "Date of birth is required" })}
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

            {/* Passport - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passport Number (Optional)
              </label>
              <input
                {...register("passport")}
                type="text"
                placeholder="ABC123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/flights")}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Creating Booking..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
