import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import searchRoutes from "./routes/search";
import flightRoutes from "./routes/flight";
import bookingRoutes from "./routes/booking";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/flight-booking";

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/search", searchRoutes);
app.use("/api/flight", flightRoutes);
app.use("/api/booking", bookingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
