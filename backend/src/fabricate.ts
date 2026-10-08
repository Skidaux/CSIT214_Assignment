// Fictional CoastLink Council data for prototype demonstrations.

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
    "14 Harbour Esplanade, Seaview",
    120,
    "facility",
    "A flexible community venue with a stage, kitchen and accessible entrance.",
    "available",
  );
  addResource.run(
    "Harbour View Meeting Room",
    "CoastLink Civic Centre, Level 1",
    18,
    "room",
    "A quiet meeting room with video conferencing and presentation facilities.",
    "available",
  );
  addResource.run(
    "Seabreeze Sports Pavilion",
    "8 Ocean Park Drive, Seabreeze",
    80,
    "facility",
    "Clubroom and covered pavilion beside the Council sports fields.",
    "available",
  );
  addResource.run(
    "Coastal Arts Studio",
    "27 Lighthouse Road, Bay Point",
    30,
    "room",
    "A light-filled studio with sinks, work benches and secure storage.",
    "maintenance",
  );
  addResource.run(
    "Mobile PA System",
    "Council Equipment Store",
    6,
    "equipment",
    "Portable speaker, microphone and stand set for community events.",
    "available",
  );
  addResource.run(
    "Folding Chairs",
    "Council Equipment Store",
    100,
    "equipment",
    "Lightweight folding chairs available individually for local events.",
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

  // Remove only records belonging to the fictional demo accounts before reseeding.
  db.prepare(
    `DELETE FROM audit_history WHERE user_id IN (?, ?, ?, ?)`,
  ).run(residentId, clubId, staffId, maintenanceId);
  db.prepare(
    `DELETE FROM maintenance WHERE reported_by IN (?, ?, ?, ?)`,
  ).run(residentId, clubId, staffId, maintenanceId);
  db.prepare(`DELETE FROM brecord WHERE user_id IN (?, ?, ?, ?)`).run(
    residentId,
    clubId,
    staffId,
    maintenanceId,
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
    "Neighbourhood preparedness workshop",
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
    "Seabreeze Sports Pavilion",
    "CoastCare volunteer appreciation afternoon",
    65,
    1,
    "pending",
    null,
  );
  addBooking.run(
    "2026-10-07T14:00:00+11:00",
    "2026-10-29T18:00:00+11:00",
    "2026-10-29T20:00:00+11:00",
    residentId,
    "Harbour View Meeting Room",
    "Residents association meeting",
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
    "Mobile PA System",
    "Audio equipment for the preparedness workshop",
    1,
    2,
    "approved",
    staffId,
  );
  addBooking.run(
    "2026-10-05T16:20:00+11:00",
    "2026-10-12T10:00:00+11:00",
    "2026-10-12T11:00:00+11:00",
    clubId,
    "Harbour View Meeting Room",
    "Planning meeting",
    8,
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
      "Coastal Arts Studio",
      residentId,
      maintenanceId,
      "The rear sink is leaking and the floor requires inspection.",
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
      "One ceiling light near the kitchen is flickering.",
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
    "Seabreeze Sports Pavilion",
    "2026-10-08T10:30:00+11:00",
  );
  addAudit.run(
    residentId,
    "reported",
    "maintenance",
    String(artsMaintenance.lastInsertRowid),
    "Coastal Arts Studio",
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
  console.log("CoastLink mock data created successfully.");
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
