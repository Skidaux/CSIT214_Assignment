// Simple sample data for the prototype.

import "./db.js";
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(process.env.DATABASE_PATH ?? "data.db");
db.exec("PRAGMA foreign_keys = ON;");

db.exec("BEGIN;");

try {
  const addUser = db.prepare(`
    INSERT INTO users (username, password, type, is_employee)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
      password = excluded.password,
      type = excluded.type,
      is_employee = excluded.is_employee
  `);

  addUser.run("coastal_resident", "demo123", "individual", 0);
  addUser.run("coastcare_club", "demo123", "business", 0);
  addUser.run("council_staff", "staff123", "individual", 1);
  addUser.run("maintenance_team", "staff123", "business", 1);

  // Start with a predictable set of sample resources and activity.
  db.exec(`
    DELETE FROM audit_history;
    DELETE FROM maintenance;
    DELETE FROM brecord;
    DELETE FROM booking;
  `);

  const addResource = db.prepare(`
    INSERT INTO booking (name, location, size, type, description, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      location = excluded.location,
      size = excluded.size,
      type = excluded.type,
      description = excluded.description,
      status = excluded.status
  `);

  addResource.run(
    "CoastLink Community Hall",
    "Moore Street, Liverpool NSW 2170",
    120,
    "facility",
    "Large hall with a kitchen and stage.",
    "available",
  );
  addResource.run(
    "Casula Art Studio",
    "Powerhouse Road, Casula NSW 2170",
    24,
    "room",
    "Art studio with sinks and work benches.",
    "available",
  );
  addResource.run(
    "Miller Music Studio",
    "Woodward Crescent, Miller NSW 2168",
    12,
    "room",
    "Small studio for music practice.",
    "available",
  );
  addResource.run(
    "Green Valley Dance Studio",
    "Wilson Road, Green Valley NSW 2168",
    35,
    "room",
    "Open studio with mirrors and speakers.",
    "available",
  );
  addResource.run(
    "Moorebank Workshop",
    "Newbridge Road, Moorebank NSW 2170",
    20,
    "room",
    "Workshop room with benches and basic tools.",
    "available",
  );
  addResource.run(
    "Prestons Craft Workshop",
    "Kurrajong Road, Prestons NSW 2170",
    18,
    "room",
    "Simple workshop space for craft activities.",
    "maintenance",
  );
  addResource.run(
    "Liverpool Meeting Room",
    "George Street, Liverpool NSW 2170",
    16,
    "room",
    "Meeting room with a screen and whiteboard.",
    "available",
  );
  addResource.run(
    "Folding Chairs",
    "Council Store, Liverpool NSW 2170",
    100,
    "equipment",
    "Folding chairs for meetings and events.",
    "available",
  );
  addResource.run(
    "Foldable Tables",
    "Council Store, Liverpool NSW 2170",
    30,
    "equipment",
    "Foldable tables for meetings and events.",
    "available",
  );
  addResource.run(
    "PA System",
    "Council Store, Liverpool NSW 2170",
    6,
    "equipment",
    "Portable speaker and microphone set.",
    "available",
  );

  const getUserId = db.prepare(`SELECT id FROM users WHERE username = ?`);
  const residentId = Number(
    (getUserId.get("coastal_resident") as { id: number }).id,
  );
  const clubId = Number((getUserId.get("coastcare_club") as { id: number }).id);
  const staffId = Number((getUserId.get("council_staff") as { id: number }).id);
  const maintenanceId = Number(
    (getUserId.get("maintenance_team") as { id: number }).id,
  );

  const addBooking = db.prepare(`
    INSERT INTO brecord
      (booked_date, from_date, to_date, user_id, booking_name, purpose,
       attendees, quantity, status, approved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const approvedHall = addBooking.run(
    "2026-10-08T09:15:00+11:00",
    "2026-10-17T09:00:00+11:00",
    "2026-10-17T12:00:00+11:00",
    residentId,
    "CoastLink Community Hall",
    "Birthday party",
    45,
    1,
    "approved",
    staffId,
  );
  const pendingPavilion = addBooking.run(
    "2026-10-08T10:30:00+11:00",
    "2026-10-24T13:00:00+11:00",
    "2026-10-24T17:00:00+11:00",
    clubId,
    "Moorebank Workshop",
    "Woodwork class",
    16,
    1,
    "pending",
    null,
  );
  addBooking.run(
    "2026-10-07T14:00:00+11:00",
    "2026-10-29T18:00:00+11:00",
    "2026-10-29T20:00:00+11:00",
    residentId,
    "Casula Art Studio",
    "Painting class",
    14,
    1,
    "pending",
    null,
  );
  addBooking.run(
    "2026-10-06T11:00:00+11:00",
    "2026-10-17T08:00:00+11:00",
    "2026-10-17T13:00:00+11:00",
    residentId,
    "Foldable Tables",
    "Tables for the hall booking",
    1,
    8,
    "approved",
    staffId,
  );
  addBooking.run(
    "2026-10-05T16:20:00+11:00",
    "2026-10-12T10:00:00+11:00",
    "2026-10-12T11:00:00+11:00",
    clubId,
    "Miller Music Studio",
    "Band practice",
    6,
    1,
    "cancelled",
    null,
  );

  const artsMaintenance = db
    .prepare(
      `INSERT INTO maintenance
        (booking_name, reported_by, assigned_to, description, priority,
         status, reported_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "Prestons Craft Workshop",
      residentId,
      maintenanceId,
      "One work bench is loose.",
      "high",
      "in_progress",
      "2026-10-07T15:40:00+11:00",
    );
  const hallMaintenance = db
    .prepare(
      `INSERT INTO maintenance
        (booking_name, reported_by, description, priority, status, reported_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "CoastLink Community Hall",
      clubId,
      "A light near the kitchen is flickering.",
      "low",
      "reported",
      "2026-10-08T11:10:00+11:00",
    );

  const addAudit = db.prepare(`
    INSERT INTO audit_history
      (user_id, action, record_type, record_id, details, action_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  addAudit.run(
    residentId,
    "requested",
    "booking",
    String(approvedHall.lastInsertRowid),
    "CoastLink Community Hall",
    "2026-10-08T09:15:00+11:00",
  );
  addAudit.run(
    staffId,
    "approved",
    "booking",
    String(approvedHall.lastInsertRowid),
    null,
    "2026-10-08T09:42:00+11:00",
  );
  addAudit.run(
    clubId,
    "requested",
    "booking",
    String(pendingPavilion.lastInsertRowid),
    "Moorebank Workshop",
    "2026-10-08T10:30:00+11:00",
  );
  addAudit.run(
    residentId,
    "reported",
    "maintenance",
    String(artsMaintenance.lastInsertRowid),
    "Prestons Craft Workshop",
    "2026-10-07T15:40:00+11:00",
  );
  addAudit.run(
    clubId,
    "reported",
    "maintenance",
    String(hallMaintenance.lastInsertRowid),
    "CoastLink Community Hall",
    "2026-10-08T11:10:00+11:00",
  );

  db.exec("COMMIT;");
  console.log("Sample data created.");
  console.log("Resident: coastal_resident / demo123");
  console.log("Business: coastcare_club / demo123");
  console.log("Staff: council_staff / staff123");
  console.log("Maintenance: maintenance_team / staff123");
} catch (error) {
  db.exec("ROLLBACK;");
  throw error;
} finally {
  db.close();
}
