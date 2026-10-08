// auth.ts file to create API endpoints for the frontend to authenticate
import express from "express";
import { saveUser, logUser } from "./db.js";
const router = express.Router();

interface Login {
  username: string;
  password: string;
}

interface Register {
  username: string;
  password: string;
  uType: string;
  employee?: boolean;
}

router.post("/login", (req, res) => {
  if (
    typeof req.body.username !== "string" ||
    typeof req.body.password !== "string" ||
    !req.body.username.trim() ||
    !req.body.password
  ) {
    res.status(400).json({ code: 400, message: "Username and password are required" });
    return;
  }

  const user: Login = {
    username: req.body.username.trim(),
    password: req.body.password,
  };
  const status = logUser(user.username, user.password);
  if (status.code !== 200) {
    res.status(401).json({ code: 401, message: status.code });
    return;
  }
  res.json(status);
});

router.post("/register", (req, res) => {
  if (
    typeof req.body.username !== "string" ||
    typeof req.body.password !== "string" ||
    typeof req.body.type !== "string" ||
    !req.body.username.trim() ||
    !req.body.password ||
    !["individual", "business"].includes(req.body.type)
  ) {
    res.status(400).json({ code: 400, message: "Invalid registration details" });
    return;
  }

  const user: Register = {
    username: req.body.username.trim(),
    password: req.body.password,
    uType: req.body.type,
    employee: req.body.is_employee,
  };
  const id = saveUser(user.username, user.password, user.uType, user.employee);
  if (id !== false) {
    res.json({
      id,
      username: user.username,
      type: user.uType,
      isEmployee: user.employee,
      code: 200,
    });
  } else {
    res.status(409).json({
      code: 409,
      message: "Username is already in use",
    });
  }
});

export { router as auth };
