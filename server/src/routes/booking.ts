import { Router, Request, Response } from "express";
import { Booking } from "../models/Booking";
import { SelectedFlight } from "../models/SelectedFlight";
import { generateBookingId } from "../utils/flightUtils";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { searchId, traveller } = req.body;

    if (!searchId || !traveller) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const requiredFields = ["name", "email", "phone", "dob", "gender"];
    for (const field of requiredFields) {
      if (!traveller[field]) {
        return res.status(400).json({
          success: false,
          error: `Missing traveller field: ${field}`,
        });
      }
    }

    const selectedFlight = await SelectedFlight.findOne({ searchId }).sort({
      createdAt: -1,
    });

    if (!selectedFlight) {
      return res.status(404).json({
        success: false,
        error: "No flight selected for this search",
      });
    }

    const bookingId = generateBookingId();

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

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(),
    ]);

    res.json({ success: true, bookings, total, page, limit });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
});

export default router;
