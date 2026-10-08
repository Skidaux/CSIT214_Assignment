// Entry point file of the backend
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auth } from "./auth.js";
import { booking } from "./booking.js";
import { maintenance } from "./maintenance.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const frontendDirectory = fileURLToPath(new URL("../dir", import.meta.url));

app.use(cors());
app.use(express.json());
app.use("/auth", auth);
app.use("/booking", booking);
app.use("/maintenance", maintenance);
app.get("/api", (req, res) => {
  res.send("test");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.use(express.static(frontendDirectory));
app.use((req, res, next) => {
  if (req.method !== "GET") {
    next();
    return;
  }

  res.sendFile(path.join(frontendDirectory, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.listen(PORT, () => {
  console.log(`Backend Server now running on http://localhost:${PORT}/`);
});
