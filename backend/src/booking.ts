import express from "express";
import {
  cancelBooking,
  checkAvailability,
  createBooking,
  createRoom,
  employeeExists,
  getAffectedBookings,
  getAuditHistory,
  getBookingRequests,
  getBookingResource,
  getBookingResources,
  getUserBookings,
  getUtilisationReport,
  updateBookingStatus,
  updateResourceStatus,
} from "./db.js";

const router = express.Router();

interface booking {
  name: string;
  size: number;
  location: string;
  type: string;
  description?: string;
  status?: "available" | "closed" | "maintenance";
}

function queryText(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

router.get("/resources", (req, res) => {
  const resources = getBookingResources({
    search: queryText(req.query.search),
    type: queryText(req.query.type),
    status: queryText(req.query.status),
  });
  res.json(resources);
});

router.get("/resources/:name", (req, res) => {
  const resource = getBookingResource(req.params.name);
  if (!resource) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }
  res.json(resource);
});

router.post("/create-room", (req, res) => {
  const room: booking = {
    name: req.body.name,
    size: Number(req.body.size),
    location: req.body.location,
    type: req.body.type,
    description: req.body.description,
    status: req.body.status,
  };

  if (!employeeExists(Number(req.body.employeeId))) {
    res.status(403).json({ message: "Council employee access required" });
    return;
  }
  if (!room.name || !room.location || !room.type || room.size < 1) {
    res.status(400).json({ success: false, message: "Invalid resource details" });
    return;
  }

  const id = createRoom(room, Number(req.body.employeeId));
  if (id === false) {
    res.status(400).json({ success: false, message: "Unable to create resource" });
    return;
  }
  res.status(201).json({ success: true, id });
});

router.get("/availability", (req, res) => {
  const name = queryText(req.query.name);
  const fromDate = queryText(req.query.from);
  const toDate = queryText(req.query.to);
  const quantity = Number(queryText(req.query.quantity) ?? 1);

  if (!name || !fromDate || !toDate || !Number.isInteger(quantity)) {
    res.status(400).json({ message: "Name, from and to are required" });
    return;
  }

  res.json(checkAvailability(name, fromDate, toDate, quantity));
});

router.post("/request", (req, res) => {
  if (
    !Number.isInteger(Number(req.body.userId)) ||
    typeof req.body.bookingName !== "string" ||
    typeof req.body.fromDate !== "string" ||
    typeof req.body.toDate !== "string"
  ) {
    res.status(400).json({ success: false, message: "Invalid booking details" });
    return;
  }

  const result = createBooking({
    userId: Number(req.body.userId),
    bookingName: req.body.bookingName,
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    purpose: req.body.purpose,
    attendees:
      req.body.attendees === undefined ? undefined : Number(req.body.attendees),
    quantity:
      req.body.quantity === undefined ? undefined : Number(req.body.quantity),
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.status(201).json(result);
});

router.get("/user/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }
  res.json(getUserBookings(userId));
});

router.get("/requests", (req, res) => {
  const employeeId = Number(req.query.employeeId);
  if (!employeeExists(employeeId)) {
    res.status(403).json({ message: "Council employee access required" });
    return;
  }
  res.json(getBookingRequests(queryText(req.query.status)));
});

router.patch("/requests/:id/status", (req, res) => {
  const bookingId = Number(req.params.id);
  const employeeId = Number(req.body.employeeId);
  const status = req.body.status;

  if (!Number.isInteger(bookingId) || !["approved", "rejected"].includes(status)) {
    res.status(400).json({ success: false, message: "Invalid review details" });
    return;
  }

  const result = updateBookingStatus(bookingId, status, employeeId);
  res.status(result.success ? 200 : 400).json(result);
});

router.patch("/requests/:id/cancel", (req, res) => {
  const result = cancelBooking(Number(req.params.id), Number(req.body.userId));
  res.status(result.success ? 200 : 400).json(result);
});

router.patch("/resources/:name/status", (req, res) => {
  const status = req.body.status;
  if (!["available", "closed", "maintenance"].includes(status)) {
    res.status(400).json({ success: false, message: "Invalid resource status" });
    return;
  }

  const result = updateResourceStatus(
    req.params.name,
    status,
    Number(req.body.employeeId),
  );
  res.status(result.success ? 200 : 400).json(result);
});

router.get("/resources/:name/affected-bookings", (req, res) => {
  const employeeId = Number(req.query.employeeId);
  if (!employeeExists(employeeId)) {
    res.status(403).json({ message: "Council employee access required" });
    return;
  }
  res.json(getAffectedBookings(req.params.name));
});

router.get("/reports/utilisation", (req, res) => {
  const employeeId = Number(req.query.employeeId);
  if (!employeeExists(employeeId)) {
    res.status(403).json({ message: "Council employee access required" });
    return;
  }
  res.json(getUtilisationReport());
});

router.get("/audit", (req, res) => {
  const history = getAuditHistory(Number(req.query.employeeId));
  if (history === false) {
    res.status(403).json({ message: "Council employee access required" });
    return;
  }
  res.json(history);
});

export { router as booking };
