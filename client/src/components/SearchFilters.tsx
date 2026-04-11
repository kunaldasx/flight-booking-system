import { SearchParams } from "@/types";

interface SearchFiltersProps {
  filters: SearchParams;
  onFiltersChange: (filters: SearchParams) => void;
}

// ── FIX: raised MAX_PRICE to cover all flights in the dataset (~57 000+) ────
const MAX_PRICE = 200_000;
const MIN_PRICE = 1_000;

export default function SearchFilters({
  filters,
  onFiltersChange,
}: SearchFiltersProps) {
  const handlePriceChange = (type: "min" | "max", value: number) => {
    onFiltersChange({
      ...filters,
      priceRange: { ...filters.priceRange, [type]: value },
    });
  };

  const handleStopsChange = (value: number | undefined) => {
    onFiltersChange({ ...filters, stops: value });
  };

  // ── FIX: departure time range handler ─────────────────────────────────────
  const handleTimeChange = (type: "start" | "end", value: string) => {
    onFiltersChange({
      ...filters,
      departureTimeRange: {
        start:
          type === "start"
            ? value
            : (filters.departureTimeRange?.start ?? "00:00"),
        end:
          type === "end" ? value : (filters.departureTimeRange?.end ?? "23:59"),
      },
    });
  };

  const clearTimeRange = () => {
    onFiltersChange({
      ...filters,
      departureTimeRange: undefined,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 sticky top-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

      {/* ── Price Range ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>₹{filters.priceRange.min.toLocaleString("en-IN")}</span>
          <span>₹{filters.priceRange.max.toLocaleString("en-IN")}</span>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1000}
              value={filters.priceRange.min}
              onChange={(e) =>
                handlePriceChange("min", parseInt(e.target.value))
              }
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1000}
              value={filters.priceRange.max}
              onChange={(e) =>
                handlePriceChange("max", parseInt(e.target.value))
              }
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* ── Stops ────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stops
        </label>
        <div className="space-y-2">
          {[
            { label: "All Flights", value: undefined },
            { label: "Non-stop", value: 0 },
            { label: "1 Stop", value: 1 },
            { label: "2+ Stops", value: 2 },
          ].map(({ label, value }) => (
            <label
              key={label}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="stops"
                checked={filters.stops === value}
                onChange={() => handleStopsChange(value)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── FIX: Departure Time Range ────────────────────────────────────── */}
      {/* Required by the PDF spec but was completely missing */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Departure Time
          </label>
          {filters.departureTimeRange && (
            <button
              onClick={clearTimeRange}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">From</label>
            <input
              type="time"
              value={filters.departureTimeRange?.start ?? "00:00"}
              onChange={(e) => handleTimeChange("start", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">To</label>
            <input
              type="time"
              value={filters.departureTimeRange?.end ?? "23:59"}
              onChange={(e) => handleTimeChange("end", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
