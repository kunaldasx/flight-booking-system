/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Flight, FareTier } from "@/types";
import Image from "next/image";
import AirlineLogo from "@/assets/airLineLogo.jpg";

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
    <div className="bg-white rounded-lg shadow-md p-3 mb-3">
      <div className="flex justify-between mb-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={AirlineLogo}
              alt={flight.airlineName}
              width={100}
              height={100}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{flight.airlineName}</span>
              <span className="text-xs text-gray-500">
                {flight.flightNumber}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-600 mt-1">{flight.route}</div>
          <div className="text-xs text-gray-400">{flight.routeWithNames}</div>
        </div>

        {journeyLabel && (
          <span className="text-xs text-gray-500">{journeyLabel}</span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="text-center">
          <div className="text-base font-semibold">
            {formatTime(flight.departureTime)}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(flight.departureTime)}
          </div>
          <div className="text-xs text-gray-500">
            {flight.departureAirportName}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center text-center text-xs text-gray-500">
          <div className="flex-1 h-px bg-gray-200" />
          <div>
            <div>{flight.duration}</div>
            <div>{getStopsLabel(flight.stops)}</div>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="text-center">
          <div className="text-base font-semibold">
            {formatTime(flight.arrivalTime)}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(flight.arrivalTime)}
          </div>
          <div className="text-xs text-gray-500">
            {flight.arrivalAirportName}
          </div>
        </div>

        <div className="text-xs text-gray-500 hidden md:block">
          {selectedFare.availableSeats} seats
        </div>
      </div>

      {fares.length > 1 && (
        <div className="border rounded mb-2">
          <div className="flex border-b">
            {fares.map((fare, idx) => (
              <button
                key={fare.fareId}
                onClick={() => setSelectedFareIdx(idx)}
                className={`flex-1 text-xs px-2 py-1 ${
                  idx === selectedFareIdx
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                <div>{fare.brandName}</div>
                <div>
                  ₹{parseFloat(fare.pricePerAdult).toLocaleString("en-IN")}
                </div>
              </button>
            ))}
          </div>

          <div className="p-2 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>Cabin: {baggageLabel(selectedFare.cabinBaggage)}</div>

              <div>
                Check-in:{" "}
                {selectedFare.checkInBaggageAllowed
                  ? baggageLabel(selectedFare.checkInBaggage)
                  : "No"}
              </div>

              {selectedFare.benefits.map((b) => (
                <div key={b.benefitType}>
                  {b.benefitType}: {benefitIcon(b.value)}
                </div>
              ))}

              <div>{selectedFare.refundable ? "Refundable" : "No refund"}</div>
            </div>
          </div>
        </div>
      )}

      {fares.length === 1 && (
        <div className="text-xs text-gray-500 mb-2">
          {selectedFare.refundable && "Refundable · "}
          {selectedFare.cabinType}
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <div>
          <div className="font-semibold">
            ₹{parseFloat(selectedFare.pricePerAdult).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-gray-500">{selectedFare.brandName}</div>
        </div>

        <button
          onClick={handleSelect}
          className="border px-4 py-1 rounded bg-blue-600 text-white"
        >
          Select
        </button>
      </div>
    </div>
  );
}
