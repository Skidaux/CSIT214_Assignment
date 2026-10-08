import express from "express";
import {
  assignMaintenance,
  employeeExists,
  getMaintenanceReports,
  reportMaintenance,
  updateMaintenanceStatus,
} from "./db.js";

const router = express.Router();

router.post("/report", (req, res) => {
  const priority = req.body.priority;
  if (
    priority !== undefined &&
    !["low", "medium", "high", "urgent"].includes(priority)
  ) {
    res.status(400).json({ success: false, message: "Invalid priority" });
    return;
  }

  const result = reportMaintenance({
    bookingName: req.body.bookingName,
    reportedBy: Number(req.body.reportedBy),
    description: req.body.description ?? "",
    priority,
  });
  res.status(result.success ? 201 : 400).json(result);
});

router.get("/", (req, res) => {
  const employeeId = Number(req.query.employeeId);
  if (!employeeExists(employeeId)) {
    res.status(403).json({ message: "Council employee access required" });
    return;
  }

  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  res.json(getMaintenanceReports(status));
});

router.patch("/:id/assign", (req, res) => {
  const result = assignMaintenance(
    Number(req.params.id),
    Number(req.body.assignedTo),
    Number(req.body.employeeId),
  );
  res.status(result.success ? 200 : 400).json(result);
});

router.patch("/:id/status", (req, res) => {
  const status = req.body.status;
  const allowedStatuses = [
    "reported",
    "assigned",
    "in_progress",
    "completed",
    "cancelled",
  ];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ success: false, message: "Invalid maintenance status" });
    return;
  }

  const result = updateMaintenanceStatus(
    Number(req.params.id),
    status,
    Number(req.body.employeeId),
  );
  res.status(result.success ? 200 : 400).json(result);
});

export { router as maintenance };
