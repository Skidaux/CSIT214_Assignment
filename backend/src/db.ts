// Simple Sqlite database solution with helper functions interacting with the local database

import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data.db");

// Only creating the users table for now
db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
    )`);

// Function to store user credentials when registering
function saveUser(username: string, password: string) {
  try {
    db.prepare(`INSERT INTO users (username, password) VALUES (?, ?);`).run(
      username,
      password,
    );
    return true;
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
  console.log(user);
  if (user.length == 0) {
    return { code: "Invalid credentials" };
  }
  const record = user[0] as { id: number; username: string; password: string };

  if (record.password !== password) {
    return { code: "Invalid credentials" };
  }
  return {
    code: "Authenticated",
    user: { id: record.id, username: record.username },
  };
}

export { saveUser, logUser };
