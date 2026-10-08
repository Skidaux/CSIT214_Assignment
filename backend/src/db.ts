// Simple SQLite database solution with helper functions interacting with the local database

import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(process.env.DATABASE_PATH ?? "data.db");

db.exec("PRAGMA foreign_keys = ON;");

db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL,
    is_employee BOOLEAN DEFAULT FALSE
  )`);

// The existing booking table stores the rooms, facilities and equipment that can be booked.
db.exec(`CREATE TABLE IF NOT EXISTS booking (
    name TEXT PRIMARY KEY UNIQUE,
    location TEXT NOT NULL,
    size INTEGER NOT NULL CHECK (size > 0),
    type TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'available'
      CHECK (status IN ('available', 'closed', 'maintenance'))
  )`);

// Booking requests and reservations are stored in brecord.
db.exec(`CREATE TABLE IF NOT EXISTS brecord (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booked_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    booking_name TEXT NOT NULL,
    purpose TEXT,
    attendees INTEGER NOT NULL DEFAULT 1 CHECK (attendees > 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by INTEGER,
    CHECK (datetime(to_date) > datetime(from_date)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_name) REFERENCES booking(name) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
  )`);

// Maintenance reports can be assigned to a Council employee and tracked to completion.
db.exec(`CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_name TEXT NOT NULL,
    reported_by INTEGER NOT NULL,
    assigned_to INTEGER,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium'
      CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'reported'
      CHECK (status IN ('reported', 'assigned', 'in_progress', 'completed', 'cancelled')),
    reported_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_date TEXT,
    FOREIGN KEY (booking_name) REFERENCES booking(name) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
  )`);

// Important booking, facility and maintenance actions can be recorded here.
db.exec(`CREATE TABLE IF NOT EXISTS audit_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    details TEXT,
    action_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);

db.exec(`CREATE INDEX IF NOT EXISTS brecord_booking_dates
  ON brecord (booking_name, from_date, to_date)`);
db.exec(`CREATE INDEX IF NOT EXISTS brecord_user
  ON brecord (user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS maintenance_booking
  ON maintenance (booking_name)`);

interface BookingResource {
  name: string;
  size: number;
  location: string;
  type: string;
  description?: string | undefined;
  status?: "available" | "closed" | "maintenance" | undefined;
}

interface BookingRequest {
  userId: number;
  bookingName: string;
  fromDate: string;
  toDate: string;
  purpose?: string | undefined;
  attendees?: number | undefined;
  quantity?: number | undefined;
}

interface ResourceFilters {
  search?: string | undefined;
  type?: string | undefined;
  status?: string | undefined;
}

interface MaintenanceReport {
  bookingName: string;
  reportedBy: number;
  description: string;
  priority?: "low" | "medium" | "high" | "urgent" | undefined;
}

