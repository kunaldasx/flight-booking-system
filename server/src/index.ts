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

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/search", searchRoutes);
app.use("/api/flight", flightRoutes);
app.use("/api/booking", bookingRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
