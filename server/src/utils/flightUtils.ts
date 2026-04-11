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
  arrivalTime: string;
  duration: string;
  stops: number;

  price: string;
  flightNumber: string;
  segments: any[];
  route: string;
  routeWithNames: string;

  fares: FareTier[];

  cabinType: string;
  availableSeats: number;
  refundable: boolean;
  departureAirportName: string;
  arrivalAirportName: string;
  fareId: string;
  journeyLabel?: string;
}

interface FilterParams {
  priceRange?: { min: number; max: number };
  stops?: number;
  departureTimeRange?: { start: string; end: string };
}

export interface FareTier {
  fareId: string;
  fareGroup: string;
  brandName: string;
  cabinType: string;
  fareClass: string;
  fareBasisCode: string;
  pricePerAdult: string;
  totalCTC: string;
  refundable: boolean;
  checkInBaggageAllowed: boolean;
  availableSeats: number;
  benefits: FareBenefit[];
  cabinBaggage: FareBaggage | null;
  checkInBaggage: FareBaggage | null;
}

export interface FareBaggage {
  piece: number;
  quantity: number;
  unit: string;
}

export interface FareBenefit {
  benefitType: string;
  value: string;
  description: string;
  shortDescription: string;
}

export function extractAirports(metaData: any): { [key: string]: Airport } {
  return metaData?.airportDetail || {};
}

export function extractAirlines(metaData: any): { [key: string]: Airline } {
  return metaData?.airlineDetail || {};
}

function getAirportName(code: string, airports: any): string {
  return airports[code]?.city || code;
}

function getAirlineName(code: string, airlines: any): string {
  return airlines[code]?.name || code;
}

function extractBaggage(
  baggages: any,
  type: "BAGGAGE_CABIN" | "BAGGAGE_CHECK_IN",
): FareBaggage | null {
  const segmentBaggages: any[] = baggages?.["0"] || [];
  const entry = segmentBaggages.find((b: any) => b.type === type);
  const allowed = entry?.allowedBaggages?.[0];
  if (!allowed) return null;
  return {
    piece: allowed.piece ?? 0,
    quantity: allowed.quantity ?? 0,
    unit: allowed.unit || "KG",
  };
}

function extractFareTiers(fares: any[]): FareTier[] {
  return fares.map((fare: any): FareTier => {
    const identifiers = fare.fareIdentifiers || {};
    const benefits: FareBenefit[] = (fare.benefits || []).map((b: any) => ({
      benefitType: b.benefitType || "",
      value: b.value || "",
      description: b.description || "",
      shortDescription: b.shortDescription || "",
    }));

    return {
      fareId: fare.fareId || "",
      fareGroup: fare.fareGroup || "",
      brandName:
        identifiers.brandName ||
        identifiers.brand ||
        fare.fareGroup ||
        "STANDARD",
      cabinType: identifiers.cabinType || "ECONOMY",
      fareClass: identifiers.fareClass || "",
      fareBasisCode: identifiers.fareBasisCode || "",
      pricePerAdult: String(fare.price?.pricePerAdult || "0"),
      totalCTC: String(fare.price?.CTC || "0"),
      refundable: fare.refundable ?? false,
      checkInBaggageAllowed: fare.checkInBaggageAllowed ?? false,
      availableSeats: identifiers.availableSeatCount ?? 0,
      benefits,
      cabinBaggage: extractBaggage(fare.baggages, "BAGGAGE_CABIN"),
      checkInBaggage: extractBaggage(fare.baggages, "BAGGAGE_CHECK_IN"),
    };
  });
}

