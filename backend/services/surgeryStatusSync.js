import Surgery from "../models/Surgery.js";
import OperationTheatre from "../models/OperationTheatre.js";

export const syncSurgeryStatuses = async () => {
  const now = new Date();

  // Surgeries should begin automatically once their start time is reached.
  await Surgery.updateMany(
    {
      status: "Scheduled",
      startTime: { $lte: now },
      endTime: { $gt: now },
    },
    { $set: { status: "In Progress" } },
  );

  // Any surgery that has passed its end time is automatically completed.
  await Surgery.updateMany(
    {
      status: { $in: ["Scheduled", "In Progress"] },
      endTime: { $lte: now },
    },
    { $set: { status: "Completed" } },
  );

  const activeSurgeries = await Surgery.find({
    status: "In Progress",
    startTime: { $lte: now },
    endTime: { $gt: now },
  }).select("operationTheatreId");

  const activeOtIds = activeSurgeries.map(
    (surgery) => surgery.operationTheatreId,
  );

  await OperationTheatre.updateMany(
    { _id: { $in: activeOtIds } },
    { $set: { status: "In Use" } },
  );

  await OperationTheatre.updateMany(
    {
      _id: { $nin: activeOtIds },
      status: "In Use",
    },
    { $set: { status: "Available" } },
  );
};
