// auth.ts file to create API endpoints for the frontend to authenticate
import express from "express";
import { saveUser, logUser } from "./db.js";
const router = express.Router();

interface User {
  username: string;
  password: string;
  employee?: boolean;
}

router.get("/test", (req, res) => {
  console.log("testing pleae");
  res.send("did you recieve it?????");
});

router.post("/login", (req, res) => {
  const user: User = {
    username: req.body.username,
    password: req.body.password,
  };
  console.log(user);
  logUser(user.username, user.password);
  res.json({ code: 200 });
});

router.post("/register", (req, res) => {
  const user: User = {
    username: req.body.username,
    password: req.body.password,
    employee: req.body.employee,
  };
  saveUser(user.username, user.password);
  res.json({
    username: user.username,
    password: user.password,
    isEmployee: user.employee,
    code: 200,
  });
});

export { router as auth };
