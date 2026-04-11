import axios from "axios";
import { Flight, SearchParams } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const flightService = {
  async searchFlights(params: SearchParams) {
    const response = await api.post("/api/search", params);
    return response.data;
  },

  async selectFlight(searchId: string, flightKey: string, fareId: string) {
    const response = await api.post("/api/flight/select", {
      searchId,
      flightKey,
      fareId,
    });
    return response.data;
  },

  async getSelectedFlights(page = 1, limit = 20) {
    const response = await api.get("/api/flight/selected", {
      params: { page, limit },
    });
    return response.data;
  },

  async createBooking(searchId: string, traveller: any) {
    const response = await api.post("/api/booking", { searchId, traveller });
    return response.data;
  },

  async getAllBookings(page = 1, limit = 20) {
    const response = await api.get("/api/booking", { params: { page, limit } });
    return response.data;
  },

  async getBooking(bookingId: string) {
    const response = await api.get(`/api/booking/${bookingId}`);
    return response.data;
  },
};