function recordAudit(
  userId: number | null,
  action: string,
  recordType: string,
  recordId: string | number,
  details?: string,
) {
  db.prepare(
    `INSERT INTO audit_history
      (user_id, action, record_type, record_id, details)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(userId, action, recordType, String(recordId), details ?? null);
}

function employeeExists(userId: number) {
  return Boolean(
    db
      .prepare(`SELECT id FROM users WHERE id = ? AND is_employee = 1`)
      .get(userId),
  );
}

// Function to store user credentials when registering
function saveUser(
  username: string,
  password: string,
  type: string,
  is_employee: boolean = false,
) {
  try {
    const result = db
      .prepare(
        `INSERT INTO users (username, password, type, is_employee) VALUES (?, ?, ?, ?);`,
      )
      .run(username, password, type, Number(is_employee));
    return result.lastInsertRowid as number;
  } catch (err) {
    console.log(err);
    return false;
  }
}

// Function to authenticate user
function logUser(username: string, password: string) {
  const user = db
    .prepare(`SELECT * FROM users WHERE username = ?`)
    .all(username);
  if (user.length == 0) {
    return { code: "Invalid credentials" };
  }
  const record = user[0] as {
    id: number;
    username: string;
    password: string;
    type: string;
    is_employee: number;
  };

  if (record.password !== password) {
    return { code: "Invalid credentials" };
  }
  return {
    code: 200,
    id: record.id,
    username: record.username,
    type: record.type,
    is_employee: Boolean(record.is_employee),
  };
}

// Function to add a room, facility or equipment item
function createRoom(resource: BookingResource, userId: number | null = null) {
  try {
    const result = db
      .prepare(
        `INSERT INTO booking (name, size, location, type, description, status)
         VALUES (?, ?, ?, ?, ?, ?);`,
      )
      .run(
        resource.name,
        resource.size,
        resource.location,
        resource.type,
        resource.description ?? null,
        resource.status ?? "available",
      );
    recordAudit(userId, "created", "resource", resource.name);
    return result.lastInsertRowid as number;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getBookingResources(filters: ResourceFilters = {}) {
  const search = `%${filters.search ?? ""}%`;
  const type = filters.type ?? "";
  const status = filters.status ?? "";

  return db
    .prepare(
      `SELECT * FROM booking
       WHERE (name LIKE ? OR location LIKE ? OR description LIKE ?)
       AND (? = '' OR type = ?)
       AND (? = '' OR status = ?)
       ORDER BY name`,
    )
    .all(search, search, search, type, type, status, status);
}

function getBookingResource(name: string) {
  return db.prepare(`SELECT * FROM booking WHERE name = ?`).get(name);
}

function bookingConflict(
  bookingName: string,
  fromDate: string,
  toDate: string,
) {
  return db
    .prepare(
      `SELECT id FROM brecord
       WHERE booking_name = ?
       AND status IN ('pending', 'approved')
       AND from_date < ?
       AND to_date > ?
       LIMIT 1`,
    )
    .get(bookingName, toDate, fromDate);
}

function checkAvailability(
  bookingName: string,
  fromDate: string,
  toDate: string,
  quantity = 1,
) {
  const resource = db
    .prepare(`SELECT * FROM booking WHERE name = ?`)
    .get(bookingName) as
    | { size: number; status: string; type: string }
    | undefined;
  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (!resource) return { available: false, message: "Resource not found" };
  if (resource.status !== "available") {
    return { available: false, message: "Resource is currently unavailable" };
  }
  if (
    Number.isNaN(start.valueOf()) ||
    Number.isNaN(end.valueOf()) ||
    end <= start
  ) {
    return { available: false, message: "Invalid booking dates" };
  }

  if (resource.type.toLowerCase() !== "equipment") {
    const conflict = bookingConflict(bookingName, fromDate, toDate);
    return {
      available: !conflict,
      remaining: conflict ? 0 : 1,
      message: conflict ? "This time conflicts with another booking" : undefined,
    };
  }

  const result = db
    .prepare(
      `SELECT COALESCE(SUM(quantity), 0) AS reserved
       FROM brecord
       WHERE booking_name = ?
       AND status IN ('pending', 'approved')
       AND from_date < ?
       AND to_date > ?`,
    )
    .get(bookingName, toDate, fromDate) as { reserved: number };
  const remaining = resource.size - result.reserved;

  return {
    available: quantity > 0 && quantity <= remaining,
    remaining,
    message:
      quantity > remaining
        ? `Only ${remaining} item${remaining === 1 ? "" : "s"} available`
        : undefined,
  };
}

function createBooking(request: BookingRequest) {
  const resource = db
    .prepare(`SELECT * FROM booking WHERE name = ?`)
    .get(request.bookingName) as
    | { size: number; status: string; type: string }
    | undefined;

  if (!resource) return { success: false, message: "Resource not found" };
  const fromDate = new Date(request.fromDate);
  const toDate = new Date(request.toDate);
  if (
    Number.isNaN(fromDate.valueOf()) ||
    Number.isNaN(toDate.valueOf()) ||
    toDate <= fromDate
  ) {
    return { success: false, message: "Invalid booking dates" };
  }
  const requestedAmount =
    resource.type.toLowerCase() === "equipment"
      ? (request.quantity ?? 1)
      : (request.attendees ?? 1);
  if (!Number.isInteger(requestedAmount) || requestedAmount < 1) {
    return { success: false, message: "Invalid booking quantity" };
  }
  if (
    resource.type.toLowerCase() !== "equipment" &&
    requestedAmount > resource.size
  ) {
    return { success: false, message: "Booking exceeds the available capacity" };
  }
  const availability = checkAvailability(
    request.bookingName,
    request.fromDate,
    request.toDate,
    request.quantity ?? 1,
  );
  if (!availability.available) {
    return { success: false, message: availability.message ?? "Not available" };
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO brecord
          (from_date, to_date, user_id, booking_name, purpose, attendees, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
      )
      .run(
        request.fromDate,
        request.toDate,
        request.userId,
        request.bookingName,
        request.purpose ?? null,
        request.attendees ?? 1,
        request.quantity ?? 1,
      );
    const id = Number(result.lastInsertRowid);
    recordAudit(request.userId, "requested", "booking", id);
    return { success: true, id };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Unable to create booking" };
  }
}

function getUserBookings(userId: number) {
  return db
    .prepare(
      `SELECT brecord.*, booking.location, booking.type
       FROM brecord
       JOIN booking ON booking.name = brecord.booking_name
       WHERE brecord.user_id = ?
       ORDER BY brecord.from_date`,
    )
    .all(userId);
}

function getBookingRequests(status?: string) {
  return db
    .prepare(
      `SELECT
        brecord.*,
        users.username,
        booking.location,
        booking.type
       FROM brecord
       JOIN users ON users.id = brecord.user_id
       JOIN booking ON booking.name = brecord.booking_name
       WHERE (? = '' OR brecord.status = ?)
       ORDER BY brecord.booked_date DESC`,
    )
    .all(status ?? "", status ?? "");
}

function updateBookingStatus(
  bookingId: number,
  status: "approved" | "rejected",
  employeeId: number,
) {
  if (!employeeExists(employeeId)) {
    return { success: false, message: "Council employee access required" };
  }

  const booking = db
    .prepare(`SELECT * FROM brecord WHERE id = ?`)
    .get(bookingId) as { id: number; status: string } | undefined;
  if (!booking) return { success: false, message: "Booking not found" };
  if (booking.status !== "pending") {
    return { success: false, message: "Only pending bookings can be reviewed" };
  }

  db.prepare(
    `UPDATE brecord SET status = ?, approved_by = ? WHERE id = ?`,
  ).run(status, employeeId, bookingId);
  recordAudit(employeeId, status, "booking", bookingId);
  return { success: true };
}

function cancelBooking(bookingId: number, userId: number) {
  const booking = db
    .prepare(`SELECT * FROM brecord WHERE id = ?`)
    .get(bookingId) as
    | { id: number; user_id: number; status: string }
    | undefined;
  if (!booking) return { success: false, message: "Booking not found" };
  if (booking.user_id !== userId && !employeeExists(userId)) {
    return { success: false, message: "You cannot cancel this booking" };
  }
  if (!["pending", "approved"].includes(booking.status)) {
    return { success: false, message: "Booking cannot be cancelled" };
  }

  db.prepare(`UPDATE brecord SET status = 'cancelled' WHERE id = ?`).run(
    bookingId,
  );
  recordAudit(userId, "cancelled", "booking", bookingId);
  return { success: true };
}

function getAffectedBookings(bookingName: string) {
  return db
    .prepare(
      `SELECT brecord.*, users.username
       FROM brecord
       JOIN users ON users.id = brecord.user_id
       WHERE booking_name = ?
       AND status IN ('pending', 'approved')
       AND datetime(to_date) >= datetime('now')
       ORDER BY from_date`,
    )
    .all(bookingName);
}

function updateResourceStatus(
  bookingName: string,
  status: "available" | "closed" | "maintenance",
  employeeId: number,
) {
  if (!employeeExists(employeeId)) {
    return { success: false, message: "Council employee access required" };
  }

  const result = db
    .prepare(`UPDATE booking SET status = ? WHERE name = ?`)
    .run(status, bookingName);
  if (result.changes === 0) {
    return { success: false, message: "Resource not found" };
  }

  recordAudit(employeeId, "status_changed", "resource", bookingName, status);
  return {
    success: true,
    affectedBookings:
      status === "available" ? [] : getAffectedBookings(bookingName),
  };
}

function reportMaintenance(report: MaintenanceReport) {
  const resource = getBookingResource(report.bookingName);
  if (!resource) return { success: false, message: "Resource not found" };
  if (!report.description.trim()) {
    return { success: false, message: "Description is required" };
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO maintenance
          (booking_name, reported_by, description, priority)
         VALUES (?, ?, ?, ?)`,
      )
      .run(
        report.bookingName,
        report.reportedBy,
        report.description.trim(),
        report.priority ?? "medium",
      );
    const id = Number(result.lastInsertRowid);
    recordAudit(report.reportedBy, "reported", "maintenance", id);
    return { success: true, id };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Unable to report maintenance issue" };
  }
}

