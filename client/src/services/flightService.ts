import axios from "axios";
import { Flight, SearchParams } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const flightService = {
  async searchFlights(params: SearchParams) {
    try {
      const response = await api.post("/api/search", params);
      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },

  async selectFlight(searchId: string, flightKey: string, fareId: string) {
    try {
      const response = await api.post("/api/flight/select", {
        searchId,
        flightKey,
        fareId,
      });
      return response.data;
    } catch (error) {
      console.error("Select flight error:", error);
      throw error;
    }
  },

  async createBooking(searchId: string, traveller: any) {
    try {
      const response = await api.post("/api/booking", {
        searchId,
        traveller,
      });
      return response.data;
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    }
  },

  async getBooking(bookingId: string) {
    try {
      const response = await api.get(`/api/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Get booking error:", error);
      throw error;
    }
  },
};
