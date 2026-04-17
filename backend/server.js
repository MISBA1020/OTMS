import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import otRoutes from "./routes/otRoutes.js";
import surgeryRoutes from "./routes/surgeryRoutes.js";
import sterilizationRoutes from "./routes/sterilizationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import { syncSurgeryStatuses } from "./services/surgeryStatusSync.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/otms")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/ots", otRoutes);
app.use("/api/surgeries", surgeryRoutes);
app.use("/api/sterilization", sterilizationRoutes);
app.use("/api/staff", staffRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "OTMS API is running" });
});

const SURGERY_STATUS_SYNC_INTERVAL_MS = 30 * 1000;

setInterval(async () => {
  try {
    await syncSurgeryStatuses();
  } catch (error) {
    console.error("Surgery status sync failed:", error.message);
  }
}, SURGERY_STATUS_SYNC_INTERVAL_MS);

syncSurgeryStatuses().catch((error) => {
  console.error("Initial surgery status sync failed:", error.message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
