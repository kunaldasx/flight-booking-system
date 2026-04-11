import { Router, Request, Response } from "express";
import { Booking } from "../models/Booking";
import { SelectedFlight } from "../models/SelectedFlight";
import { generateBookingId } from "../utils/flightUtils";

const router = Router();

// POST /api/booking - Create a booking
router.post("/", async (req: Request, res: Response) => {
  try {
    const { searchId, traveller } = req.body;

    if (!searchId || !traveller) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Validate traveller data
    const requiredFields = ["name", "email", "phone", "dob", "gender"];
    for (const field of requiredFields) {
      if (!traveller[field]) {
        return res.status(400).json({
          success: false,
          error: `Missing traveller field: ${field}`,
        });
      }
    }

    // Get the selected flight data
    const selectedFlight = await SelectedFlight.findOne({ searchId }).sort({
      createdAt: -1,
    });

    if (!selectedFlight) {
      return res.status(404).json({
        success: false,
        error: "No flight selected for this search",
      });
    }

    // Generate booking ID
    const bookingId = generateBookingId();

    // Create booking (lock the price)
    const booking = new Booking({
      bookingId,
      searchId,
      flightKey: selectedFlight.flightKey,
      traveller,
      lockedPrice: selectedFlight.selectedFareData?.price?.pricePerAdult || "0",
      flightData: selectedFlight.flightData,
      fareData: selectedFlight.selectedFareData,
    });

    await booking.save();

    res.json({
      success: true,
      message: "Booking created successfully",
      booking: {
        bookingId: booking.bookingId,
        searchId: booking.searchId,
        lockedPrice: booking.lockedPrice,
        traveller: booking.traveller,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, error: "Failed to create booking" });
  }
});

// GET /api/booking/:bookingId - Get booking details
router.get("/:bookingId", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch booking" });
  }
});

export default router;
