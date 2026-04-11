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

    let allFlights = extractFlightCards(
      allSectors,
      airports,
      airlines,
      journeys,
    );

    if (sourceCity || destinationCity) {
      const src = sourceCity?.trim().toUpperCase();
      const dst = destinationCity?.trim().toUpperCase();

      allFlights = allFlights.filter((flight: any) => {
        const routeParts: string[] = (flight.route || "").split(" → ");
        const origin = routeParts[0]?.toUpperCase();
        const destination = routeParts[routeParts.length - 1]?.toUpperCase();

        if (tripType === "roundtrip") {
          return (
            ((!src || origin === src) && (!dst || destination === dst)) ||
            ((!src || origin === dst) && (!dst || destination === src))
          );
        }

        return (!src || origin === src) && (!dst || destination === dst);
      });
    }

    const clientFilters = {
      priceRange,
      stops,
      departureTimeRange,
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
