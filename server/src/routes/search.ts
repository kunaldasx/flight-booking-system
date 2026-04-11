import { Router, Request, Response } from "express";
import flightsData from "../data/flights.json";
import {
  extractFlightCards,
  filterFlights,
  sortFlights,
  extractAirports,
  extractAirlines,
} from "../utils/flightUtils";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    // ── FIX 1: req.body IS the SearchParams — there is no nested `filters`
    // key. The old code did `const { filters } = req.body` which always
    // gave `undefined`, so every filter (city, price, stops, time) was
    // silently ignored.
    const searchParams = req.body as {
      sourceCity?: string;
      destinationCity?: string;
      tripType?: "oneway" | "roundtrip";
      departureDate?: string;
      returnDate?: string;
      passengers?: number;
      priceRange?: { min: number; max: number };
      stops?: number;
      departureTimeRange?: { start: string; end: string };
    };

    const {
      sourceCity,
      destinationCity,
      tripType = "oneway",
      priceRange,
      stops,
      departureTimeRange,
    } = searchParams;

    const result = (flightsData as any).data.result;
    const allSectors = result.sectors;
    const journeys: Record<string, { sector: string }> = result.journeys || {};
    const metaData = result.metaData;

    const airports = extractAirports(metaData);
    const airlines = extractAirlines(metaData);

    // Extract all flights (journey labels — Outbound / Return — are assigned
    // inside extractFlightCards based on the `journeys` map).
    let allFlights = extractFlightCards(
      allSectors,
      airports,
      airlines,
      journeys,
    );

    // ── FIX 2: Filter by source / destination city (airport code) ──────────
    // The previous code intentionally skipped this step with a comment saying
    // "sector filtering breaks for cities not in the dataset".  The real fix
    // is to do the filter AFTER extraction so we work with normalised flight
    // objects instead of raw sector keys.
    if (sourceCity || destinationCity) {
      const src = sourceCity?.trim().toUpperCase();
      const dst = destinationCity?.trim().toUpperCase();

      allFlights = allFlights.filter((flight: any) => {
        // `route` is e.g. "DEL → DOH → SHJ" — we care about the first and last
        // airport code (origin → final destination).
        const routeParts: string[] = (flight.route || "").split(" → ");
        const origin = routeParts[0]?.toUpperCase();
        const destination = routeParts[routeParts.length - 1]?.toUpperCase();

        if (tripType === "roundtrip") {
          // Include both directions so the UI can split into Outbound / Return
          return (
            ((!src || origin === src) && (!dst || destination === dst)) ||
            ((!src || origin === dst) && (!dst || destination === src))
          );
        }

        // One-way: only the requested direction
        return (!src || origin === src) && (!dst || destination === dst);
      });
    }

    // ── FIX 3: Pass the actual filter values — not an empty object ──────────
    const clientFilters = {
      priceRange, // { min, max }  or undefined
      stops, // 0 | 1 | 2 | undefined
      departureTimeRange, // { start: "HH:MM", end: "HH:MM" } or undefined
    };

    let filtered = filterFlights(allFlights, clientFilters);
    filtered = sortFlights(filtered, "price");

    res.json({
      success: true,
      searchId: `SEARCH-${Date.now()}`,
      flights: filtered,
      metadata: {
        totalResults: filtered.length,
        airports,
        airlines,
        journeys,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, error: "Search failed" });
  }
});

export default router;
