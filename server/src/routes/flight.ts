import { Router, Request, Response } from "express";
import { SelectedFlight } from "../models/SelectedFlight";
import flightsData from "../data/flights.json";
import {
  extractFlightCards,
  extractAirports,
  extractAirlines,
} from "../utils/flightUtils";

const router = Router();

// POST /api/flight/select — save selected flight + processed card
router.post("/select", async (req: Request, res: Response) => {
  try {
    const { searchId, flightKey, fareId } = req.body;

    if (!searchId || !flightKey || !fareId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const result = (flightsData as any).data.result;
    const sectors = result.sectors;
    const journeys: Record<string, { sector: string }> = result.journeys || {};
    const metaData = result.metaData;
    const airports = extractAirports(metaData);
    const airlines = extractAirlines(metaData);

    let flightData: any = null;
    let selectedFareData: any = null;
    let foundSectorKey = "";

    for (const sectorKey in sectors) {
      const sector = sectors[sectorKey];
      if (sector[flightKey]) {
        flightData = sector[flightKey];
        foundSectorKey = sectorKey;
        selectedFareData =
          flightData.fares?.find((f: any) => f.fareId === fareId) ??
          flightData.fares?.[0] ??
          null;
        break;
      }
    }

    if (!flightData) {
      return res
        .status(404)
        .json({ success: false, error: "Flight not found" });
    }

    // Build a processed FlightCard so the admin page can display full details
    const isolatedSector = { [foundSectorKey]: { [flightKey]: flightData } };
    const cards = extractFlightCards(
      isolatedSector,
      airports,
      airlines,
      journeys,
    );
    let processedFlight = cards[0] ?? null;
    if (processedFlight) {
      // Pin the user's chosen fare
      processedFlight.fareId = fareId;
      const chosenFare = processedFlight.fares.find(
        (f: any) => f.fareId === fareId,
      );
      if (chosenFare) processedFlight.price = chosenFare.pricePerAdult;
    }

    const selectedFlight = new SelectedFlight({
      searchId,
      flightKey,
      fareId,
      flightData,
      selectedFareData,
      processedFlightData: processedFlight,
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

// GET /api/flight/selected — list all selected flights (newest first)
router.get("/selected", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [selectedFlights, total] = await Promise.all([
      SelectedFlight.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SelectedFlight.countDocuments(),
    ]);

    res.json({ success: true, selectedFlights, total, page, limit });
  } catch (error) {
    console.error("Get selected flights error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch selected flights" });
  }
});

export default router;
