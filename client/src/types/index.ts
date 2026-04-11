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

// ── Fare tier (one flight can have 2–3 of these) ─────────────────────────────
export interface FareBaggage {
  piece: number;
  quantity: number; // weight in KG (0 = not allowed)
  unit: string;
}

export interface FareBenefit {
  benefitType: string; // "SEAT" | "MEAL"
  value: string; // "FREE" | "PAID"
  description: string;
  shortDescription: string;
}

export interface FareTier {
  fareId: string;
  fareGroup: string;
  brandName: string; // "ECONOMY CLASSIC" | "ECONOMY CONVENIENCE" | "FLEXI" …
  cabinType: string; // "ECONOMY" | "BUSINESS" …
  fareClass: string;
  fareBasisCode: string;
  pricePerAdult: string; // numeric string, INR
  totalCTC: string; // total cost for all pax
  refundable: boolean;
  checkInBaggageAllowed: boolean;
  availableSeats: number;
  benefits: FareBenefit[];
  cabinBaggage: FareBaggage | null; // carry-on
  checkInBaggage: FareBaggage | null; // hold luggage
}

export interface Flight {
  flightKey: string;
  airline: string[];
  airlineName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  /** Cheapest fare's pricePerAdult — used for sorting and the price filter */
  price: string;
  flightNumber: string;
  segments: any[];
  route: string;
  routeWithNames: string;
  /** All available fare tiers for this flight */
  fares: FareTier[];
  /** Legacy — kept for backward compat; equals fares[cheapest].cabinType */
  cabinType: string;
  availableSeats: number;
  refundable: boolean;
  departureAirportName: string;
  arrivalAirportName: string;
  /** Currently selected fareId (set by FlightCard when user picks a tier) */
  fareId: string;
  journeyLabel?: string; // "Outbound" | "Return"
}

export interface SearchParams {
  sourceCity: string;
  destinationCity: string;
  departureDate: string;
  returnDate?: string;
  tripType: "oneway" | "roundtrip";
  passengers: number;
  priceRange: { min: number; max: number };
  stops?: number;
  departureTimeRange?: { start: string; end: string };
}

export interface TravellerData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  passport?: string;
}

export interface SelectedFlightData {
  searchId?: string;
  flightKey?: string;
  fareId?: string;
}
