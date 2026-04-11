// Utility to parse flight data and apply filters
export interface FlightSearchParams {
  sourceCity?: string;
  destinationCity?: string;
  departureDate?: string;
  returnDate?: string;
  tripType?: "oneway" | "roundtrip";
  passengers?: number;
  priceRange?: { min: number; max: number };
  stops?: number | null;
  departureTimeRange?: { start: string; end: string };
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}

export interface Airline {
  code: string;
  name: string;
}

export interface FlightCard {
  flightKey: string;
  airline: string[];
  airlineName: string;
  departureTime: string;
  arrivalTime: string; // ← was always blank; now correctly extracted
  duration: string; // ← was always "0h 0m"; now correctly calculated
  stops: number;
  price: string;
  flightNumber: string; // ← was always "N/A"; now correctly extracted
  segments: any[];
  route: string;
  routeWithNames: string;
  cabinType: string;
  availableSeats: number;
  refundable: boolean;
  departureAirportName: string;
  arrivalAirportName: string;
  fareId: string;
  journeyLabel?: string; // "Outbound" | "Return" — used by the UI
}

interface FilterParams {
  priceRange?: { min: number; max: number };
  /** exact stops count; undefined = no filter */
  stops?: number;
  departureTimeRange?: { start: string; end: string }; // "HH:MM" strings
}

// Extract airport metadata
export function extractAirports(metaData: any): { [key: string]: Airport } {
  return metaData?.airportDetail || {};
}

// Extract airline metadata
export function extractAirlines(metaData: any): { [key: string]: Airline } {
  return metaData?.airlineDetail || {};
}

function getAirportName(code: string, airports: any): string {
  return airports[code]?.city || code;
}

function getAirlineName(code: string, airlines: any): string {
  return airlines[code]?.name || code;
}

export function extractFlightCards(
  sectorsData: any,
  airports: any = {},
  airlines: any = {},
  journeys: any = {}, // ← NEW: pass journeys so we can label outbound/return
): FlightCard[] {
  const flights: FlightCard[] = [];

  // Build a reverse map: sectorKey → journey label
  const sectorToJourney: Record<string, string> = {};
  const journeyKeys = Object.keys(journeys);
  journeyKeys.forEach((jKey, idx) => {
    const sectorKey = journeys[jKey]?.sector;
    if (sectorKey) {
      sectorToJourney[sectorKey] = idx === 0 ? "Outbound" : "Return";
    }
  });

  for (const sectorKey in sectorsData) {
    const sector = sectorsData[sectorKey];
    const journeyLabel = sectorToJourney[sectorKey] || "";

    for (const flightKey in sector) {
      const flight = sector[flightKey];

      if (!flight.flights || flight.flights.length === 0) continue;

      const otherDetails = flight.otherDetails || {};
      const fares = flight.fares || [];

      if (fares.length === 0) continue;

      const firstFare = fares[0];
      const price = firstFare?.price?.pricePerAdult || "0";

      // ── FIX 1: duration ────────────────────────────────────────────────────
      // Segment times live inside departureAirport.time / arrivalAirport.time,
      // NOT at the top level of the segment object.
      const duration = calculateDuration(flight.flights);

      // ── FIX 2: arrivalTime ─────────────────────────────────────────────────
      // otherDetails has no arrivalTime key; read from last segment instead.
      const lastSegment = flight.flights[flight.flights.length - 1];
      const arrivalTime = lastSegment?.arrivalAirport?.time || "";

      // Route strings
      const route = flight.flights
        .map((f: any) => f.departureAirport?.code || "")
        .join(" → ");
      const lastArrivalCode = lastSegment?.arrivalAirport?.code;
      const fullRoute = lastArrivalCode
        ? `${route} → ${lastArrivalCode}`
        : route;

      const routeWithNames = flight.flights
        .map((f: any) => getAirportName(f.departureAirport?.code, airports))
        .join(" → ");
      const lastArrivalName = getAirportName(lastArrivalCode, airports);
      const fullRouteWithNames = lastArrivalName
        ? `${routeWithNames} → ${lastArrivalName}`
        : routeWithNames;

      // Airline
      const airlineCodes: string[] = otherDetails.airline || [];
      const airlineName = airlineCodes
        .map((code: string) => getAirlineName(code, airlines))
        .join(", ");

      // Airport names
      const departureAirportCode = flight.flights[0]?.departureAirport?.code;
      const departureAirportName = getAirportName(
        departureAirportCode,
        airports,
      );
      const arrivalAirportName = getAirportName(lastArrivalCode, airports);

      // Fare identifiers
      const cabinType = firstFare?.fareIdentifiers?.cabinType || "ECONOMY";
      const availableSeats =
        firstFare?.fareIdentifiers?.availableSeatCount || 0;
      const refundable = firstFare?.refundable || false;
      const fareId = firstFare?.fareId || "";

      flights.push({
        flightKey,
        airline: airlineCodes,
        airlineName,
        departureTime: otherDetails.departureTime || "",
        arrivalTime, // ← Fixed
        duration, // ← Fixed
        stops: flight.flights.length - 1,
        price,
        flightNumber: extractFlightNumber(flight.flights), // ← Fixed
        segments: flight.flights,
        route: fullRoute,
        routeWithNames: fullRouteWithNames,
        cabinType,
        availableSeats,
        refundable,
        departureAirportName,
        arrivalAirportName,
        fareId,
        journeyLabel,
      });
    }
  }

  return flights;
}

