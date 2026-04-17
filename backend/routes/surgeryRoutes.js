import express from "express";
import Surgery from "../models/Surgery.js";
import OperationTheatre from "../models/OperationTheatre.js";
import { syncSurgeryStatuses } from "../services/surgeryStatusSync.js";

const router = express.Router();

// Get all surgeries, optionally filtered by OT or status
router.get("/", async (req, res) => {
  try {
    await syncSurgeryStatuses();

    const { operationTheatreId, status } = req.query;
    let filter = {};
    if (operationTheatreId) filter.operationTheatreId = operationTheatreId;
    if (status) filter.status = status;

    const surgeries = await Surgery.find(filter).populate("operationTheatreId");
    res.json(surgeries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Schedule a new surgery
router.post("/", async (req, res) => {
  try {
    await syncSurgeryStatuses();

    const { operationTheatreId, startTime, endTime } = req.body;

    // Check for overlaps
    const overlapping = await Surgery.findOne({
      operationTheatreId,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
      status: { $in: ["Scheduled", "In Progress"] },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "Time slot overlaps with an existing surgery in this OT.",
      });
    }

    const surgery = new Surgery(req.body);
    const saved = await surgery.save();

    // Auto-update OT status to In Use if it's currently starting
    const now = new Date();
    if (new Date(startTime) <= now && new Date(endTime) > now) {
      await OperationTheatre.findByIdAndUpdate(operationTheatreId, {
        status: "In Use",
      });
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update surgery status
router.put("/:id", async (req, res) => {
  try {
    await syncSurgeryStatuses();

    const existingSurgery = await Surgery.findById(req.params.id);
    if (!existingSurgery) {
      return res.status(404).json({ message: "Surgery not found" });
    }

    const nextOperationTheatreId =
      req.body.operationTheatreId || existingSurgery.operationTheatreId;
    const nextStartTime = req.body.startTime || existingSurgery.startTime;
    const nextEndTime = req.body.endTime || existingSurgery.endTime;

    if (new Date(nextStartTime) >= new Date(nextEndTime)) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    const overlapping = await Surgery.findOne({
      _id: { $ne: req.params.id },
      operationTheatreId: nextOperationTheatreId,
      $or: [
        { startTime: { $lt: nextEndTime, $gte: nextStartTime } },
        { endTime: { $gt: nextStartTime, $lte: nextEndTime } },
        { startTime: { $lte: nextStartTime }, endTime: { $gte: nextEndTime } },
      ],
      status: { $in: ["Scheduled", "In Progress"] },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "Time slot overlaps with an existing surgery in this OT.",
      });
    }

    const updated = await Surgery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (updated.status === "Completed" || updated.status === "Cancelled") {
      await OperationTheatre.findByIdAndUpdate(updated.operationTheatreId, {
        status: "Available",
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
