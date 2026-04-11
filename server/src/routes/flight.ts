import { Router, Request, Response } from "express";
import { SelectedFlight } from "../models/SelectedFlight";
import flightsData from "../data/flights.json";

const router = Router();

// POST /api/flight/select - Save selected flight
router.post("/select", async (req: Request, res: Response) => {
  try {
    const { searchId, flightKey, fareId } = req.body;

    if (!searchId || !flightKey || !fareId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Find the flight in the sectors
    const result = (flightsData as any).data.result;
    const sectors = result.sectors;

    let flightData = null;
    let selectedFareData = null;

    for (const sectorKey in sectors) {
      const sector = sectors[sectorKey];
      if (sector[flightKey]) {
        flightData = sector[flightKey];
        // Find the matching fare by fareId
        if (flightData.fares && flightData.fares.length > 0) {
          selectedFareData =
            flightData.fares.find((f: any) => f.fareId === fareId) ||
            flightData.fares[0];
        }
        break;
      }
    }

    if (!flightData) {
      return res
        .status(404)
        .json({ success: false, error: "Flight not found" });
    }

    // Save to database
    const selectedFlight = new SelectedFlight({
      searchId,
      flightKey,
      fareId,
      flightData,
      selectedFareData,
    });

    await selectedFlight.save();

    res.json({
      success: true,
      message: "Flight selected successfully",
      selectedFlight: {
        id: selectedFlight._id,
        searchId: selectedFlight.searchId,
        flightKey: selectedFlight.flightKey,
      },
    });
  } catch (error) {
    console.error("Flight select error:", error);
    res.status(500).json({ success: false, error: "Failed to select flight" });
  }
});

export default router;