function getMaintenanceReports(status?: string) {
  return db
    .prepare(
      `SELECT
        maintenance.*,
        reporter.username AS reporter_name,
        assignee.username AS assigned_name
       FROM maintenance
       JOIN users AS reporter ON reporter.id = maintenance.reported_by
       LEFT JOIN users AS assignee ON assignee.id = maintenance.assigned_to
       WHERE (? = '' OR maintenance.status = ?)
       ORDER BY maintenance.reported_date DESC`,
    )
    .all(status ?? "", status ?? "");
}

function assignMaintenance(
  maintenanceId: number,
  assignedTo: number,
  employeeId: number,
) {
  if (!employeeExists(employeeId) || !employeeExists(assignedTo)) {
    return { success: false, message: "Council employee access required" };
  }

  const result = db
    .prepare(
      `UPDATE maintenance
       SET assigned_to = ?, status = 'assigned'
       WHERE id = ? AND status NOT IN ('completed', 'cancelled')`,
    )
    .run(assignedTo, maintenanceId);
  if (result.changes === 0) {
    return { success: false, message: "Maintenance report cannot be assigned" };
  }

  recordAudit(employeeId, "assigned", "maintenance", maintenanceId);
  return { success: true };
}

function updateMaintenanceStatus(
  maintenanceId: number,
  status: "reported" | "assigned" | "in_progress" | "completed" | "cancelled",
  employeeId: number,
) {
  if (!employeeExists(employeeId)) {
    return { success: false, message: "Council employee access required" };
  }

  const result = db
    .prepare(
      `UPDATE maintenance
       SET status = ?,
           completed_date = CASE
             WHEN ? = 'completed' THEN CURRENT_TIMESTAMP
             ELSE completed_date
           END
       WHERE id = ?`,
    )
    .run(status, status, maintenanceId);
  if (result.changes === 0) {
    return { success: false, message: "Maintenance report not found" };
  }

  recordAudit(employeeId, status, "maintenance", maintenanceId);
  return { success: true };
}

