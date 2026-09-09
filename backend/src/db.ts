// Simple Sqlite database solution with helper functions interacting with the local database

import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data.db");

// Only creating the users table for now
db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    type TEXT,
    is_employee BOOLEAN
    )`);

// Function to store user credentials when registering
function saveUser(
  username: string,
  password: string,
  type: string,
  is_employee: boolean = false,
) {
  // if (is_employee == null) {
  //   is_employee = false
  // }
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
  console.log(user);
  if (user.length == 0) {
    return { code: "Invalid credentials" };
  }
  const record = user[0] as {
    id: number;
    username: string;
    password: string;
    is_employee: number;
  };

  if (record.password !== password) {
    return { code: "Invalid credentials" };
  }
  return {
    code: 200,

    id: record.id,
    username: record.username,
    is_employee: Boolean(record.is_employee),
  };
}

export { saveUser, logUser };
