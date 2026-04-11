/* eslint-disable @typescript-eslint/no-explicit-any */
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

  fares: FareTier[];

  cabinType: string;
  availableSeats: number;
  refundable: boolean;
  departureAirportName: string;
  arrivalAirportName: string;

  fareId: string;
  journeyLabel?: string;
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
