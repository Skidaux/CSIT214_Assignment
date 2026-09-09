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

router.get("/test", (req, res) => {
  console.log("testing pleae");
  res.send("did you recieve it?????");
});

router.post("/login", (req, res) => {
  const user: Login = {
    username: req.body.username,
    password: req.body.password,
  };
  console.log(user);
  const status = logUser(user.username, user.password);
  res.json(status);
});

router.post("/register", (req, res) => {
  const user: Register = {
    username: req.body.username,
    password: req.body.password,
    uType: req.body.type,
    employee: req.body.is_employee,
  };
  const id = saveUser(user.username, user.password, user.uType, user.employee);
  if (id !== false) {
    res.json({
      id,
      username: user.username,
      password: user.password,
      type: user.uType,
      isEmployee: user.employee,
      code: 200,
    });
    console.log(user);
  } else
    res.json({
      code: 400,
    });
});

export { router as auth };
