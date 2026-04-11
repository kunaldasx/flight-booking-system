"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FlightCard from "@/components/FlightCard";
import SearchFilters from "@/components/SearchFilters";
import CitySearch from "@/components/CitySearch";
import { flightService } from "@/services/flightService";
import { Flight, SearchParams, Airport } from "@/types";

const DEFAULT_PRICE_RANGE = { min: 1_000, max: 200_000 };

export default function FlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [searchId, setSearchId] = useState<string>("");
  const [airports, setAirports] = useState<{ [key: string]: Airport }>({});

  // ── Default to the dataset's actual cities (DEL → SHJ) ──────────────────
  // The JSON is a fixed DEL ↔ SHJ dataset.  Pre-filling these values avoids
  // the "search DEL→BOM, get Sharjah flights" confusion.
  const [searchParams, setSearchParams] = useState<SearchParams>({
    sourceCity: "DEL",
    destinationCity: "SHJ",
    departureDate: "2026-03-02",
    returnDate: "2026-03-05",
    tripType: "roundtrip",
    passengers: 2,
    priceRange: DEFAULT_PRICE_RANGE,
  });

  const [filters, setFilters] = useState<SearchParams>(searchParams);

  useEffect(() => {
    const savedFlights = localStorage.getItem("searchResults");
    const savedSearchId = localStorage.getItem("currentSearchId");
    const savedAirports = localStorage.getItem("airports");

    if (savedFlights) {
      try {
        const parsed: Flight[] = JSON.parse(savedFlights);
        // Invalidate cache if flights are missing the `fares` field (old format)
        const isStale = parsed.length > 0 && !Array.isArray(parsed[0]?.fares);
        if (isStale) {
          localStorage.removeItem("searchResults");
          localStorage.removeItem("currentSearchId");
          localStorage.removeItem("airports");
        } else {
          setFlights(parsed);
          setSearchDone(true);
          if (savedSearchId) setSearchId(savedSearchId);
        }
      } catch {
        localStorage.removeItem("searchResults");
      }
    }
    if (savedAirports) {
      try {
        setAirports(JSON.parse(savedAirports));
      } catch {}
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await flightService.searchFlights(searchParams);
      const newSearchId = result.searchId || `SEARCH-${Date.now()}`;
      setSearchId(newSearchId);

      setFlights(result.flights || []);
      setSearchDone(true);
      setAirports(result.metadata?.airports || {});
      // Reset filters to defaults on every new search
      setFilters({ ...searchParams, priceRange: DEFAULT_PRICE_RANGE });

      localStorage.setItem("searchResults", JSON.stringify(result.flights));
      localStorage.setItem("currentSearchId", newSearchId);
      localStorage.setItem(
        "airports",
        JSON.stringify(result.metadata?.airports || {}),
      );
    } catch (err: any) {
      setError("Failed to search flights. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSelect = (flight: Flight) => {
    try {
      localStorage.setItem("selectedFlight", JSON.stringify(flight));
      localStorage.setItem("searchId", searchId);
      router.push("/traveller");
    } catch {
      setError("Failed to select flight. Please try again.");
    }
  };

  // Apply all active filters on the client side
  const filteredFlights = flights.filter((flight) => {
    const price = parseFloat(flight.price);
    if (price < filters.priceRange.min || price > filters.priceRange.max)
      return false;
    if (filters.stops !== undefined && flight.stops !== filters.stops)
      return false;
    if (filters.departureTimeRange?.start && filters.departureTimeRange?.end) {
      const t = flight.departureTime?.split("T")[1]?.substring(0, 5) ?? "00:00";
      if (
        t < filters.departureTimeRange.start ||
        t > filters.departureTimeRange.end
      )
        return false;
    }
    return true;
  });

  const outbound = filteredFlights.filter(
    (f) => (f as any).journeyLabel !== "Return",
  );
  const returnFlights = filteredFlights.filter(
    (f) => (f as any).journeyLabel === "Return",
  );
  const isRoundTrip = returnFlights.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">✈️ Flight Booking System</h1>
          <nav className="flex items-center gap-2">
            <a
              href="/selected-flights"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors"
            >
              Selected Flights
            </a>

            <a
              href="/bookings"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors"
            >
              All Bookings
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Dataset notice ─────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800">
          <strong>Demo dataset:</strong> This system uses a fixed DEL ↔ SHJ
          flight dataset (Mar 2–5 2026). Searching other cities will still show
          all available flights from this dataset.
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Search Flights
          </h2>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <CitySearch
              airports={airports}
              value={searchParams.sourceCity}
              onChange={(city) =>
                setSearchParams({ ...searchParams, sourceCity: city })
              }
              label="From (Origin)"
              placeholder="Search city (e.g., New Delhi)"
            />
            <CitySearch
              airports={airports}
              value={searchParams.destinationCity}
              onChange={(city) =>
                setSearchParams({ ...searchParams, destinationCity: city })
              }
              label="To (Destination)"
              placeholder="Search city (e.g., Sharjah)"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Type
              </label>
              <select
                value={searchParams.tripType}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    tripType: e.target.value as "oneway" | "roundtrip",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="oneway">One-way</option>
                <option value="roundtrip">Round-trip</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                value={searchParams.departureDate}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    departureDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {searchParams.tripType === "roundtrip" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={searchParams.returnDate || ""}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      returnDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passengers
              </label>
              <input
                type="number"
                min="1"
                max="9"
                value={searchParams.passengers}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    passengers: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Searching..." : "Search Flights"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {searchDone && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <SearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="md:col-span-3 space-y-8">
              {/* Outbound */}
              <section>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isRoundTrip ? "✈ Outbound Flights" : "✈ Available Flights"}{" "}
                    — {outbound.length} found
                  </h3>
                </div>
                {outbound.length > 0 ? (
                  outbound.map((flight) => (
                    <FlightCard
                      key={flight.flightKey}
                      flight={flight}
                      onSelect={handleFlightSelect}
                    />
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-lg text-center">
                    <p className="text-gray-500">
                      No flights match your filters. Try adjusting them.
                    </p>
                  </div>
                )}
              </section>

              {/* Return (round-trip only) */}
              {isRoundTrip && (
                <section>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      ↩ Return Flights — {returnFlights.length} found
                    </h3>
                  </div>
                  {returnFlights.length > 0 ? (
                    returnFlights.map((flight) => (
                      <FlightCard
                        key={flight.flightKey}
                        flight={flight}
                        onSelect={handleFlightSelect}
                      />
                    ))
                  ) : (
                    <div className="bg-white p-8 rounded-lg text-center">
                      <p className="text-gray-500">
                        No return flights match your filters.
                      </p>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
