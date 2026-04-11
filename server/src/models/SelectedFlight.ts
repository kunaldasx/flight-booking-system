import mongoose, { Schema, Document } from "mongoose";

export interface ISelectedFlight extends Document {
  searchId: string;
  flightKey: string;
  fareId: string;
  flightData: any;
  selectedFareData: any;
  processedFlightData: any; // ← new: stores the extracted FlightCard
  createdAt: Date;
}

const SelectedFlightSchema: Schema = new Schema(
  {
    searchId: { type: String, required: true },
    flightKey: { type: String, required: true },
    fareId: { type: String, required: true },
    flightData: { type: Schema.Types.Mixed, required: true },
    selectedFareData: { type: Schema.Types.Mixed, required: true },
    processedFlightData: { type: Schema.Types.Mixed }, // ← new
  },
  { timestamps: true },
);

export const SelectedFlight = mongoose.model<ISelectedFlight>(
  "SelectedFlight",
  SelectedFlightSchema,
);