function getUtilisationReport() {
  return db
    .prepare(
      `SELECT
        booking.name,
        booking.type,
        booking.location,
        COUNT(brecord.id) AS approved_bookings,
        ROUND(
          COALESCE(SUM((julianday(brecord.to_date) - julianday(brecord.from_date)) * 24), 0),
          2
        ) AS booked_hours,
        COALESCE(SUM(brecord.quantity), 0) AS items_reserved
       FROM booking
       LEFT JOIN brecord
         ON brecord.booking_name = booking.name
         AND brecord.status = 'approved'
       GROUP BY booking.name
       ORDER BY approved_bookings DESC, booking.name`,
    )
    .all();
}

function getAuditHistory(employeeId: number) {
  if (!employeeExists(employeeId)) return false;

  return db
    .prepare(
      `SELECT audit_history.*, users.username
       FROM audit_history
       LEFT JOIN users ON users.id = audit_history.user_id
       ORDER BY action_date DESC, audit_history.id DESC`,
    )
    .all();
}

export {
  assignMaintenance,
  bookingConflict,
  cancelBooking,
  checkAvailability,
  createBooking,
  createRoom,
  getAffectedBookings,
  getAuditHistory,
  getBookingRequests,
  getBookingResource,
  getBookingResources,
  getMaintenanceReports,
  getUtilisationReport,
  getUserBookings,
  employeeExists,
  logUser,
  reportMaintenance,
  saveUser,
  updateBookingStatus,
  updateMaintenanceStatus,
  updateResourceStatus,
};
