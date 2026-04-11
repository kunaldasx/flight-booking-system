"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BookingDetails {
  bookingId: string;
  lockedPrice: string;
  traveller: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load booking from localStorage
    const bookingData = localStorage.getItem("booking");
    if (bookingData) {
      try {
        setBooking(JSON.parse(bookingData));
      } catch (e) {
        console.error("Failed to parse booking:", e);
      }
    }
    setLoading(false);
  }, []);

  const handleNewSearch = () => {
    localStorage.removeItem("selectedFlight");
    localStorage.removeItem("searchId");
    localStorage.removeItem("booking");
    router.push("/flights");
  };

  if (loading) {
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
        {/* Success Message */}
        <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
          <div className="mb-4">
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
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600 text-lg">
            Your flight has been successfully booked.
          </p>
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Booking Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-4">
                  Booking Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Booking ID
                    </p>
                    <p className="text-lg font-mono font-semibold text-gray-900">
                      {booking.bookingId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Total Price
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      ₹{parseFloat(booking.lockedPrice).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Booking Date
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(booking.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-4">
                  Passenger Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.traveller.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.traveller.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.traveller.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
              <p className="text-blue-900 text-sm">
                <strong>Note:</strong> A confirmation email has been sent to
                your email address. Please keep your booking ID safe for future
                reference.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleNewSearch}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Book Another Flight
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Print Booking
          </button>
        </div>
      </main>
    </div>
  );
}