export function filterFlights(flights: any[], filters: FilterParams): any[] {
  if (!filters || Object.keys(filters).length === 0) return flights;

  return flights.filter((flight) => {
    // ── Price ───────────────────────────────────────────────────────────────
    if (filters.priceRange) {
      const price = parseFloat(flight.price);
      // Guard: skip if price can't be parsed (don't silently drop the flight)
      if (!isNaN(price)) {
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }
    }

    // ── Stops ───────────────────────────────────────────────────────────────
    if (filters.stops !== undefined && filters.stops !== null) {
      const flightStops: number = flight.stops ?? 0;
      if (filters.stops === 2) {
        // "2+ stops" bucket
        if (flightStops < 2) return false;
      } else {
        if (flightStops !== filters.stops) return false;
      }
    }

    // ── Departure time range ────────────────────────────────────────────────
    if (filters.departureTimeRange) {
      const { start, end } = filters.departureTimeRange;
      if (start && end) {
        // departureTime is an ISO string: "2026-03-02T05:30:00"
        const iso: string = flight.departureTime || "";
        // Extract "HH:MM" — works whether the value is a full ISO string or
        // already "HH:MM:SS".
        const timePart = iso.includes("T")
          ? iso.split("T")[1]?.substring(0, 5) // "05:30"
          : iso.substring(0, 5); // fallback

        if (timePart) {
          if (timePart < start || timePart > end) return false;
        }
      }
    }

    return true;
  });
}

export function sortFlights(
  flights: FlightCard[],
  sortBy: "price" | "duration" | "departure" = "price",
): FlightCard[] {
  const sorted = [...flights];

  switch (sortBy) {
    case "price":
      sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case "duration":
      sorted.sort(
        (a, b) =>
          minutesFromDuration(a.duration) - minutesFromDuration(b.duration),
      );
      break;
    case "departure":
      sorted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      break;
  }

  return sorted;
}

// ── FIX: reads departureAirport.time / arrivalAirport.time ──────────────────
function calculateDuration(flights: any[]): string {
  if (flights.length === 0) return "0h 0m";

  const firstFlight = flights[0];
  const lastFlight = flights[flights.length - 1];

  // The JSON stores times one level deeper inside the airport object
  const startTime = new Date(firstFlight.departureAirport?.time);
  const endTime = new Date(lastFlight.arrivalAirport?.time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return "N/A";

  const diffMs = endTime.getTime() - startTime.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  return `${hours}h ${mins}m`;
}

function minutesFromDuration(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

// ── FIX: JSON uses fltNo, not flightNumber ───────────────────────────────────
function extractFlightNumber(flights: any[]): string {
  if (flights.length === 0) return "N/A";
  // For multi-segment flights, join all leg numbers (e.g., "4771 / 1060")
  const numbers = flights
    .map((f: any) => {
      const code = f.airlineCode || "";
      const num = f.fltNo || "";
      return code && num ? `${code}-${num}` : num;
    })
    .filter(Boolean);
  return numbers.length > 0 ? numbers.join(" / ") : "N/A";
}

export function generateBookingId(): string {
  return `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
