import mongoose, { Schema, Document } from "mongoose";

export interface ITraveller {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  passport?: string;
}

export interface IBooking extends Document {
  bookingId: string;
  searchId: string;
  flightKey: string;
  traveller: ITraveller;
  lockedPrice: string;
  flightData: any;
  fareData: any;
  createdAt: Date;
}

const TravellerSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  passport: { type: String },
});

const BookingSchema: Schema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    searchId: { type: String, required: true },
    flightKey: { type: String, required: true },
    traveller: { type: TravellerSchema, required: true },
    lockedPrice: { type: String, required: true },
    flightData: { type: Schema.Types.Mixed, required: true },
    fareData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
