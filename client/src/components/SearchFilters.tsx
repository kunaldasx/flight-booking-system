import { SearchParams } from "@/types";

interface SearchFiltersProps {
  filters: SearchParams;
  onFiltersChange: (filters: SearchParams) => void;
}

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
      priceRange: { min: MIN_PRICE, max: MAX_PRICE },
      stops: undefined,
      departureTimeRange: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-4 sticky top-4">
      <h3 className="font-medium mb-3">Filters</h3>

      <div className="mb-4">
        <label className="text-sm block mb-1">Price Range</label>

        <div className="text-xs text-gray-500 flex justify-between mb-1">
          <span>₹{filters.priceRange.min.toLocaleString("en-IN")}</span>
          <span>₹{filters.priceRange.max.toLocaleString("en-IN")}</span>
        </div>

        <div>
          <div className="text-xs text-gray-500">Min</div>
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={1000}
            value={filters.priceRange.min}
            onChange={(e) => handlePriceChange("min", parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mt-1">
          <div className="text-xs text-gray-500">Max</div>
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={1000}
            value={filters.priceRange.max}
            onChange={(e) => handlePriceChange("max", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm block mb-1">Stops</label>

        <div className="space-y-1 text-sm">
          {[
            { label: "All", value: undefined },
            { label: "Non-stop", value: 0 },
            { label: "1 Stop", value: 1 },
            { label: "2+ Stops", value: 2 },
          ].map(({ label, value }) => (
            <label key={label} className="flex items-center gap-2">
              <input
                type="radio"
                name="stops"
                checked={filters.stops === value}
                onChange={() => handleStopsChange(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm">Departure Time</label>
          {filters.departureTimeRange && (
            <button onClick={clearTimeRange} className="text-xs text-gray-600">
              clear
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500">From</div>
        <input
          type="time"
          value={filters.departureTimeRange?.start ?? "00:00"}
          onChange={(e) => handleTimeChange("start", e.target.value)}
          className="w-full border rounded px-2 py-1 mb-2"
        />

        <div className="text-xs text-gray-500">To</div>
        <input
          type="time"
          value={filters.departureTimeRange?.end ?? "23:59"}
          onChange={(e) => handleTimeChange("end", e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
}
