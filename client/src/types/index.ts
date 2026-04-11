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

export interface Flight {
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
  cabinType: string;
  availableSeats: number;
  refundable: boolean;
  departureAirportName: string;
  arrivalAirportName: string;
  fareId: string;
  journeyLabel?: string; // "Outbound" | "Return" — added by backend
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
  departureTimeRange?: { start: string; end: string }; // HH:MM strings
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