export function extractFlightCards(
  sectorsData: any,
  airports: any = {},
  airlines: any = {},
  journeys: any = {},
): FlightCard[] {
  const flights: FlightCard[] = [];

  const sectorToJourney: Record<string, string> = {};
  Object.keys(journeys).forEach((jKey, idx) => {
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

      const rawFares: any[] = flight.fares || [];
      if (rawFares.length === 0) continue;

      // Extract all fare tiers
      const fareTiers = extractFareTiers(rawFares);

      const cheapestFare = fareTiers.reduce((min, f) =>
        parseFloat(f.pricePerAdult) < parseFloat(min.pricePerAdult) ? f : min,
      );

      const otherDetails = flight.otherDetails || {};

      // Duration
      const duration = calculateDuration(flight.flights);

      // Arrival time
      const lastSegment = flight.flights[flight.flights.length - 1];
      const arrivalTime = lastSegment?.arrivalAirport?.time || "";
      const lastArrivalCode = lastSegment?.arrivalAirport?.code;

      // Route DEL → DOH → SHJ
      const routeCodes = flight.flights
        .map((f: any) => f.departureAirport?.code || "")
        .join(" → ");
      const fullRoute = lastArrivalCode
        ? `${routeCodes} → ${lastArrivalCode}`
        : routeCodes;

      const routeNames = flight.flights
        .map((f: any) => getAirportName(f.departureAirport?.code, airports))
        .join(" → ");
      const lastArrivalName = getAirportName(lastArrivalCode, airports);
      const fullRouteWithNames = lastArrivalName
        ? `${routeNames} → ${lastArrivalName}`
        : routeNames;

      // Airline
      const airlineCodes: string[] = otherDetails.airline || [];
      const airlineName = airlineCodes
        .map((c: string) => getAirlineName(c, airlines))
        .join(", ");

      const departureAirportCode = flight.flights[0]?.departureAirport?.code;
      const departureAirportName = getAirportName(
        departureAirportCode,
        airports,
      );
      const arrivalAirportName = getAirportName(lastArrivalCode, airports);

      flights.push({
        flightKey,
        airline: airlineCodes,
        airlineName,
        departureTime: otherDetails.departureTime || "",
        arrivalTime,
        duration,
        stops: flight.flights.length - 1,
        price: cheapestFare.pricePerAdult,
        flightNumber: extractFlightNumber(flight.flights),
        segments: flight.flights,
        route: fullRoute,
        routeWithNames: fullRouteWithNames,
        fares: fareTiers,
        cabinType: cheapestFare.cabinType,
        availableSeats: cheapestFare.availableSeats,
        refundable: cheapestFare.refundable,
        departureAirportName,
        arrivalAirportName,
        fareId: cheapestFare.fareId,
        journeyLabel,
      });
    }
  }

  return flights;
}

// ── Filters ──────────────────────────────────────────────────────────────────

export function filterFlights(flights: any[], filters: FilterParams): any[] {
  if (!filters || Object.keys(filters).length === 0) return flights;

  return flights.filter((flight) => {
    // Price — compare against the card's headline price (cheapest fare)
    if (filters.priceRange) {
      const price = parseFloat(flight.price);
      if (!isNaN(price)) {
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }
    }

    // Stops
    if (filters.stops !== undefined && filters.stops !== null) {
      const flightStops: number = flight.stops ?? 0;
      if (filters.stops === 2) {
        if (flightStops < 2) return false;
      } else {
        if (flightStops !== filters.stops) return false;
      }
    }

    // Departure time range
    if (filters.departureTimeRange) {
      const { start, end } = filters.departureTimeRange;
      if (start && end) {
        const iso: string = flight.departureTime || "";
        const timePart = iso.includes("T")
          ? iso.split("T")[1]?.substring(0, 5)
          : iso.substring(0, 5);
        if (timePart && (timePart < start || timePart > end)) return false;
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

// Helpers

function calculateDuration(flights: any[]): string {
  if (flights.length === 0) return "0h 0m";
  const first = flights[0];
  const last = flights[flights.length - 1];
  const start = new Date(first.departureAirport?.time);
  const end = new Date(last.arrivalAirport?.time);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function minutesFromDuration(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

function extractFlightNumber(flights: any[]): string {
  if (flights.length === 0) return "N/A";
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
