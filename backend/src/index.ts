// Entry point file of the backend
import express from "express";
import cors from "cors";
import { auth } from "./auth.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/auth", auth);
app.get("/api", (req, res) => {
  res.send("test");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
  console.log(`Backend Server now running on http://localhost:${PORT}/`);
});
