import { Flight } from "@/types";

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
}

export default function FlightCard({ flight, onSelect }: FlightCardProps) {
  // ── FIX: departureTime and arrivalTime are ISO strings; format them ────────
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

  const getStopsLabel = (stops: number) => {
    if (stops === 0) return "Non-stop";
    if (stops === 1) return "1 Stop";
    return `${stops} Stops`;
  };

  // journeyLabel is set by the backend ("Outbound" / "Return")
  const journeyLabel = (flight as any).journeyLabel as string | undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 mb-3">
      {/* Top: airline info + badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Plane icon */}
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
              {/* ── FIX: flightNumber now shows "QR-4771 / QR-1060" instead of "N/A" */}
              <p className="text-xs text-gray-500">{flight.flightNumber}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 ml-7 mt-1">{flight.route}</p>
          <p className="text-xs text-gray-400 ml-7">{flight.routeWithNames}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {/* Journey label (Outbound / Return) */}
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
          {flight.refundable && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Refundable
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {flight.cabinType}
          </span>
        </div>
      </div>

      {/* Middle: times, duration, stops */}
      <div className="flex items-center gap-4 mb-4">
        {/* Departure */}
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

        {/* Duration / stops connector */}
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

        {/* ── FIX: Arrival time now shows correctly (was always blank) ─────── */}
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

        {/* Seats */}
        <div className="text-center ml-4 hidden md:block">
          <div className="text-sm font-medium text-gray-700">
            {flight.availableSeats}
          </div>
          <div className="text-xs text-gray-500">Seats Left</div>
        </div>
      </div>

      {/* Bottom: price + select */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          <div className="text-2xl font-bold text-green-600">
            ₹{parseFloat(flight.price).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-gray-500">per adult</div>
        </div>
        <button
          onClick={() => onSelect(flight)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
}
