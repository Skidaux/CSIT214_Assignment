import express from "express";
import { createRoom } from "./db.js";

const router = express.Router();

interface booking {
  name: string;
  size: number;
  location: string;
  type: string;
}

router.post("/create-room", (req, res) => {
  const room: booking = {
    name: req.body.name,
    size: req.body.size,
    location: req.body.location,
    type: req.body.type,
  };
  const status = createRoom(room);
  res.json(status);
});

export { router as booking };
