/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Flight, FareTier } from "@/types";

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
}

export default function FlightCard({ flight, onSelect }: FlightCardProps) {
  const fares: FareTier[] = flight.fares ?? [];
  const defaultIdx =
    fares.length > 0
      ? Math.max(
          0,
          fares.findIndex((f) => f.fareId === flight.fareId),
        )
      : 0;
  const [selectedFareIdx, setSelectedFareIdx] = useState(defaultIdx);
  const selectedFare: FareTier | undefined = fares[selectedFareIdx];

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
      });
    } catch {
      return "";
    }
  };

  const getStopsLabel = (stops: number) =>
    stops === 0 ? "Non-stop" : stops === 1 ? "1 Stop" : `${stops} Stops`;

  const journeyLabel = (flight as any).journeyLabel as string | undefined;

  const handleSelect = () => {
    onSelect({
      ...flight,
      fareId: selectedFare.fareId,
      price: selectedFare.pricePerAdult,
    });
  };

  //  Baggage label
  const baggageLabel = (b: FareTier["cabinBaggage"]) => {
    if (!b) return "—";
    if (b.quantity === 0) return "Not included";
    return `${b.piece}pc · ${b.quantity}${b.unit}`;
  };

  const benefitIcon = (value: string) =>
    value === "FREE" ? (
      <span className="text-green-600 font-semibold">✓ Free</span>
    ) : (
      <span className="text-amber-500 font-semibold">$ Paid</span>
    );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-blue-600 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v5.5L2 16v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {flight.airlineName}
              </p>
              <p className="text-xs text-gray-500">{flight.flightNumber}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 ml-7 mt-1">{flight.route}</p>
          <p className="text-xs text-gray-400 ml-7">{flight.routeWithNames}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {journeyLabel && (
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                journeyLabel === "Return"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-indigo-100 text-indigo-800"
              }`}
            >
              {journeyLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {formatTime(flight.departureTime)}
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(flight.departureTime)}
          </div>
          <div className="text-xs text-gray-500">
            {flight.departureAirportName}
          </div>
        </div>

        <div className="flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="mx-2 text-xs text-gray-400 whitespace-nowrap">
              {getStopsLabel(flight.stops)}
            </div>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {formatTime(flight.arrivalTime)}
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(flight.arrivalTime)}
          </div>
          <div className="text-xs text-gray-500">
            {flight.arrivalAirportName}
          </div>
        </div>

        <div className="text-center ml-4 hidden md:block">
          <div className="text-sm font-medium text-gray-700">
            {selectedFare.availableSeats}
          </div>
          <div className="text-xs text-gray-500">Seats Left</div>
        </div>
      </div>

      {fares.length > 1 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
          <div className="flex border-b border-gray-200 bg-gray-50">
            {fares.map((fare, idx) => (
              <button
                key={fare.fareId}
                onClick={() => setSelectedFareIdx(idx)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  idx === selectedFareIdx
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div>{fare.brandName}</div>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    idx === selectedFareIdx ? "text-white" : "text-blue-600"
                  }`}
                >
                  ₹{parseFloat(fare.pricePerAdult).toLocaleString("en-IN")}
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 flex items-center gap-1">
                  🎒 Cabin bag
                </span>
                <span className="font-medium text-gray-800">
                  {baggageLabel(selectedFare.cabinBaggage)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-500 flex items-center gap-1">
                  🧳 Check-in
                </span>
                <span className="font-medium text-gray-800">
                  {selectedFare.checkInBaggageAllowed
                    ? baggageLabel(selectedFare.checkInBaggage)
                    : "Not included"}
                </span>
              </div>

              {selectedFare.benefits.map((benefit) => (
                <div key={benefit.benefitType} className="flex flex-col gap-1">
                  <span className="text-gray-500">
                    {benefit.benefitType === "SEAT" ? "💺 Seat" : "🍽 Meal"}
                  </span>
                  <span>{benefitIcon(benefit.value)}</span>
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <span className="text-gray-500">↩ Refund</span>
                <span>
                  {selectedFare.refundable ? (
                    <span className="text-green-600 font-semibold">
                      ✓ Refundable
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold">
                      ✗ Non-refundable
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {fares.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedFare.refundable && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Refundable
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {selectedFare.cabinType}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          <div className="text-2xl font-bold text-green-600">
            ₹{parseFloat(selectedFare.pricePerAdult).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-gray-500">
            per adult · {selectedFare.brandName}
          </div>
        </div>
        <button
          onClick={handleSelect}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
}
